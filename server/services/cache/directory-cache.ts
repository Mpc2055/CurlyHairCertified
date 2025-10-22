import NodeCache from 'node-cache';
import type { DirectoryData } from '@shared/schema';
import { config } from '../../config';

const cache = new NodeCache({
  stdTTL: config.cache.ttl,
  checkperiod: config.cache.ttl * 0.2,
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
    ttl: config.cache.ttl,
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
