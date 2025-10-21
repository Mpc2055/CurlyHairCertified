interface GeocodeResult {
  lat: number;
  lng: number;
}

interface GeocodeCache {
  [address: string]: GeocodeResult;
}

// In-memory cache for geocoded addresses
const geocodeCache: GeocodeCache = {};

export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  // Check cache first
  if (geocodeCache[address]) {
    return geocodeCache[address];
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      const result: GeocodeResult = {
        lat: location.lat,
        lng: location.lng,
      };

      // Cache the result
      geocodeCache[address] = result;
      return result;
    } else {
      // Default to Rochester, NY center if geocoding fails
      console.error(`Geocoding failed for address: ${address}`, data.status);
      return { lat: 43.1566, lng: -77.6088 };
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    // Default to Rochester, NY center
    return { lat: 43.1566, lng: -77.6088 };
  }
}

export function buildFullAddress(fields: {
  "Street Address": string;
  "Suite or Unit"?: string;
  City: string;
  State: string;
  "ZIP Code": string;
}): string {
  const parts = [fields["Street Address"]];
  if (fields["Suite or Unit"]) {
    parts[0] += ` ${fields["Suite or Unit"]}`;
  }
  parts.push(fields.City);
  parts.push(fields.State);
  parts.push(fields["ZIP Code"]);
  return parts.join(", ");
}
