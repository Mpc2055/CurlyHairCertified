import { config } from '../../config';

const FIND_PLACE_URL = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json';
const PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';

export interface PlaceSearchResult {
  placeId: string | null;
}

export interface PlaceDetails {
  placeId: string;
  rating?: number;
  reviewCount?: number;
  reviewsUrl?: string;
}

interface FindPlaceResponse {
  candidates?: Array<{ place_id: string }>;
  status: string;
}

interface PlaceDetailsResponse {
  result?: {
    rating?: number;
    user_ratings_total?: number;
    url?: string;
  };
  status: string;
}

/**
 * Find Place ID for a business using name and address
 * Tries multiple search strategies if initial search fails
 */
export async function findPlaceId(
  businessName: string,
  address: string
): Promise<PlaceSearchResult> {
  if (!config.google.placesApiKey) {
    console.error('[google-places] GOOGLE_PLACES_API_KEY not set');
    return { placeId: null };
  }

  // Strategy 1: Full name + address
  let placeId = await searchPlace(`${businessName} ${address}`);

  // Strategy 2: Name + city/state only (if full address failed)
  if (!placeId) {
    const cityState = extractCityState(address);
    if (cityState) {
      console.log(`[google-places] Retrying with city/state: ${businessName} ${cityState}`);
      placeId = await searchPlace(`${businessName} ${cityState}`);
    }
  }

  // Strategy 3: Just name (last resort)
  if (!placeId) {
    console.log(`[google-places] Retrying with name only: ${businessName}`);
    placeId = await searchPlace(businessName);
  }

  return { placeId };
}

/**
 * Get detailed information for a Place ID
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  if (!config.google.placesApiKey) {
    console.error('[google-places] GOOGLE_PLACES_API_KEY not set');
    return null;
  }

  try {
    const url = `${PLACE_DETAILS_URL}?place_id=${encodeURIComponent(placeId)}&fields=rating,user_ratings_total,url&key=${config.google.placesApiKey}`;

    const response = await fetch(url);
    const data = await response.json() as PlaceDetailsResponse;

    if (data.status !== 'OK' || !data.result) {
      console.error(`[google-places] Failed to get details for ${placeId}: ${data.status}`);
      return null;
    }

    return {
      placeId,
      rating: data.result.rating,
      reviewCount: data.result.user_ratings_total,
      reviewsUrl: data.result.url,
    };
  } catch (error) {
    console.error(`[google-places] Error fetching details for ${placeId}:`, error);
    return null;
  }
}

/**
 * Helper: Search for a place using Find Place API
 */
async function searchPlace(query: string): Promise<string | null> {
  try {
    const url = `${FIND_PLACE_URL}?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id&key=${config.google.placesApiKey}`;

    const response = await fetch(url);
    const data = await response.json() as FindPlaceResponse;

    if (data.status === 'OK' && data.candidates && data.candidates.length > 0) {
      console.log(`[google-places] Found Place ID for "${query}": ${data.candidates[0].place_id}`);
      return data.candidates[0].place_id;
    }

    if (data.status !== 'OK') {
      console.warn(`[google-places] Search failed for "${query}": ${data.status}`);
    }

    return null;
  } catch (error) {
    console.error(`[google-places] Error searching for "${query}":`, error);
    return null;
  }
}

/**
 * Helper: Extract city and state from full address
 * Expected format: "Street, Suite, City, STATE ZIP"
 */
function extractCityState(address: string): string | null {
  // Address format: "Street, City, STATE ZIP" or "Street, Suite, City, STATE ZIP"
  const parts = address.split(',').map(p => p.trim());

  if (parts.length >= 2) {
    // Get last part (should be "STATE ZIP")
    const lastPart = parts[parts.length - 1];
    // Extract state (2 letters before ZIP)
    const stateMatch = lastPart.match(/([A-Z]{2})\s+\d{5}/);

    if (stateMatch && parts.length >= 2) {
      // Get city (second to last part)
      const city = parts[parts.length - 2];
      return `${city}, ${stateMatch[1]}`;
    }
  }

  return null;
}
