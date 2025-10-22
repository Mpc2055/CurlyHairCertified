import { stylists } from '@shared/schema';
import { BaseStorage } from '../../storage/base/BaseStorage';

// Cache for stylists to avoid repeated database queries
let stylistsCache: { id: string; name: string }[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 3600000; // 1 hour in milliseconds

/**
 * Service for detecting stylist mentions in forum content
 * Extends BaseStorage for consistent database access
 */
export class MentionDetectionService extends BaseStorage {
  /**
   * Get all stylists with caching
   */
  private async getStylists(): Promise<{ id: string; name: string }[]> {
    const now = Date.now();

    // Refresh cache if expired or empty
    if (!stylistsCache || (now - cacheTimestamp) > CACHE_TTL) {
      const allStylists = await this.db.select({
        id: stylists.id,
        name: stylists.name,
      }).from(stylists);

      stylistsCache = allStylists;
      cacheTimestamp = now;
    }

    return stylistsCache;
  }

  /**
   * Normalize text for matching (lowercase, remove extra spaces)
   */
  private normalizeText(text: string): string {
    return text.toLowerCase().replace(/\s+/g, ' ').trim();
  }

  /**
   * Calculate similarity between two strings (simple implementation)
   * Returns a score between 0 and 1
   */
  private similarity(str1: string, str2: string): number {
    const s1 = this.normalizeText(str1);
    const s2 = this.normalizeText(str2);

    // Exact match
    if (s1 === s2) return 1.0;

    // Contains match
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;

    // Check if all words in stylist name appear in content
    const words = s2.split(' ');
    const allWordsPresent = words.every(word => s1.includes(word));
    if (allWordsPresent) return 0.7;

    return 0;
  }

  /**
   * Detect stylist mentions in content using fuzzy matching
   *
   * @param content - The text content to scan for mentions
   * @param title - Optional title to also scan
   * @returns Array of stylist IDs that were mentioned
   */
  async detectStylistMentions(
    content: string,
    title?: string
  ): Promise<string[]> {
    const combinedContent = title ? `${title} ${content}` : content;
    const normalizedContent = this.normalizeText(combinedContent);

    // Get all stylists
    const allStylists = await this.getStylists();

    // Find mentioned stylists using fuzzy matching
    const mentionedStylistIds = new Set<string>();

    for (const stylist of allStylists) {
      const score = this.similarity(normalizedContent, stylist.name);

      // If similarity score is above threshold, consider it a match
      if (score >= 0.7) {
        mentionedStylistIds.add(stylist.id);
      }
    }

    return Array.from(mentionedStylistIds);
  }

  /**
   * Clear the stylists cache (useful for testing or after data updates)
   */
  clearCache(): void {
    stylistsCache = null;
    cacheTimestamp = 0;
  }
}

// Export singleton instance
export const mentionDetectionService = new MentionDetectionService();

// Export helper function for backward compatibility
export async function detectStylistMentions(
  content: string,
  title?: string
): Promise<string[]> {
  return mentionDetectionService.detectStylistMentions(content, title);
}

// Export cache clearing function
export function clearStylistsCache(): void {
  mentionDetectionService.clearCache();
}
