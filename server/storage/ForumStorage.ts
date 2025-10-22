import { eq, desc, sql as drizzleSql, and } from 'drizzle-orm';
import {
  topics,
  replies,
  type InsertTopic,
  type InsertReply,
  type SelectTopic,
  type SelectReply,
} from '@shared/schema';
import { BaseStorage } from './base/BaseStorage';
import type { IForumStorage, TopicWithReplies, ReplyWithChildren } from './base/types';

/**
 * Forum storage operations
 * Handles topics, replies, voting, and flagging
 */
export class ForumStorage extends BaseStorage implements IForumStorage {
  /**
   * Create a new forum topic
   */
  async createTopic(topic: InsertTopic): Promise<SelectTopic> {
    const [newTopic] = await this.db.insert(topics).values(topic).returning();
    return newTopic;
  }

  /**
   * Get topics with filtering and sorting
   */
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
    let query = this.db
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

  /**
   * Get a single topic with all replies in threaded structure
   */
  async getTopicById(id: number): Promise<TopicWithReplies | null> {
    const topicResults = await this.db.select().from(topics).where(eq(topics.id, id));
    const topic = topicResults[0];
    if (!topic) return null;

    // Get all replies for this topic
    const allReplies = await this.db
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

  /**
   * Create a reply to a topic or another reply
   */
  async createReply(reply: InsertReply): Promise<SelectReply> {
    // Validate max nesting depth (2 levels: topic -> reply -> sub-reply)
    if (reply.parentReplyId) {
      const parentReplies = await this.db
        .select()
        .from(replies)
        .where(eq(replies.id, reply.parentReplyId));

      const parentReply = parentReplies[0];
      if (parentReply && parentReply.parentReplyId) {
        throw new Error('Maximum nesting depth of 2 levels exceeded');
      }
    }

    const newReplies = await this.db.insert(replies).values(reply).returning();
    const newReply = newReplies[0];

    // Update topic's reply count and updated_at
    await this.db
      .update(topics)
      .set({
        repliesCount: drizzleSql`${topics.repliesCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(topics.id, reply.topicId));

    return newReply;
  }

  /**
   * Flag content as inappropriate
   */
  async flagContent(contentType: 'topic' | 'reply', contentId: number): Promise<void> {
    const table = contentType === 'topic' ? topics : replies;
    const idField = contentType === 'topic' ? topics.id : replies.id;
    const flagField = contentType === 'topic' ? topics.flagCount : replies.flagCount;

    await this.db
      .update(table)
      .set({ flagCount: drizzleSql`${flagField} + 1` })
      .where(eq(idField, contentId));
  }

  /**
   * Upvote a topic
   */
  async upvoteTopic(topicId: number): Promise<void> {
    await this.db
      .update(topics)
      .set({ upvotesCount: drizzleSql`${topics.upvotesCount} + 1` })
      .where(eq(topics.id, topicId));
  }
}
