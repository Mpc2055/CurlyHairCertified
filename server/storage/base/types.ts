import type {
  InsertTopic,
  InsertReply,
  SelectTopic,
  SelectReply,
  SelectBlogPost,
  DirectoryData,
} from '@shared/schema';

/**
 * Topic with nested replies (tree structure)
 */
export interface TopicWithReplies extends SelectTopic {
  replies: ReplyWithChildren[];
}

/**
 * Reply with nested child replies
 */
export interface ReplyWithChildren extends SelectReply {
  children: SelectReply[];
}

/**
 * Stylist mention statistics
 */
export interface MentionStats {
  stylistId: string;
  stylistName: string;
  mentionCount: number;
  recentTopics: { id: number; title: string; createdAt: Date }[];
}

/**
 * Result of AI summary generation
 */
export interface AISummaryResult {
  success: boolean;
  summary?: string;
  error?: string;
}

/**
 * Result of batch AI summary generation
 */
export interface AISummaryBatchResult {
  generated: number;
  skipped: number;
  errors: number;
}

/**
 * Interface for Directory storage operations
 */
export interface IDirectoryStorage {
  getDirectory(): Promise<DirectoryData>;
}

/**
 * Interface for Blog storage operations
 */
export interface IBlogStorage {
  getBlogPosts(options: { tag?: string; limit?: number }): Promise<SelectBlogPost[]>;
  getBlogPostBySlug(slug: string): Promise<SelectBlogPost | null>;
  getFeaturedBlogPost(): Promise<SelectBlogPost | null>;
}

/**
 * Interface for Forum storage operations
 */
export interface IForumStorage {
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
}

/**
 * Interface for Analytics storage operations
 */
export interface IAnalyticsStorage {
  getMentionAnalytics(): Promise<MentionStats[]>;
}

/**
 * Interface for AI storage operations
 */
export interface IAIStorage {
  shouldGenerateAISummary(stylistId: string): Promise<boolean>;
  generateAISummaryForStylist(stylistId: string): Promise<AISummaryResult>;
  generateAISummariesBatch(
    stylistIds?: string[],
    force?: boolean
  ): Promise<AISummaryBatchResult>;
}

/**
 * Unified storage interface combining all domains
 */
export interface IStorage
  extends IDirectoryStorage,
    IBlogStorage,
    IForumStorage,
    IAnalyticsStorage,
    IAIStorage {}
