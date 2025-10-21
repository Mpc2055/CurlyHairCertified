import { useEffect, useRef, useState } from "react";
import { Salon } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface GoogleMapProps {
  salons: Salon[];
  selectedSalonId?: string;
  onMarkerClick: (salonId: string) => void;
  center?: { lat: number; lng: number };
}

export function GoogleMap({ salons, selectedSalonId, onMarkerClick, center }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      try {
        if (!mapRef.current) return;

        // Default to Rochester, NY center
        const defaultCenter = center || { lat: 43.1566, lng: -77.6088 };

        const map = new google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 11,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
        });

        mapInstanceRef.current = map;
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load map");
        setIsLoading(false);
      }
    };

    if (window.google && window.google.maps) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.onload = () => initMap();
      script.onerror = () => {
        setError("Failed to load Google Maps");
        setIsLoading(false);
      };
      document.head.appendChild(script);
    }
  }, [center]);

  // Update markers when salons change
  useEffect(() => {
    if (!mapInstanceRef.current || salons.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current.clear();

    // Create new markers
    salons.forEach((salon) => {
      const marker = new google.maps.Marker({
        position: { lat: salon.lat, lng: salon.lng },
        map: mapInstanceRef.current!,
        title: salon.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#e91e63",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
        label: {
          text: salon.stylists.length.toString(),
          color: "#ffffff",
          fontSize: "12px",
          fontWeight: "bold",
        },
      });

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
  }, [salons, onMarkerClick]);

  // Highlight selected marker
  useEffect(() => {
    if (!selectedSalonId) return;

    markersRef.current.forEach((marker, salonId) => {
      if (salonId === selectedSalonId) {
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: "#e91e63",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 4,
        });
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => marker.setAnimation(null), 1500);

        // Pan to marker
        const position = marker.getPosition();
        if (position && mapInstanceRef.current) {
          mapInstanceRef.current.panTo(position);
          mapInstanceRef.current.setZoom(13);
        }
      } else {
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#e91e63",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        });
      }
    });
  }, [selectedSalonId]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <p className="text-destructive">{error}</p>
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
      <div ref={mapRef} className="w-full h-full" data-testid="map-container" />
    </div>
  );
}
