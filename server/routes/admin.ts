import { Router } from 'express';
import { asyncHandler, rateLimitError } from '../middleware';
import { storage } from '../storage';
import { clearCache } from '../services/cache/directory-cache';

export const adminRouter = Router();

/**
 * Generate AI summaries for stylists (batch or specific IDs)
 * POST /api/admin/generate-ai-summaries
 * Body: { stylistIds?: string[], force?: boolean }
 */
adminRouter.post('/generate-ai-summaries', asyncHandler(async (req, res) => {
  const { stylistIds, force } = req.body;

  console.log('[api] POST /api/admin/generate-ai-summaries - Starting batch generation', force ? '(FORCE MODE)' : '');

  const result = await storage.generateAISummariesBatch(stylistIds, force);

  console.log(`[api] POST /api/admin/generate-ai-summaries - Complete: ${result.generated} generated, ${result.skipped} skipped, ${result.errors} errors`);

  res.json({
    message: 'AI summary generation complete',
    ...result,
  });
}));

/**
 * Refresh AI summary for a specific stylist
 * POST /api/stylists/:id/refresh-summary
 */
adminRouter.post('/stylists/:id/refresh-summary', asyncHandler(async (req, res) => {
  const { id } = req.params;

  console.log(`[api] POST /api/stylists/${id}/refresh-summary - Checking eligibility`);

  // Check if should generate (30-day limit)
  const shouldGenerate = await storage.shouldGenerateAISummary(id);

  if (!shouldGenerate) {
    throw rateLimitError('AI summary was recently generated. Please wait 30 days between refreshes.');
  }

  console.log(`[api] POST /api/stylists/${id}/refresh-summary - Generating new summary`);

  const result = await storage.generateAISummaryForStylist(id);

  if (result.success) {
    // Clear cache so new summary is reflected
    clearCache();

    res.json({
      message: 'AI summary refreshed successfully',
      summary: result.summary,
      canRefresh: false,
    });
  } else {
    res.status(500).json({
      message: 'Failed to refresh AI summary',
      error: result.error,
    });
  }
}));

/**
 * Check if a stylist can have their AI summary refreshed
 * GET /api/stylists/:id/can-refresh-summary
 */
adminRouter.get('/stylists/:id/can-refresh-summary', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const canRefresh = await storage.shouldGenerateAISummary(id);

  res.json({
    canRefresh,
    message: canRefresh
      ? 'AI summary can be refreshed'
      : 'AI summary was recently generated. Please wait 30 days between refreshes.',
  });
}));
