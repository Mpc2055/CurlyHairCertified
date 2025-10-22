/**
 * Unified storage interface
 * Combines all domain-specific storage modules into a single interface
 * Uses composition pattern for better separation of concerns
 */

import { BlogStorage } from './BlogStorage';
import { AnalyticsStorage } from './AnalyticsStorage';
import { DirectoryStorage } from './DirectoryStorage';
import { ForumStorage } from './ForumStorage';
import { AIStorage } from './AIStorage';
import type { IStorage } from './base/types';

/**
 * Unified storage that delegates to domain-specific storage modules
 * All storage operations are now fully refactored into domain-specific modules
 */
class UnifiedStorage implements IStorage {
  private blog: BlogStorage;
  private analytics: AnalyticsStorage;
  private directory: DirectoryStorage;
  private forum: ForumStorage;
  private ai: AIStorage;

  constructor() {
    this.blog = new BlogStorage();
    this.analytics = new AnalyticsStorage();
    this.directory = new DirectoryStorage();
    this.forum = new ForumStorage();
    this.ai = new AIStorage();
  }

  // ========== Blog Methods ==========
  getBlogPosts = this.blog.getBlogPosts.bind(this.blog);
  getBlogPostBySlug = this.blog.getBlogPostBySlug.bind(this.blog);
  getFeaturedBlogPost = this.blog.getFeaturedBlogPost.bind(this.blog);

  // ========== Analytics Methods ==========
  getMentionAnalytics = this.analytics.getMentionAnalytics.bind(this.analytics);

  // ========== Directory Methods ==========
  getDirectory = this.directory.getDirectory.bind(this.directory);

  // ========== Forum Methods ==========
  createTopic = this.forum.createTopic.bind(this.forum);
  getTopics = this.forum.getTopics.bind(this.forum);
  getTopicById = this.forum.getTopicById.bind(this.forum);
  createReply = this.forum.createReply.bind(this.forum);
  flagContent = this.forum.flagContent.bind(this.forum);
  upvoteTopic = this.forum.upvoteTopic.bind(this.forum);

  // ========== AI Methods ==========
  shouldGenerateAISummary = this.ai.shouldGenerateAISummary.bind(this.ai);
  generateAISummaryForStylist = this.ai.generateAISummaryForStylist.bind(this.ai);
  generateAISummariesBatch = this.ai.generateAISummariesBatch.bind(this.ai);
}

/**
 * Singleton storage instance
 * Export this for use throughout the application
 */
export const storage = new UnifiedStorage();

// Re-export types for convenience
export type { IStorage } from './base/types';
export * from './base/types';
