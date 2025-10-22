import type { Express } from 'express';
import { createServer, type Server } from 'http';
import { cacheRouter } from './cache';
import { directoryRouter } from './directory';
import { blogRouter } from './blog';
import { analyticsRouter } from './analytics';
import { adminRouter } from './admin';
import { forumRouter } from './forum';

/**
 * Helper function to fetch directory data
 * Exposed for cache warming on startup
 */
export async function fetchDirectoryData() {
  const { storage } = await import('../storage');
  return await storage.getDirectory();
}

/**
 * Register all API routes
 * Routes are organized by feature/domain for better maintainability
 */
export function registerRoutes(app: Express): Server {
  // Cache management routes
  app.use('/api/cache', cacheRouter);

  // Directory routes
  app.use('/api/directory', directoryRouter);

  // Blog routes
  app.use('/api/blog', blogRouter);

  // Analytics routes
  app.use('/api/analytics', analyticsRouter);

  // Admin routes (AI summary generation)
  app.use('/api/admin', adminRouter);
  app.use('/api/stylists', adminRouter); // Stylist-specific admin routes

  // Forum routes
  app.use('/api/forum', forumRouter);

  const httpServer = createServer(app);
  return httpServer;
}
