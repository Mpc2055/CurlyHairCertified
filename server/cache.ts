import NodeCache from 'node-cache';
import type { DirectoryData } from '@shared/schema';

const TTL_SECONDS = parseInt(process.env.CACHE_TTL_SECONDS || '3600');

const cache = new NodeCache({ 
  stdTTL: TTL_SECONDS,
  checkperiod: TTL_SECONDS * 0.2,
  useClones: false
});

const CACHE_KEY = 'directory';

export function getCachedDirectory(): DirectoryData | undefined {
  return cache.get<DirectoryData>(CACHE_KEY);
}

export function setCachedDirectory(data: DirectoryData): void {
  cache.set(CACHE_KEY, data);
}

export function clearCache(): void {
  cache.flushAll();
}

export function getCacheStats() {
  const stats = cache.getStats();
  return {
    keys: cache.keys().length,
    hits: stats.hits,
    misses: stats.misses,
    ksize: stats.ksize,
    vsize: stats.vsize,
    ttl: TTL_SECONDS,
  };
}

cache.on('set', (key: string) => {
  console.log(`[cache] Cache SET: ${key}`);
});

cache.on('del', (key: string) => {
  console.log(`[cache] Cache DEL: ${key}`);
});

cache.on('expired', (key: string) => {
  console.log(`[cache] Cache EXPIRED: ${key}`);
});
