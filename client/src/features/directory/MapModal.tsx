import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GoogleMap } from "./map/google-map";
import { Salon } from "@shared/schema";

interface MapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salons: Salon[];
  selectedSalonId?: string;
  onMarkerClick: (salonId: string) => void;
}

/**
 * MapModal displays the map in a fullscreen overlay
 * Keeps map as a secondary feature without dominating the main view
 */
export function MapModal({ open, onOpenChange, salons, selectedSalonId, onMarkerClick }: MapModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] h-[95vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Stylist Locations</DialogTitle>
        </DialogHeader>
        <div className="flex-1 h-[calc(95vh-80px)]">
          <GoogleMap
            salons={salons}
            selectedSalonId={selectedSalonId}
            onMarkerClick={onMarkerClick}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
