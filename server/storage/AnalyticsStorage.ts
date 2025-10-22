import { desc, sql as drizzleSql } from 'drizzle-orm';
import { topics, stylists } from '@shared/schema';
import { BaseStorage } from './base/BaseStorage';
import type { IAnalyticsStorage, MentionStats } from './base/types';

/**
 * Analytics storage operations
 * Handles mention analytics and trending data
 */
export class AnalyticsStorage extends BaseStorage implements IAnalyticsStorage {
  /**
   * Get mention analytics showing which stylists are being discussed
   * Returns stylists sorted by mention count with recent topics
   */
  async getMentionAnalytics(): Promise<MentionStats[]> {
    // Get all topics with mentions
    const topicsWithMentions = await this.db
      .select()
      .from(topics)
      .where(drizzleSql`array_length(${topics.mentionedStylistIds}, 1) > 0`)
      .orderBy(desc(topics.createdAt));

    // Get all stylists for name lookup
    const allStylists = await this.db.select().from(stylists);
    const stylistMap = new Map(allStylists.map(s => [s.id, s.name]));

    // Build mention statistics
    const mentionCounts = new Map<
      string,
      {
        count: number;
        topics: { id: number; title: string; createdAt: Date }[];
      }
    >();

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
}
