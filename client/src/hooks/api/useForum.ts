import { useQuery } from "@tanstack/react-query";
import { SelectTopic } from "@shared/schema";
import type { TopicWithReplies } from "server/storage";
import { api, type GetTopicsParams } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

/**
 * Hook to fetch all forum topics with optional filtering
 */
export function useTopics(params: GetTopicsParams = {}) {
  return useQuery<SelectTopic[]>({
    queryKey: queryKeys.forum.topicsList(params),
    queryFn: () => api.forum.getTopics(params),
  });
}

/**
 * Hook to fetch a single topic with all its replies
 */
export function useTopic(topicId: number | null) {
  return useQuery<TopicWithReplies>({
    queryKey: topicId ? queryKeys.forum.topic(topicId) : ["forum", "topic", null],
    queryFn: () => api.forum.getTopic(topicId!),
    enabled: !!topicId,
  });
}
