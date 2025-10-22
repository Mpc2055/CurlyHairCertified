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

  // Method declarations
  getBlogPosts: BlogStorage['getBlogPosts'];
  getBlogPostBySlug: BlogStorage['getBlogPostBySlug'];
  getFeaturedBlogPost: BlogStorage['getFeaturedBlogPost'];
  getMentionAnalytics: AnalyticsStorage['getMentionAnalytics'];
  getDirectory: DirectoryStorage['getDirectory'];
  createTopic: ForumStorage['createTopic'];
  getTopics: ForumStorage['getTopics'];
  getTopicById: ForumStorage['getTopicById'];
  createReply: ForumStorage['createReply'];
  flagContent: ForumStorage['flagContent'];
  upvoteTopic: ForumStorage['upvoteTopic'];
  shouldGenerateAISummary: AIStorage['shouldGenerateAISummary'];
  generateAISummaryForStylist: AIStorage['generateAISummaryForStylist'];
  generateAISummariesBatch: AIStorage['generateAISummariesBatch'];

  constructor() {
    // Initialize storage modules
    this.blog = new BlogStorage();
    this.analytics = new AnalyticsStorage();
    this.directory = new DirectoryStorage();
    this.forum = new ForumStorage();
    this.ai = new AIStorage();

    // Bind methods after initialization
    // Blog Methods
    this.getBlogPosts = this.blog.getBlogPosts.bind(this.blog);
    this.getBlogPostBySlug = this.blog.getBlogPostBySlug.bind(this.blog);
    this.getFeaturedBlogPost = this.blog.getFeaturedBlogPost.bind(this.blog);

    // Analytics Methods
    this.getMentionAnalytics = this.analytics.getMentionAnalytics.bind(this.analytics);

    // Directory Methods
    this.getDirectory = this.directory.getDirectory.bind(this.directory);

    // Forum Methods
    this.createTopic = this.forum.createTopic.bind(this.forum);
    this.getTopics = this.forum.getTopics.bind(this.forum);
    this.getTopicById = this.forum.getTopicById.bind(this.forum);
    this.createReply = this.forum.createReply.bind(this.forum);
    this.flagContent = this.forum.flagContent.bind(this.forum);
    this.upvoteTopic = this.forum.upvoteTopic.bind(this.forum);

    // AI Methods
    this.shouldGenerateAISummary = this.ai.shouldGenerateAISummary.bind(this.ai);
    this.generateAISummaryForStylist = this.ai.generateAISummaryForStylist.bind(this.ai);
    this.generateAISummariesBatch = this.ai.generateAISummariesBatch.bind(this.ai);
  }
}

/**
 * Singleton storage instance
 * Export this for use throughout the application
 */
export const storage = new UnifiedStorage();

// Re-export types for convenience
export type { IStorage } from './base/types';
export * from './base/types';
