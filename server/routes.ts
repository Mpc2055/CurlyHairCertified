import type { Express } from "express";
import { createServer, type Server } from "http";
import { DirectoryData, insertTopicSchema, insertReplySchema } from "@shared/schema";
import { getCachedDirectory, setCachedDirectory, clearCache, getCacheStats } from "./cache";
import { storage } from "./storage";
import { checkSpamProtection } from "./spam-protection";
import { detectStylistMentions } from "./mention-detection";

export async function fetchDirectoryData(): Promise<DirectoryData> {
  return await storage.getDirectory();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get directory data with all salons, stylists, and certifications
  app.get("/api/directory", async (_req, res) => {
    try {
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
      const response = await fetchDirectoryData();

      // Store in cache before returning
      setCachedDirectory(response);
      
      const duration = Date.now() - startTime;
      console.log(`[api] GET /api/directory - COMPLETE (${duration}ms)`);
      
      res.json(response);
    } catch (error) {
      console.error("Error fetching directory data:", error);
      res.status(500).json({ 
        message: "Failed to fetch directory data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Clear cache endpoint
  app.post("/api/cache/clear", (_req, res) => {
    try {
      clearCache();
      console.log('[api] POST /api/cache/clear - Cache cleared successfully');
      res.json({ message: "Cache cleared successfully" });
    } catch (error) {
      console.error("Error clearing cache:", error);
      res.status(500).json({ 
        message: "Failed to clear cache",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Cache stats endpoint
  app.get("/api/cache/stats", (_req, res) => {
    try {
      const stats = getCacheStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting cache stats:", error);
      res.status(500).json({ 
        message: "Failed to get cache stats",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // ========== Forum Routes ==========

  // Get topics with filtering and sorting
  app.get("/api/forum/topics", async (req, res) => {
    try {
      const { sortBy, tags, search, limit, offset } = req.query;

      const topics = await storage.getTopics({
        sortBy: sortBy as 'recent' | 'replies' | 'newest' | undefined,
        tags: tags ? (typeof tags === 'string' ? [tags] : tags as string[]) : undefined,
        search: search as string | undefined,
        limit: limit ? parseInt(limit as string) : 50,
        offset: offset ? parseInt(offset as string) : 0,
      });

      res.json(topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
      res.status(500).json({
        message: "Failed to fetch topics",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Create a new topic
  app.post("/api/forum/topics", async (req, res) => {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

      // Validate request body
      const validatedData = insertTopicSchema.parse(req.body);

      // Spam protection checks
      const spamCheck = checkSpamProtection(
        validatedData.content,
        clientIp,
        validatedData.title
      );

      if (!spamCheck.allowed) {
        return res.status(429).json({
          message: spamCheck.reason || "Request rejected by spam protection",
        });
      }

      // Detect stylist mentions
      const mentionedStylistIds = await detectStylistMentions(
        validatedData.content,
        validatedData.title
      );

      // Create topic with detected mentions
      const topic = await storage.createTopic({
        ...validatedData,
        mentionedStylistIds,
      });

      res.status(201).json(topic);
    } catch (error) {
      console.error("Error creating topic:", error);
      if (error instanceof Error && error.message.includes('validation')) {
        return res.status(400).json({
          message: "Invalid topic data",
          error: error.message
        });
      }
      res.status(500).json({
        message: "Failed to create topic",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get a single topic with replies
  app.get("/api/forum/topics/:id", async (req, res) => {
    try {
      const topicId = parseInt(req.params.id);
      
      if (isNaN(topicId)) {
        return res.status(400).json({ message: "Invalid topic ID" });
      }

      const topic = await storage.getTopicById(topicId);
      
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }

      res.json(topic);
    } catch (error) {
      console.error("Error fetching topic:", error);
      res.status(500).json({
        message: "Failed to fetch topic",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Reply to a topic
  app.post("/api/forum/topics/:id/reply", async (req, res) => {
    try {
      const topicId = parseInt(req.params.id);
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

      if (isNaN(topicId)) {
        return res.status(400).json({ message: "Invalid topic ID" });
      }

      // Validate request body
      const validatedData = insertReplySchema.parse({
        content: req.body.content,
        authorName: req.body.authorName,
        authorEmail: req.body.authorEmail,
        parentReplyId: req.body.parentReplyId,
        topicId,
      });

      // Spam protection checks
      const spamCheck = checkSpamProtection(validatedData.content, clientIp);

      if (!spamCheck.allowed) {
        return res.status(429).json({
          message: spamCheck.reason || "Request rejected by spam protection",
        });
      }

      // Create reply
      const reply = await storage.createReply(validatedData);

      res.status(201).json(reply);
    } catch (error) {
      console.error("Error creating reply:", error);
      if (error instanceof Error) {
        if (error.message.includes('nesting depth')) {
          return res.status(400).json({ message: error.message });
        }
        if (error.message.includes('validation')) {
          return res.status(400).json({
            message: "Invalid reply data",
            error: error.message
          });
        }
      }
      res.status(500).json({
        message: "Failed to create reply",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Flag content
  app.post("/api/forum/flag", async (req, res) => {
    try {
      const { contentType, contentId } = req.body;

      if (!['topic', 'reply'].includes(contentType)) {
        return res.status(400).json({ message: "Invalid content type" });
      }

      if (typeof contentId !== 'number') {
        return res.status(400).json({ message: "Invalid content ID" });
      }

      await storage.flagContent(contentType as 'topic' | 'reply', contentId);

      res.json({ message: "Content flagged successfully" });
    } catch (error) {
      console.error("Error flagging content:", error);
      res.status(500).json({
        message: "Failed to flag content",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Upvote a topic
  app.post("/api/forum/upvote", async (req, res) => {
    try {
      const { topicId } = req.body;

      if (typeof topicId !== 'number') {
        return res.status(400).json({ message: "Invalid topic ID" });
      }

      await storage.upvoteTopic(topicId);

      res.json({ message: "Topic upvoted successfully" });
    } catch (error) {
      console.error("Error upvoting topic:", error);
      res.status(500).json({
        message: "Failed to upvote topic",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get mention analytics
  app.get("/api/analytics/mentions", async (_req, res) => {
    try {
      const analytics = await storage.getMentionAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching mention analytics:", error);
      res.status(500).json({
        message: "Failed to fetch mention analytics",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // ========== AI Summary Routes ==========

  // Generate AI summaries for stylists (batch or specific IDs)
  app.post("/api/admin/generate-ai-summaries", async (req, res) => {
    try {
      const { stylistIds } = req.body;

      console.log('[api] POST /api/admin/generate-ai-summaries - Starting batch generation');

      const result = await storage.generateAISummariesBatch(stylistIds);

      console.log(`[api] POST /api/admin/generate-ai-summaries - Complete: ${result.generated} generated, ${result.skipped} skipped, ${result.errors} errors`);

      res.json({
        message: "AI summary generation complete",
        ...result,
      });
    } catch (error) {
      console.error("Error generating AI summaries:", error);
      res.status(500).json({
        message: "Failed to generate AI summaries",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Refresh AI summary for a specific stylist
  app.post("/api/stylists/:id/refresh-summary", async (req, res) => {
    try {
      const { id } = req.params;

      console.log(`[api] POST /api/stylists/${id}/refresh-summary - Checking eligibility`);

      // Check if should generate (30-day limit)
      const shouldGenerate = await storage.shouldGenerateAISummary(id);

      if (!shouldGenerate) {
        return res.status(429).json({
          message: "AI summary was recently generated. Please wait 30 days between refreshes.",
          canRefresh: false,
        });
      }

      console.log(`[api] POST /api/stylists/${id}/refresh-summary - Generating new summary`);

      const result = await storage.generateAISummaryForStylist(id);

      if (result.success) {
        // Clear cache so new summary is reflected
        clearCache();

        res.json({
          message: "AI summary refreshed successfully",
          summary: result.summary,
          canRefresh: false,
        });
      } else {
        res.status(500).json({
          message: "Failed to refresh AI summary",
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Error refreshing AI summary:", error);
      res.status(500).json({
        message: "Failed to refresh AI summary",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Check if a stylist can have their AI summary refreshed
  app.get("/api/stylists/:id/can-refresh-summary", async (req, res) => {
    try {
      const { id } = req.params;

      const canRefresh = await storage.shouldGenerateAISummary(id);

      res.json({
        canRefresh,
        message: canRefresh
          ? "AI summary can be refreshed"
          : "AI summary was recently generated. Please wait 30 days between refreshes.",
      });
    } catch (error) {
      console.error("Error checking refresh eligibility:", error);
      res.status(500).json({
        message: "Failed to check refresh eligibility",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
