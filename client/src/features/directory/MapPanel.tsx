import { ChevronLeft, ChevronRight, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { GoogleMap } from "./map/google-map";
import { Salon } from "@shared/schema";

interface MapPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle?: () => void;
  salons: Salon[];
  selectedSalonId?: string;
  onMarkerClick: (salonId: string) => void;
}

/**
 * MapPanel displays the map as a collapsible side panel
 * Desktop: Slides in from right, grid adjusts to 2 columns
 * Mobile: Bottom sheet overlay
 */
export function MapPanel({ isOpen, onClose, onToggle, salons, selectedSalonId, onMarkerClick }: MapPanelProps) {
  const handleToggle = onToggle || onClose;

  return (
    <>
      {/* Closed State Toggle Tab - Floating on right edge */}
      {!isOpen && (
        <button
          onClick={handleToggle}
          className="
            hidden lg:flex
            fixed right-0 top-1/2 -translate-y-1/2
            flex-col items-center justify-center gap-1
            w-8 h-20
            bg-background border border-r-0 rounded-l-md shadow-md
            hover:bg-accent hover:scale-105
            transition-all duration-200 ease-in-out
            z-40
            group
          "
          data-testid="open-map-toggle"
          aria-label="Open map"
        >
          <Map className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      )}

      {/* Desktop: Fixed Side Panel */}
      <div
        className={`
          hidden lg:block
          fixed top-0 right-0 bottom-0
          w-[45%] bg-background border-l shadow-2xl
          transition-transform duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Toggle Handle on Left Edge */}
        <button
          onClick={handleToggle}
          className="
            absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full
            flex items-center justify-center
            w-8 h-32
            bg-background border border-r-0 rounded-l-md shadow-md
            hover:bg-accent hover:scale-105
            transition-all duration-200 ease-in-out
            group
          "
          data-testid="toggle-map-panel"
          aria-label="Collapse map"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-center p-4 border-b bg-background">
          <h2 className="text-lg font-semibold">Stylist Locations</h2>
        </div>

        {/* Map */}
        <div className="h-[calc(100%-57px)]">
          {isOpen && (
            <GoogleMap
              salons={salons}
              selectedSalonId={selectedSalonId}
              onMarkerClick={onMarkerClick}
            />
          )}
        </div>
      </div>

      {/* Mobile: Bottom Sheet */}
      <Sheet open={isOpen && typeof window !== 'undefined' && window.innerWidth < 1024} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="bottom" className="h-[50vh] p-0 lg:hidden">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Stylist Locations</SheetTitle>
          </SheetHeader>
          <div className="h-[calc(50vh-65px)]">
            <GoogleMap
              salons={salons}
              selectedSalonId={selectedSalonId}
              onMarkerClick={onMarkerClick}
            />
          </div>
        </SheetContent>
      </Sheet>

    </>
  );
}
