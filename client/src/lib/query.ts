import { QueryClient } from "@tanstack/react-query";

/**
 * Query configuration and client setup for TanStack Query
 *
 * All queries now define their own queryFn via the API client.
 * This provides better type safety and explicit control over data fetching.
 */

/**
 * Global query client instance
 * Configured with sensible defaults for the application
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
