/**
 * Typed API Client
 * Provides type-safe methods for all API endpoints with consistent error handling
 */

import { DirectoryData, SelectTopic, InsertTopic, InsertReply, SelectReply } from "@shared/schema";
import type { TopicWithReplies } from "server/storage";

/**
 * Base API request function with error handling
 */
async function request<T>(
  method: string,
  url: string,
  data?: unknown
): Promise<T> {
  const options: RequestInit = {
    method,
    credentials: "include",
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
  };

  const response = await fetch(url, options);

  if (!response.ok) {
    const text = (await response.text()) || response.statusText;
    throw new Error(`${response.status}: ${text}`);
  }

  return await response.json();
}

// ========== Directory API ==========

export interface DirectoryAPI {
  /**
   * Fetch all directory data (salons, stylists, certifications)
   */
  getDirectory(): Promise<DirectoryData>;
}

export const directoryAPI: DirectoryAPI = {
  getDirectory: () => request<DirectoryData>("GET", "/api/directory"),
};

// ========== Forum API ==========

export interface GetTopicsParams {
  sortBy?: 'recent' | 'replies' | 'newest';
  searchQuery?: string;
}

export interface CreateTopicPayload extends Omit<InsertTopic, 'tags'> {
  tags?: string[];
}

export interface CreateReplyPayload extends Omit<InsertReply, 'topicId'> {
  authorName?: string;
  authorEmail?: string;
}

export interface UpvoteTopicPayload {
  topicId: number;
}

export interface FlagContentPayload {
  contentType: 'topic' | 'reply';
  contentId: number;
}

export interface ForumAPI {
  /**
   * Get all forum topics with optional filtering
   */
  getTopics(params?: GetTopicsParams): Promise<SelectTopic[]>;

  /**
   * Get a single topic with all its replies
   */
  getTopic(id: number): Promise<TopicWithReplies>;

  /**
   * Create a new forum topic
   */
  createTopic(payload: CreateTopicPayload): Promise<SelectTopic>;

  /**
   * Create a reply to a topic or another reply
   */
  createReply(topicId: number, payload: CreateReplyPayload): Promise<SelectReply>;

  /**
   * Upvote a topic
   */
  upvoteTopic(payload: UpvoteTopicPayload): Promise<void>;

  /**
   * Flag content as inappropriate
   */
  flagContent(payload: FlagContentPayload): Promise<void>;
}

export const forumAPI: ForumAPI = {
  getTopics: (params = {}) => {
    const urlParams = new URLSearchParams();
    if (params.sortBy) urlParams.append('sortBy', params.sortBy);
    if (params.searchQuery) urlParams.append('search', params.searchQuery);

    const url = `/api/forum/topics${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
    return request<SelectTopic[]>("GET", url);
  },

  getTopic: (id) =>
    request<TopicWithReplies>("GET", `/api/forum/topics/${id}`),

  createTopic: (payload) =>
    request<SelectTopic>("POST", "/api/forum/topics", payload),

  createReply: (topicId, payload) =>
    request<SelectReply>("POST", `/api/forum/topics/${topicId}/reply`, payload),

  upvoteTopic: (payload) =>
    request<void>("POST", "/api/forum/upvote", payload),

  flagContent: (payload) =>
    request<void>("POST", "/api/forum/flag", payload),
};

// ========== Combined API Client ==========

/**
 * Main API client with all endpoints organized by domain
 */
export const api = {
  directory: directoryAPI,
  forum: forumAPI,
} as const;

export default api;
