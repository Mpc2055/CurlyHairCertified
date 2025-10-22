/**
 * Query Key Factory
 * Provides consistent, type-safe query keys for TanStack Query cache management
 *
 * Key Structure:
 * - Top level: domain (directory, forum)
 * - Second level: specific resource (topics, topic)
 * - Third level: identifiers and filters
 *
 * Benefits:
 * - Type-safe key creation
 * - Easy cache invalidation
 * - Clear key hierarchy
 * - Prevents key typos
 */

import type { GetTopicsParams, GetBlogPostsParams } from "./api-client";

/**
 * Directory query keys
 */
export const directoryKeys = {
  /**
   * Base key for all directory queries
   */
  all: () => ["directory"] as const,

  /**
   * Key for the main directory data (salons, stylists, certifications)
   */
  list: () => [...directoryKeys.all(), "list"] as const,
} as const;

/**
 * Blog query keys
 */
export const blogKeys = {
  /**
   * Base key for all blog queries
   */
  all: () => ["blog"] as const,

  /**
   * Keys for blog post list queries
   */
  posts: () => [...blogKeys.all(), "posts"] as const,

  /**
   * Key for blog post list with specific filters
   */
  postsList: (params?: GetBlogPostsParams) =>
    [...blogKeys.posts(), "list", params] as const,

  /**
   * Key for individual blog post queries
   */
  post: (slug: string) => [...blogKeys.all(), "post", slug] as const,

  /**
   * Key for featured blog post
   */
  featured: () => [...blogKeys.all(), "featured"] as const,
} as const;

/**
 * Forum query keys
 */
export const forumKeys = {
  /**
   * Base key for all forum queries
   */
  all: () => ["forum"] as const,

  /**
   * Keys for topic list queries
   */
  topics: () => [...forumKeys.all(), "topics"] as const,

  /**
   * Key for topic list with specific filters
   */
  topicsList: (params?: GetTopicsParams) =>
    [...forumKeys.topics(), "list", params] as const,

  /**
   * Keys for individual topic queries
   */
  topic: (id: number) => [...forumKeys.all(), "topic", id] as const,
} as const;

/**
 * Combined query keys object
 */
export const queryKeys = {
  directory: directoryKeys,
  blog: blogKeys,
  forum: forumKeys,
} as const;

export default queryKeys;
