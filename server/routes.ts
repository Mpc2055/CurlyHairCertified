import type { Express } from "express";
import { createServer, type Server } from "http";
import { fetchCertifications, fetchStylists, fetchSalons } from "./airtable";
import { geocodeAddress, buildFullAddress } from "./geocoding";
import { Salon, DirectoryData } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get directory data with all salons, stylists, and certifications
  app.get("/api/directory", async (_req, res) => {
    try {
      // Fetch all data from Airtable
      const certMap = await fetchCertifications();
      const stylistsBySalon = await fetchStylists(certMap);
      const airtableSalons = await fetchSalons();

      // Build salon objects with geocoded coordinates and stylists
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

      // Only include salons that have stylists
      const salonsWithStylists = salons.filter(
        (salon) => salon.stylists.length > 0
      );

      const response: DirectoryData = {
        salons: salonsWithStylists,
        certifications: Array.from(certMap.values()),
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching directory data:", error);
      res.status(500).json({ 
        message: "Failed to fetch directory data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
