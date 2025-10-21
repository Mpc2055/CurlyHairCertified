import type { Express } from "express";
import { createServer, type Server } from "http";
import { fetchCertifications, fetchStylists, fetchSalons } from "./airtable";
import { geocodeAddress, buildFullAddress } from "./geocoding";
import { Salon, DirectoryData } from "@shared/schema";
import { getCachedDirectory, setCachedDirectory, clearCache, getCacheStats } from "./cache";

export async function fetchDirectoryData(): Promise<DirectoryData> {
  const certMap = await fetchCertifications();
  const stylistsBySalon = await fetchStylists(certMap);
  const airtableSalons = await fetchSalons();

  const salons: Salon[] = await Promise.all(
    airtableSalons.map(async (airtableSalon) => {
      const fields = airtableSalon.fields;
      const fullAddress = buildFullAddress(fields);
      const coords = await geocodeAddress(fullAddress);
      const stylists = stylistsBySalon.get(airtableSalon.id) || [];

      return {
        id: airtableSalon.id,
        name: fields["Salon Name"],
        address: fullAddress,
        city: fields.City,
        state: fields.State,
        zip: fields["ZIP Code"],
        phone: fields["Phone Number"],
        website: fields.Website,
        photo: fields["Salon Photo"]?.[0]?.url,
        lat: coords.lat,
        lng: coords.lng,
        stylists,
      };
    })
  );

  const salonsWithStylists = salons.filter(
    (salon) => salon.stylists.length > 0
  );

  return {
    salons: salonsWithStylists,
    certifications: Array.from(certMap.values()),
  };
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

      // Cache miss - fetch from Airtable
      console.log('[api] GET /api/directory - CACHE MISS, fetching from Airtable...');
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
