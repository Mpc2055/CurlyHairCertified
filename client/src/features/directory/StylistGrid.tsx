import { Stylist, Salon } from "@shared/schema";
import { StylistCard } from "./stylist/stylist-card";

export interface StylistWithSalon extends Stylist {
  salonName: string;
  salonAddress: string;
  salonCity: string;
  salonState: string;
  salonId: string;
  // Google Places data from salon
  salonGooglePlaceId?: string;
  salonGoogleRating?: number;
  salonGoogleReviewCount?: number;
  salonGoogleReviewsUrl?: string;
}

interface StylistGridProps {
  stylists: StylistWithSalon[];
  onStylistClick?: (stylist: StylistWithSalon) => void;
  selectedSalonId?: string;
  isMapOpen?: boolean;
}

/**
 * StylistGrid displays stylists in a responsive grid layout
 * Optimized for scanning and comparing multiple stylists
 * Adjusts columns based on map panel state
 */
export function StylistGrid({ stylists, onStylistClick, selectedSalonId, isMapOpen = false }: StylistGridProps) {
  if (stylists.length === 0) {
    return null;
  }

  // Dynamic grid columns: 3 when map closed, 2 when map open (desktop)
  const gridClass = isMapOpen
    ? "grid grid-cols-1 md:grid-cols-2 gap-6"
    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";

  return (
    <div className={gridClass}>
      {stylists.map((stylist) => (
        <div
          key={stylist.id}
          onClick={() => onStylistClick?.(stylist)}
          className="cursor-pointer"
          data-stylist-id={stylist.id}
          data-salon-id={stylist.salonId}
        >
          <StylistCard
            stylist={stylist}
            isSelected={stylist.salonId === selectedSalonId}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Helper function to flatten salon data into individual stylists with salon context
 */
export function flattenSalonsToStylists(salons: Salon[]): StylistWithSalon[] {
  const stylists: StylistWithSalon[] = [];

  salons.forEach((salon) => {
    salon.stylists.forEach((stylist) => {
      stylists.push({
        ...stylist,
        salonName: salon.name,
        salonAddress: salon.address,
        salonCity: salon.city,
        salonState: salon.state,
        salonId: salon.id,
        // Pass Google Places data from salon
        salonGooglePlaceId: salon.googlePlaceId,
        salonGoogleRating: salon.googleRating,
        salonGoogleReviewCount: salon.googleReviewCount,
        salonGoogleReviewsUrl: salon.googleReviewsUrl,
      });
    });
  });

  return stylists;
}

export type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'certs-desc' | 'rating-desc';

/**
 * Sort stylists by various criteria
 */
export function sortStylists(stylists: StylistWithSalon[], sortBy: SortOption): StylistWithSalon[] {
  const sorted = [...stylists];

  switch (sortBy) {
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));

    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));

    case 'price-asc':
      return sorted.sort((a, b) => {
        if (!a.price && !b.price) return 0;
        if (!a.price) return 1;
        if (!b.price) return -1;
        return a.price - b.price;
      });

    case 'price-desc':
      return sorted.sort((a, b) => {
        if (!a.price && !b.price) return 0;
        if (!a.price) return 1;
        if (!b.price) return -1;
        return b.price - a.price;
      });

    case 'certs-desc':
      return sorted.sort((a, b) => b.certifications.length - a.certifications.length);

    case 'rating-desc':
      return sorted.sort((a, b) => {
        // Handle missing ratings (push to end)
        if (!a.salonGoogleRating && !b.salonGoogleRating) return 0;
        if (!a.salonGoogleRating) return 1;
        if (!b.salonGoogleRating) return -1;

        // Primary sort: rating (descending)
        if (b.salonGoogleRating !== a.salonGoogleRating) {
          return b.salonGoogleRating - a.salonGoogleRating;
        }

        // Tie-breaker: review count (descending)
        const aReviews = a.salonGoogleReviewCount || 0;
        const bReviews = b.salonGoogleReviewCount || 0;
        return bReviews - aReviews;
      });

    default:
      return sorted;
  }
}
