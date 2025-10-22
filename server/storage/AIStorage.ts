import { eq, inArray } from 'drizzle-orm';
import {
  stylists,
  salons,
  certifications,
  stylistCertifications,
} from '@shared/schema';
import { BaseStorage } from './base/BaseStorage';
import type { IAIStorage, AISummaryResult, AISummaryBatchResult } from './base/types';
import { generateStylistSummary, validateSummary, type StylistData } from '../gemini-ai';

// Constants
const AI_SUMMARY_REFRESH_DAYS = 30;

/**
 * AI storage operations
 * Handles AI summary generation for stylists
 */
export class AIStorage extends BaseStorage implements IAIStorage {
  /**
   * Check if an AI summary should be generated for a stylist
   * Returns true if no summary exists OR last generated >30 days ago
   */
  async shouldGenerateAISummary(stylistId: string): Promise<boolean> {
    const stylistResults = await this.db.select().from(stylists).where(eq(stylists.id, stylistId));
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
  async generateAISummaryForStylist(stylistId: string): Promise<AISummaryResult> {
    try {
      console.log(`[storage] Generating AI summary for stylist: ${stylistId}`);

      // Fetch stylist with all related data
      const stylistResults = await this.db.select().from(stylists).where(eq(stylists.id, stylistId));
      const stylist = stylistResults[0];

      if (!stylist) {
        return { success: false, error: 'Stylist not found' };
      }

      // Fetch salon
      const salonResults = await this.db.select().from(salons).where(eq(salons.id, stylist.salonId));
      const salon = salonResults[0];

      if (!salon) {
        return { success: false, error: 'Salon not found' };
      }

      // Fetch certifications
      const stylistCerts = await this.db
        .select()
        .from(stylistCertifications)
        .where(eq(stylistCertifications.stylistId, stylistId));

      const certIds = stylistCerts.map(sc => sc.certificationId);
      const certsData = certIds.length > 0
        ? await this.db.select().from(certifications).where(inArray(certifications.id, certIds))
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
      await this.db
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
  async generateAISummariesBatch(
    stylistIds?: string[],
    force: boolean = false
  ): Promise<AISummaryBatchResult> {
    let targetStylists: string[];

    if (stylistIds && stylistIds.length > 0) {
      targetStylists = stylistIds;
    } else {
      // Get all stylists
      const allStylists = await this.db.select().from(stylists);
      targetStylists = allStylists.map(s => s.id);
    }

    console.log(`[storage] Starting batch AI summary generation for ${targetStylists.length} stylists${force ? ' (FORCE MODE - bypassing 30-day limit)' : ''}`);

    let generated = 0;
    let skipped = 0;
    let errors = 0;

    for (const stylistId of targetStylists) {
      try {
        // Check if should generate (skip check if force=true)
        const shouldGenerate = force || await this.shouldGenerateAISummary(stylistId);

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
