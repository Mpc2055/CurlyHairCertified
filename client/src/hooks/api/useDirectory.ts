import { useQuery } from "@tanstack/react-query";
import { DirectoryData } from "@shared/schema";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

/**
 * Hook to fetch directory data (salons, stylists, certifications)
 * Includes automatic caching and error handling via TanStack Query
 */
export function useDirectory() {
  return useQuery<DirectoryData>({
    queryKey: queryKeys.directory.list(),
    queryFn: () => api.directory.getDirectory(),
  });
}
