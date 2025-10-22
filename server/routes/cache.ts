import { Router } from 'express';
import { asyncHandler } from '../middleware';
import { getCachedDirectory, clearCache, getCacheStats } from '../services/cache/directory-cache';

export const cacheRouter = Router();

/**
 * Clear the directory cache
 * POST /api/cache/clear
 */
cacheRouter.post('/clear', asyncHandler(async (_req, res) => {
  clearCache();
  console.log('[api] POST /api/cache/clear - Cache cleared successfully');
  res.json({ message: 'Cache cleared successfully' });
}));

/**
 * Get cache statistics
 * GET /api/cache/stats
 */
cacheRouter.get('/stats', asyncHandler(async (_req, res) => {
  const stats = getCacheStats();
  res.json(stats);
}));
