import { useQuery } from "@tanstack/react-query";
import { SelectTopic } from "@shared/schema";
import type { TopicWithReplies } from "server/storage";

interface UseTopicsParams {
  sortBy?: 'recent' | 'replies' | 'newest';
  searchQuery?: string;
}

/**
 * Hook to fetch all forum topics with optional filtering
 */
export function useTopics({ sortBy, searchQuery }: UseTopicsParams = {}) {
  return useQuery<SelectTopic[]>({
    queryKey: ['/api/forum/topics', sortBy, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sortBy) params.append('sortBy', sortBy);
      if (searchQuery) params.append('search', searchQuery);

      const url = `/api/forum/topics${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return await response.json();
    },
  });
}

/**
 * Hook to fetch a single topic with all its replies
 */
export function useTopic(topicId: number | null) {
  return useQuery<TopicWithReplies>({
    queryKey: ['/api/forum/topics', topicId],
    queryFn: async () => {
      const response = await fetch(`/api/forum/topics/${topicId}`);
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return await response.json();
    },
    enabled: !!topicId,
  });
}
