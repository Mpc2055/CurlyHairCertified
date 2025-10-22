import { useQuery } from "@tanstack/react-query";
import { SelectBlogPost } from "@shared/schema";
import { api, type GetBlogPostsParams } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

/**
 * Hook to fetch all blog posts with optional filtering
 */
export function usePosts(params: GetBlogPostsParams = {}) {
  return useQuery<SelectBlogPost[]>({
    queryKey: queryKeys.blog.postsList(params),
    queryFn: () => api.blog.getPosts(params),
  });
}

/**
 * Hook to fetch a single blog post by slug
 */
export function usePost(slug: string | null) {
  return useQuery<SelectBlogPost>({
    queryKey: slug ? queryKeys.blog.post(slug) : ["blog", "post", null],
    queryFn: () => api.blog.getPost(slug!),
    enabled: !!slug,
  });
}

/**
 * Hook to fetch the featured blog post
 */
export function useFeaturedPost() {
  return useQuery<SelectBlogPost | null>({
    queryKey: queryKeys.blog.featured(),
    queryFn: () => api.blog.getFeaturedPost(),
  });
}
