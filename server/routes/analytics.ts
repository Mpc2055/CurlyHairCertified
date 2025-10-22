import { Router } from 'express';
import { asyncHandler } from '../middleware';
import { storage } from '../storage';

export const analyticsRouter = Router();

/**
 * Get mention analytics for stylists
 * Shows which stylists are being mentioned in forum discussions
 * GET /api/analytics/mentions
 */
analyticsRouter.get('/mentions', asyncHandler(async (_req, res) => {
  const analytics = await storage.getMentionAnalytics();
  res.json(analytics);
}));
