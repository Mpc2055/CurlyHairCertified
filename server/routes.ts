import type { Express } from "express";
import { createServer, type Server } from "http";
import { DirectoryData } from "@shared/schema";
import { getCachedDirectory, setCachedDirectory, clearCache, getCacheStats } from "./cache";
import { storage } from "./storage";

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

  const httpServer = createServer(app);

  return httpServer;
}
