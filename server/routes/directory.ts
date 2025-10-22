import { Router } from 'express';
import { asyncHandler } from '../middleware';
import { getCachedDirectory, setCachedDirectory } from '../cache';
import { storage } from '../storage';

export const directoryRouter = Router();

/**
 * Get directory data with all salons, stylists, and certifications
 * Uses in-memory cache for performance
 * GET /api/directory
 */
directoryRouter.get('/', asyncHandler(async (_req, res) => {
  const startTime = Date.now();

  // Check cache first
  const cachedData = getCachedDirectory();
  if (cachedData) {
    const duration = Date.now() - startTime;
    console.log(`[api] GET /api/directory - CACHE HIT (${duration}ms)`);
    return res.json(cachedData);
  }

  // Cache miss - fetch from PostgreSQL
  console.log('[api] GET /api/directory - CACHE MISS, fetching from PostgreSQL...');
  const response = await storage.getDirectory();

  // Store in cache before returning
  setCachedDirectory(response);

  const duration = Date.now() - startTime;
  console.log(`[api] GET /api/directory - COMPLETE (${duration}ms)`);

  res.json(response);
}));
