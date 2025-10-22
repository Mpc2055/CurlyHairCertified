import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, desc, sql as drizzleSql, and, arrayContains, ilike, inArray } from 'drizzle-orm';
import {
  salons,
  stylists,
  certifications,
  stylistCertifications,
  topics,
  replies,
  type InsertTopic,
  type InsertReply,
  type SelectTopic,
  type SelectReply,
} from '../shared/schema';
import type { DirectoryData, Salon, Stylist, Certification } from '../shared/schema';
import { geocodeAddress } from './geocoding';
import { findPlaceId, getPlaceDetails } from './google-places';
import { generateStylistSummary, validateSummary, type StylistData } from './gemini-ai';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql);

// Constants
const GOOGLE_SYNC_INTERVAL_DAYS = 7;
const AI_SUMMARY_REFRESH_DAYS = 30;

// Helper to normalize Instagram handles
function normalizeInstagram(handle: string | null | undefined): string | undefined {
  if (!handle) return undefined;
  const trimmed = handle.trim();
  if (!trimmed) return undefined;
  
  // Handle multiple Instagram handles separated by |
  const handles = trimmed.split('|').map(h => h.trim());
  const primaryHandle = handles[0];
  
  // Add @ prefix if missing
  return primaryHandle.startsWith('@') ? primaryHandle : `@${primaryHandle}`;
}

export interface TopicWithReplies extends SelectTopic {
  replies: ReplyWithChildren[];
}

export interface ReplyWithChildren extends SelectReply {
  children: SelectReply[];
}

export interface MentionStats {
  stylistId: string;
  stylistName: string;
  mentionCount: number;
  recentTopics: { id: number; title: string; createdAt: Date }[];
}

export interface IStorage {
  getDirectory(): Promise<DirectoryData>;

  // Forum operations
  createTopic(topic: InsertTopic): Promise<SelectTopic>;
  getTopics(options: {
    sortBy?: 'recent' | 'replies' | 'newest';
    tags?: string[];
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<SelectTopic[]>;
  getTopicById(id: number): Promise<TopicWithReplies | null>;
  createReply(reply: InsertReply): Promise<SelectReply>;
  flagContent(contentType: 'topic' | 'reply', contentId: number): Promise<void>;
  upvoteTopic(topicId: number): Promise<void>;
  getMentionAnalytics(): Promise<MentionStats[]>;

  // AI Summary operations
  shouldGenerateAISummary(stylistId: string): Promise<boolean>;
  generateAISummaryForStylist(stylistId: string): Promise<{ success: boolean; summary?: string; error?: string }>;
  generateAISummariesBatch(stylistIds?: string[]): Promise<{ generated: number; skipped: number; errors: number }>;
}

export class PostgresStorage implements IStorage {
  async getDirectory(): Promise<DirectoryData> {
    try {
      // 1. Fetch all certifications
      const allCertifications = await db.select().from(certifications);

      // 2. Fetch all salons
      const allSalons = await db.select().from(salons);

      // 3. Fetch all stylists
      const allStylists = await db.select().from(stylists);

      // 4. Fetch all stylist-certification relationships
      const allStylistCerts = await db.select().from(stylistCertifications);

      // 5. Build certification lookup map
      const certMap = new Map<string, Certification>();
      for (const cert of allCertifications) {
        certMap.set(cert.id, {
          id: cert.id,
          name: cert.name,
          level: cert.level || undefined,
          organization: cert.organization || undefined,
          description: cert.description || undefined,
        });
      }

      // 6. Build stylist lookup map with their certifications
      const stylistMap = new Map<string, Stylist>();
      for (const stylist of allStylists) {
        // Get certifications for this stylist
        const stylistCertIds = allStylistCerts
          .filter(sc => sc.stylistId === stylist.id)
          .map(sc => sc.certificationId);

        const stylistCerts = stylistCertIds
          .map(certId => certMap.get(certId))
          .filter((cert): cert is Certification => cert !== undefined);

        stylistMap.set(stylist.id, {
          id: stylist.id,
          name: stylist.name,
          phone: stylist.phone || undefined,
          email: stylist.email || undefined,
          website: stylist.website || undefined,
          instagram: normalizeInstagram(stylist.instagram),
          photo: stylist.profilePhoto || undefined,
          verified: stylist.verified,
          canBookOnline: stylist.canBookOnline,
          price: stylist.curlyCutPrice ? parseFloat(stylist.curlyCutPrice) : undefined,
          certifications: stylistCerts,
        });
      }

      // 7. Build salons with their stylists, geocode addresses if needed
      const salonResults: Salon[] = [];

      for (const salon of allSalons) {
        // Get stylists for this salon
        const salonStylists = allStylists
          .filter(s => s.salonId === salon.id)
          .map(s => stylistMap.get(s.id))
          .filter((stylist): stylist is Stylist => stylist !== undefined);

        // Skip salons with no stylists
        if (salonStylists.length === 0) {
          continue;
        }

        // Geocode if coordinates are missing
        let lat = salon.lat ? parseFloat(salon.lat) : null;
        let lng = salon.lng ? parseFloat(salon.lng) : null;

        if (lat === null || lng === null) {
          try {
            const coords = await geocodeAddress(salon.fullAddress);
            if (coords) {
              lat = coords.lat;
              lng = coords.lng;

              // Update database with geocoded coordinates
              await db
                .update(salons)
                .set({ lat: lat.toString(), lng: lng.toString() })
                .where(eq(salons.id, salon.id));
            }
          } catch (error) {
            console.error(`[storage] Failed to geocode salon ${salon.name}:`, error);
          }
        }

        // Sync Google Place data if needed
        await this.syncGooglePlaceData(salon);

        // Only include salons with valid coordinates
        if (lat !== null && lng !== null) {
          salonResults.push({
            id: salon.id,
            name: salon.name,
            address: [
              salon.streetAddress,
              salon.suiteUnit,
              `${salon.city}, ${salon.state} ${salon.zipCode}`
            ].filter(Boolean).join(', '),
            city: salon.city,
            state: salon.state,
            zip: salon.zipCode,
            phone: salon.phone || undefined,
            website: salon.website || undefined,
            photo: salon.photo || undefined,
            lat,
            lng,
            // Google Places data
            googlePlaceId: salon.googlePlaceId || undefined,
            googleRating: salon.googleRating ? parseFloat(salon.googleRating) : undefined,
            googleReviewCount: salon.googleReviewCount || undefined,
            googleReviewsUrl: salon.googleReviewsUrl || undefined,
            stylists: salonStylists,
          });
        }
      }

      return {
        salons: salonResults,
        certifications: Array.from(certMap.values()),
      };
    } catch (error) {
      console.error('[storage] Error fetching directory data:', error);
      throw error;
    }
  }

  async createTopic(topic: InsertTopic): Promise<SelectTopic> {
    const [newTopic] = await db.insert(topics).values(topic).returning();
    return newTopic;
  }

  async getTopics(options: {
    sortBy?: 'recent' | 'replies' | 'newest';
    tags?: string[];
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<SelectTopic[]> {
    // Build where conditions
    const conditions = [];
    
    // Filter out flagged content (flag_count >= 5)
    conditions.push(drizzleSql`${topics.flagCount} < 5`);

    // Tag filtering
    if (options.tags && options.tags.length > 0) {
      conditions.push(drizzleSql`${topics.tags} && ARRAY[${drizzleSql.join(
        options.tags.map(tag => drizzleSql`${tag}`),
        drizzleSql`, `
      )}]::text[]`);
    }

    // Search filtering
    if (options.search) {
      conditions.push(
        drizzleSql`(${topics.title} ILIKE ${'%' + options.search + '%'} OR ${topics.content} ILIKE ${'%' + options.search + '%'})`
      );
    }

    // Build query with all conditions
    let query = db
      .select()
      .from(topics)
      .where(drizzleSql`${drizzleSql.join(conditions, drizzleSql` AND `)}`);

    // Add sorting
    if (options.sortBy === 'replies') {
      query = query.orderBy(desc(topics.repliesCount), desc(topics.updatedAt)) as any;
    } else if (options.sortBy === 'newest') {
      query = query.orderBy(desc(topics.createdAt)) as any;
    } else {
      query = query.orderBy(desc(topics.updatedAt)) as any;
    }

    // Add pagination
    if (options.limit) {
      query = query.limit(options.limit) as any;
    }
    if (options.offset) {
      query = query.offset(options.offset) as any;
    }

    return await query;
  }

  async getTopicById(id: number): Promise<TopicWithReplies | null> {
    const topicResults = await db.select().from(topics).where(eq(topics.id, id));
    const topic = topicResults[0];
    if (!topic) return null;

    // Get all replies for this topic
    const allReplies = await db
      .select()
      .from(replies)
      .where(and(
        eq(replies.topicId, id),
        drizzleSql`${replies.flagCount} < 5` // Filter out flagged replies
      ))
      .orderBy(replies.createdAt);

    // Build threaded structure
    const topLevelReplies: ReplyWithChildren[] = [];
    const replyMap = new Map<number, ReplyWithChildren>();

    // First pass: create all reply objects
    for (const reply of allReplies) {
      replyMap.set(reply.id, { ...reply, children: [] });
    }

    // Second pass: build tree structure
    for (const reply of allReplies) {
      const replyWithChildren = replyMap.get(reply.id)!;
      
      if (reply.parentReplyId) {
        const parent = replyMap.get(reply.parentReplyId);
        if (parent) {
          parent.children.push(replyWithChildren);
        }
      } else {
        topLevelReplies.push(replyWithChildren);
      }
    }

    return {
      ...topic,
      replies: topLevelReplies,
    };
  }

  async createReply(reply: InsertReply): Promise<SelectReply> {
    // Validate max nesting depth (2 levels: topic -> reply -> sub-reply)
    if (reply.parentReplyId) {
      const parentReplies = await db
        .select()
        .from(replies)
        .where(eq(replies.id, reply.parentReplyId));
      
      const parentReply = parentReplies[0];
      if (parentReply && parentReply.parentReplyId) {
        throw new Error('Maximum nesting depth of 2 levels exceeded');
      }
    }

    const newReplies = await db.insert(replies).values(reply).returning();
    const newReply = newReplies[0];

    // Update topic's reply count and updated_at
    await db
      .update(topics)
      .set({
        repliesCount: drizzleSql`${topics.repliesCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(topics.id, reply.topicId));

    return newReply;
  }

  async flagContent(contentType: 'topic' | 'reply', contentId: number): Promise<void> {
    const table = contentType === 'topic' ? topics : replies;
    const idField = contentType === 'topic' ? topics.id : replies.id;
    const flagField = contentType === 'topic' ? topics.flagCount : replies.flagCount;

    await db
      .update(table)
      .set({ flagCount: drizzleSql`${flagField} + 1` })
      .where(eq(idField, contentId));
  }

  async upvoteTopic(topicId: number): Promise<void> {
    await db
      .update(topics)
      .set({ upvotesCount: drizzleSql`${topics.upvotesCount} + 1` })
      .where(eq(topics.id, topicId));
  }

  async getMentionAnalytics(): Promise<MentionStats[]> {
    // Get all topics with mentions
    const topicsWithMentions = await db
      .select()
      .from(topics)
      .where(drizzleSql`array_length(${topics.mentionedStylistIds}, 1) > 0`)
      .orderBy(desc(topics.createdAt));

    // Get all stylists for name lookup
    const allStylists = await db.select().from(stylists);
    const stylistMap = new Map(allStylists.map(s => [s.id, s.name]));

    // Build mention statistics
    const mentionCounts = new Map<string, {
      count: number;
      topics: { id: number; title: string; createdAt: Date }[];
    }>();

    for (const topic of topicsWithMentions) {
      for (const stylistId of topic.mentionedStylistIds) {
        if (!mentionCounts.has(stylistId)) {
          mentionCounts.set(stylistId, { count: 0, topics: [] });
        }
        const stats = mentionCounts.get(stylistId)!;
        stats.count++;
        stats.topics.push({
          id: topic.id,
          title: topic.title,
          createdAt: topic.createdAt,
        });
      }
    }

    // Convert to array and sort by mention count
    const results: MentionStats[] = [];
    for (const [stylistId, stats] of Array.from(mentionCounts.entries())) {
      const stylistName = stylistMap.get(stylistId) || 'Unknown';
      results.push({
        stylistId,
        stylistName,
        mentionCount: stats.count,
        recentTopics: stats.topics.slice(0, 5), // Top 5 recent mentions
      });
    }

    return results.sort((a, b) => b.mentionCount - a.mentionCount);
  }

  /**
   * Sync Google Place data for a salon if missing or stale
   */
  private async syncGooglePlaceData(salon: any): Promise<void> {
    try {
      const needsSync = this.shouldSyncGoogleData(salon);

      if (!needsSync) {
        return;
      }

      console.log(`[storage] Syncing Google Place data for: ${salon.name}`);

      // Step 1: Get Place ID if missing
      let placeId = salon.googlePlaceId;
      if (!placeId || placeId === '') {
        const result = await findPlaceId(salon.name, salon.fullAddress);
        placeId = result.placeId;

        if (!placeId) {
          console.warn(`[storage] Could not find Place ID for: ${salon.name}`);
          // Mark as attempted to avoid repeated lookups
          await db
            .update(salons)
            .set({
              googlePlaceId: 'NOT_FOUND',
              lastGoogleSync: new Date(),
            })
            .where(eq(salons.id, salon.id));
          return;
        }

        // Save Place ID
        await db
          .update(salons)
          .set({ googlePlaceId: placeId })
          .where(eq(salons.id, salon.id));

        salon.googlePlaceId = placeId;
      }

      // Step 2: Get Place Details (rating, reviews)
      if (placeId && placeId !== 'NOT_FOUND') {
        const details = await getPlaceDetails(placeId);

        if (details) {
          await db
            .update(salons)
            .set({
              googleRating: details.rating?.toString(),
              googleReviewCount: details.reviewCount,
              googleReviewsUrl: details.reviewsUrl,
              lastGoogleSync: new Date(),
            })
            .where(eq(salons.id, salon.id));

          // Update in-memory object
          salon.googleRating = details.rating?.toString();
          salon.googleReviewCount = details.reviewCount;
          salon.googleReviewsUrl = details.reviewsUrl;
          salon.lastGoogleSync = new Date();
        }
      }
    } catch (error) {
      console.error(`[storage] Error syncing Google data for ${salon.name}:`, error);
      // Don't throw - continue with other salons
    }
  }

  /**
   * Determine if salon needs Google data sync
   */
  private shouldSyncGoogleData(salon: any): boolean {
    // Never synced - needs sync
    if (!salon.googlePlaceId) {
      return true;
    }

    // Previously failed to find - don't retry
    if (salon.googlePlaceId === 'NOT_FOUND') {
      return false;
    }

    // Check if last sync was more than 7 days ago
    if (salon.lastGoogleSync) {
      const daysSinceSync = (Date.now() - new Date(salon.lastGoogleSync).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceSync > GOOGLE_SYNC_INTERVAL_DAYS;
    }

    // Has Place ID but no sync timestamp - needs sync
    return true;
  }

  /**
   * Check if an AI summary should be generated for a stylist
   * Returns true if no summary exists OR last generated >30 days ago
   */
  async shouldGenerateAISummary(stylistId: string): Promise<boolean> {
    const stylistResults = await db.select().from(stylists).where(eq(stylists.id, stylistId));
    const stylist = stylistResults[0];

    if (!stylist) {
      return false;
    }

    // No summary exists
    if (!stylist.aiSummary || !stylist.aiSummaryGeneratedAt) {
      return true;
    }

    // Check if last generated >30 days ago
    const daysSinceGeneration = (Date.now() - new Date(stylist.aiSummaryGeneratedAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceGeneration > AI_SUMMARY_REFRESH_DAYS;
  }

  /**
   * Generate AI summary for a specific stylist
   */
  async generateAISummaryForStylist(stylistId: string): Promise<{ success: boolean; summary?: string; error?: string }> {
    try {
      console.log(`[storage] Generating AI summary for stylist: ${stylistId}`);

      // Fetch stylist with all related data
      const stylistResults = await db.select().from(stylists).where(eq(stylists.id, stylistId));
      const stylist = stylistResults[0];

      if (!stylist) {
        return { success: false, error: 'Stylist not found' };
      }

      // Fetch salon
      const salonResults = await db.select().from(salons).where(eq(salons.id, stylist.salonId));
      const salon = salonResults[0];

      if (!salon) {
        return { success: false, error: 'Salon not found' };
      }

      // Fetch certifications
      const stylistCerts = await db
        .select()
        .from(stylistCertifications)
        .where(eq(stylistCertifications.stylistId, stylistId));

      const certIds = stylistCerts.map(sc => sc.certificationId);
      const certsData = certIds.length > 0
        ? await db.select().from(certifications).where(inArray(certifications.id, certIds))
        : [];

      // Prepare data for Gemini
      const stylistData: StylistData = {
        name: stylist.name,
        salonName: salon.name,
        city: salon.city,
        state: salon.state,
        phone: stylist.phone || undefined,
        email: stylist.email || undefined,
        website: stylist.website || undefined,
        instagram: stylist.instagram || undefined,
        price: stylist.curlyCutPrice ? parseFloat(stylist.curlyCutPrice) : undefined,
        certifications: certsData.map(c => c.name),
        googleRating: salon.googleRating ? parseFloat(salon.googleRating) : undefined,
        googleReviewCount: salon.googleReviewCount || undefined,
      };

      // Generate summary using Gemini
      const result = await generateStylistSummary(stylistData);

      // Validate summary
      const validation = validateSummary(result.summary);
      if (!validation.valid) {
        console.warn(`[storage] Generated summary validation warning: ${validation.reason}`);
      }

      // Update database
      await db
        .update(stylists)
        .set({
          aiSummary: result.summary,
          aiSummaryGeneratedAt: result.generatedAt,
          aiSummarySources: result.sources,
        })
        .where(eq(stylists.id, stylistId));

      console.log(`[storage] AI summary generated successfully for ${stylist.name}`);

      return {
        success: true,
        summary: result.summary,
      };
    } catch (error) {
      console.error(`[storage] Error generating AI summary for ${stylistId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate AI summaries for multiple stylists (batch operation)
   * If stylistIds is provided, only generate for those stylists
   * Otherwise, generate for all stylists that need summaries
   */
  async generateAISummariesBatch(stylistIds?: string[]): Promise<{ generated: number; skipped: number; errors: number }> {
    let targetStylists: string[];

    if (stylistIds && stylistIds.length > 0) {
      targetStylists = stylistIds;
    } else {
      // Get all stylists
      const allStylists = await db.select().from(stylists);
      targetStylists = allStylists.map(s => s.id);
    }

    console.log(`[storage] Starting batch AI summary generation for ${targetStylists.length} stylists`);

    let generated = 0;
    let skipped = 0;
    let errors = 0;

    for (const stylistId of targetStylists) {
      try {
        // Check if should generate
        const shouldGenerate = await this.shouldGenerateAISummary(stylistId);

        if (!shouldGenerate) {
          console.log(`[storage] Skipping ${stylistId} - summary is fresh (<${AI_SUMMARY_REFRESH_DAYS} days old)`);
          skipped++;
          continue;
        }

        // Generate summary
        const result = await this.generateAISummaryForStylist(stylistId);

        if (result.success) {
          generated++;
        } else {
          console.error(`[storage] Failed to generate summary for ${stylistId}: ${result.error}`);
          errors++;
        }

        // Small delay to avoid rate limits (if needed)
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`[storage] Error processing ${stylistId}:`, error);
        errors++;
      }
    }

    console.log(`[storage] Batch AI summary generation complete: ${generated} generated, ${skipped} skipped, ${errors} errors`);

    return { generated, skipped, errors };
  }
}

export const storage = new PostgresStorage();
