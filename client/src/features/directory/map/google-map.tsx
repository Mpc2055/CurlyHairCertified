import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { Salon } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface GoogleMapProps {
  salons: Salon[];
  selectedSalonId?: string;
  onMarkerClick: (salonId: string) => void;
  center?: { lat: number; lng: number };
}

// Configure API loader once
setOptions({
  key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  version: "weekly",
});

export function GoogleMap({ salons, selectedSalonId, onMarkerClick, center }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      try {
        if (!mapRef.current) return;

        // Import Maps library
        const { Map } = await importLibrary("maps") as google.maps.MapsLibrary;

        // Default to Rochester, NY center
        const defaultCenter = center || { lat: 43.1566, lng: -77.6088 };

        // Create map with Map ID (required for AdvancedMarkers)
        // Note: When using mapId, styles must be configured in Google Cloud Console
        const map = new Map(mapRef.current, {
          center: defaultCenter,
          zoom: 11,
          mapId: "CURLY_HAIR_CERTIFIED_MAP",
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
        });

        mapInstanceRef.current = map;
        setIsLoading(false);
      } catch (err) {
        console.error("Map initialization error:", err);
        setError("Failed to load map. Please check your API key configuration.");
        setIsLoading(false);
      }
    };

    initMap();
  }, [center]);

  // Create custom marker content
  const createMarkerContent = (salon: Salon, isSelected: boolean): HTMLDivElement => {
    const content = document.createElement("div");
    content.className = `custom-map-marker ${isSelected ? "selected" : ""}`;
    content.setAttribute("data-salon-id", salon.id);
    
    content.innerHTML = `
      <div class="marker-circle">
        <span class="marker-count">${salon.stylists.length}</span>
      </div>
    `;

    return content;
  };

  // Update markers when salons change
  useEffect(() => {
    const updateMarkers = async () => {
      if (!mapInstanceRef.current || salons.length === 0) return;

      try {
        // Import marker library
        const { AdvancedMarkerElement } = await importLibrary("marker") as google.maps.MarkerLibrary;

        // Clear existing markers
        markersRef.current.forEach((marker) => {
          marker.map = null;
        });
        markersRef.current.clear();

        // Create new Advanced Markers
        salons.forEach((salon) => {
          const content = createMarkerContent(salon, salon.id === selectedSalonId);

          const marker = new AdvancedMarkerElement({
            map: mapInstanceRef.current,
            position: { lat: salon.lat, lng: salon.lng },
            content: content,
            title: salon.name,
            gmpClickable: true,
          });

          // Add click listener
          marker.addListener("click", () => {
            onMarkerClick(salon.id);
          });

          markersRef.current.set(salon.id, marker);
        });

        // Fit bounds to show all markers
        if (salons.length > 0) {
          const bounds = new google.maps.LatLngBounds();
          salons.forEach((salon) => {
            bounds.extend({ lat: salon.lat, lng: salon.lng });
          });
          mapInstanceRef.current.fitBounds(bounds);
        }
      } catch (err) {
        console.error("Error creating markers:", err);
      }
    };

    updateMarkers();
  }, [salons, onMarkerClick, selectedSalonId]);

  // Highlight selected marker with animation
  useEffect(() => {
    if (!selectedSalonId) return;

    markersRef.current.forEach((marker, salonId) => {
      const content = marker.content as HTMLElement;
      
      if (salonId === selectedSalonId) {
        // Add selected styling and bounce animation
        content.classList.add("selected", "bounce");
        marker.zIndex = 1000;

        // Remove bounce animation after it completes
        setTimeout(() => {
          content.classList.remove("bounce");
        }, 600);

        // Pan to marker
        if (marker.position && mapInstanceRef.current) {
          mapInstanceRef.current.panTo(marker.position as google.maps.LatLngLiteral);
          mapInstanceRef.current.setZoom(13);
        }
      } else {
        // Remove selected styling
        content.classList.remove("selected", "bounce");
        marker.zIndex = null;
      }
    });
  }, [selectedSalonId]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted" data-testid="map-error">
        <div className="text-center p-6">
          <p className="text-destructive font-medium mb-2">Map Loading Error</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" data-testid="google-map" />
    </div>
  );
}
