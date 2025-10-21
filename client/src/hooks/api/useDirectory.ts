import { useQuery } from "@tanstack/react-query";
import { DirectoryData } from "@shared/schema";

/**
 * Hook to fetch directory data (salons, stylists, certifications)
 * Includes automatic caching and error handling via TanStack Query
 */
export function useDirectory() {
  return useQuery<DirectoryData>({
    queryKey: ['/api/directory'],
  });
}
