import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import {
  salons,
  stylists,
  certifications,
  stylistCertifications,
} from '../shared/schema';
import type { DirectoryData, Salon, Stylist, Certification } from '../shared/schema';
import { geocodeAddress } from './geocoding';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql);

// Helper to normalize Instagram handles
function normalizeInstagram(handle: string | null | undefined): string | undefined {
  if (!handle) return undefined;
  const trimmed = handle.trim();
  if (!trimmed) return undefined;
  
  // Handle multiple Instagram handles separated by |
  const handles = trimmed.split('|').map(h => h.trim());
  const primaryHandle = handles[0];
  
  // Add @ prefix if missing
  return primaryHandle.startsWith('@') ? primaryHandle : `@${primaryHandle}`;
}

export interface IStorage {
  getDirectory(): Promise<DirectoryData>;
}

export class PostgresStorage implements IStorage {
  async getDirectory(): Promise<DirectoryData> {
    try {
      // 1. Fetch all certifications
      const allCertifications = await db.select().from(certifications);

      // 2. Fetch all salons
      const allSalons = await db.select().from(salons);

      // 3. Fetch all stylists
      const allStylists = await db.select().from(stylists);

      // 4. Fetch all stylist-certification relationships
      const allStylistCerts = await db.select().from(stylistCertifications);

      // 5. Build certification lookup map
      const certMap = new Map<string, Certification>();
      for (const cert of allCertifications) {
        certMap.set(cert.id, {
          id: cert.id,
          name: cert.name,
          level: cert.level || undefined,
          organization: cert.organization || undefined,
          description: cert.description || undefined,
        });
      }

      // 6. Build stylist lookup map with their certifications
      const stylistMap = new Map<string, Stylist>();
      for (const stylist of allStylists) {
        // Get certifications for this stylist
        const stylistCertIds = allStylistCerts
          .filter(sc => sc.stylistId === stylist.id)
          .map(sc => sc.certificationId);

        const stylistCerts = stylistCertIds
          .map(certId => certMap.get(certId))
          .filter((cert): cert is Certification => cert !== undefined);

        stylistMap.set(stylist.id, {
          id: stylist.id,
          name: stylist.name,
          phone: stylist.phone || undefined,
          email: stylist.email || undefined,
          website: stylist.website || undefined,
          instagram: normalizeInstagram(stylist.instagram),
          photo: stylist.profilePhoto || undefined,
          verified: stylist.verified,
          canBookOnline: stylist.canBookOnline,
          price: stylist.curlyCutPrice ? parseFloat(stylist.curlyCutPrice) : undefined,
          certifications: stylistCerts,
        });
      }

      // 7. Build salons with their stylists, geocode addresses if needed
      const salonResults: Salon[] = [];

      for (const salon of allSalons) {
        // Get stylists for this salon
        const salonStylists = allStylists
          .filter(s => s.salonId === salon.id)
          .map(s => stylistMap.get(s.id))
          .filter((stylist): stylist is Stylist => stylist !== undefined);

        // Skip salons with no stylists
        if (salonStylists.length === 0) {
          continue;
        }

        // Geocode if coordinates are missing
        let lat = salon.lat ? parseFloat(salon.lat) : null;
        let lng = salon.lng ? parseFloat(salon.lng) : null;

        if (lat === null || lng === null) {
          try {
            const coords = await geocodeAddress(salon.fullAddress);
            if (coords) {
              lat = coords.lat;
              lng = coords.lng;

              // Update database with geocoded coordinates
              await db
                .update(salons)
                .set({ lat: lat.toString(), lng: lng.toString() })
                .where(eq(salons.id, salon.id));
            }
          } catch (error) {
            console.error(`[storage] Failed to geocode salon ${salon.name}:`, error);
          }
        }

        // Only include salons with valid coordinates
        if (lat !== null && lng !== null) {
          salonResults.push({
            id: salon.id,
            name: salon.name,
            address: salon.fullAddress,
            city: salon.city,
            state: salon.state,
            zip: salon.zipCode,
            phone: salon.phone || undefined,
            website: salon.website || undefined,
            photo: salon.photo || undefined,
            lat,
            lng,
            stylists: salonStylists,
          });
        }
      }

      return {
        salons: salonResults,
        certifications: Array.from(certMap.values()),
      };
    } catch (error) {
      console.error('[storage] Error fetching directory data:', error);
      throw error;
    }
  }
}

export const storage = new PostgresStorage();
