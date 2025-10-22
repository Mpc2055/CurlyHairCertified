import { eq } from 'drizzle-orm';
import {
  salons,
  stylists,
  certifications,
  stylistCertifications,
  type DirectoryData,
  type Salon,
  type Stylist,
  type Certification,
} from '@shared/schema';
import { BaseStorage } from './base/BaseStorage';
import type { IDirectoryStorage } from './base/types';
import { geocodeAddress } from '../services/google/geocoding';
import { findPlaceId, getPlaceDetails } from '../services/google/places';

// Constants
const GOOGLE_SYNC_INTERVAL_DAYS = 7;

/**
 * Directory storage operations
 * Handles salon/stylist directory with Google Places integration
 */
export class DirectoryStorage extends BaseStorage implements IDirectoryStorage {
  /**
   * Get complete directory data with salons, stylists, and certifications
   * Includes automatic geocoding and Google Places sync
   */
  async getDirectory(): Promise<DirectoryData> {
    try {
      // 1. Fetch all certifications
      const allCertifications = await this.db.select().from(certifications);

      // 2. Fetch all salons
      const allSalons = await this.db.select().from(salons);

      // 3. Fetch all stylists
      const allStylists = await this.db.select().from(stylists);

      // 4. Fetch all stylist-certification relationships
      const allStylistCerts = await this.db.select().from(stylistCertifications);

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
          instagram: this.normalizeInstagram(stylist.instagram),
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
              await this.db
                .update(salons)
                .set({ lat: lat.toString(), lng: lng.toString() })
                .where(eq(salons.id, salon.id));
            }
          } catch (error) {
            console.error(`[storage] Failed to geocode salon ${salon.name}:`, error);
          }
        }

        // Sync Google Place data if needed
        await this.syncGooglePlaceData(salon);

        // Only include salons with valid coordinates
        if (lat !== null && lng !== null) {
          salonResults.push({
            id: salon.id,
            name: salon.name,
            address: [
              salon.streetAddress,
              salon.suiteUnit,
              `${salon.city}, ${salon.state} ${salon.zipCode}`
            ].filter(Boolean).join(', '),
            city: salon.city,
            state: salon.state,
            zip: salon.zipCode,
            phone: salon.phone || undefined,
            website: salon.website || undefined,
            photo: salon.photo || undefined,
            lat,
            lng,
            // Google Places data
            googlePlaceId: salon.googlePlaceId || undefined,
            googleRating: salon.googleRating ? parseFloat(salon.googleRating) : undefined,
            googleReviewCount: salon.googleReviewCount || undefined,
            googleReviewsUrl: salon.googleReviewsUrl || undefined,
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

  /**
   * Sync Google Place data for a salon if missing or stale
   */
  private async syncGooglePlaceData(salon: any): Promise<void> {
    try {
      const needsSync = this.shouldSyncGoogleData(salon);

      if (!needsSync) {
        return;
      }

      console.log(`[storage] Syncing Google Place data for: ${salon.name}`);

      // Step 1: Get Place ID if missing
      let placeId = salon.googlePlaceId;
      if (!placeId || placeId === '') {
        const result = await findPlaceId(salon.name, salon.fullAddress);
        placeId = result.placeId;

        if (!placeId) {
          console.warn(`[storage] Could not find Place ID for: ${salon.name}`);
          // Mark as attempted to avoid repeated lookups
          await this.db
            .update(salons)
            .set({
              googlePlaceId: 'NOT_FOUND',
              lastGoogleSync: new Date(),
            })
            .where(eq(salons.id, salon.id));
          return;
        }

        // Save Place ID
        await this.db
          .update(salons)
          .set({ googlePlaceId: placeId })
          .where(eq(salons.id, salon.id));

        salon.googlePlaceId = placeId;
      }

      // Step 2: Get Place Details (rating, reviews)
      if (placeId && placeId !== 'NOT_FOUND') {
        const details = await getPlaceDetails(placeId);

        if (details) {
          await this.db
            .update(salons)
            .set({
              googleRating: details.rating?.toString(),
              googleReviewCount: details.reviewCount,
              googleReviewsUrl: details.reviewsUrl,
              lastGoogleSync: new Date(),
            })
            .where(eq(salons.id, salon.id));

          // Update in-memory object
          salon.googleRating = details.rating?.toString();
          salon.googleReviewCount = details.reviewCount;
          salon.googleReviewsUrl = details.reviewsUrl;
          salon.lastGoogleSync = new Date();
        }
      }
    } catch (error) {
      console.error(`[storage] Error syncing Google data for ${salon.name}:`, error);
      // Don't throw - continue with other salons
    }
  }

  /**
   * Determine if salon needs Google data sync
   */
  private shouldSyncGoogleData(salon: any): boolean {
    // Never synced - needs sync
    if (!salon.googlePlaceId) {
      return true;
    }

    // Previously failed to find - don't retry
    if (salon.googlePlaceId === 'NOT_FOUND') {
      return false;
    }

    // Check if last sync was more than 7 days ago
    if (salon.lastGoogleSync) {
      const daysSinceSync = (Date.now() - new Date(salon.lastGoogleSync).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceSync > GOOGLE_SYNC_INTERVAL_DAYS;
    }

    // Has Place ID but no sync timestamp - needs sync
    return true;
  }
}
