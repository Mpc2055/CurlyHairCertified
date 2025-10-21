import { Salon } from "@shared/schema";
import { StylistCard } from "@/components/stylist/stylist-card";
import { MapPin, Phone, Globe } from "lucide-react";

interface SalonGroupProps {
  salon: Salon;
  onViewOnMap: (salonId: string) => void;
}

export function SalonGroup({ salon, onViewOnMap }: SalonGroupProps) {
  return (
    <div className="space-y-4" data-testid={`salon-group-${salon.id}`}>
      {/* Salon Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground" data-testid={`text-salon-name-${salon.id}`}>
          {salon.name}
        </h2>
        
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{salon.address}</span>
          </div>
          
          {salon.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <a href={`tel:${salon.phone}`} className="hover:text-foreground transition-colors">
                {salon.phone}
              </a>
            </div>
          )}
          
          {salon.website && (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <a 
                href={salon.website.startsWith('http') ? salon.website : `https://${salon.website}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Visit Website
              </a>
            </div>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground">
          {salon.stylists.length} {salon.stylists.length === 1 ? 'stylist' : 'stylists'}
        </p>
      </div>

      {/* Stylists */}
      <div className="space-y-3">
        {salon.stylists.map((stylist) => (
          <StylistCard
            key={stylist.id}
            stylist={stylist}
            onViewOnMap={() => onViewOnMap(salon.id)}
          />
        ))}
      </div>
    </div>
  );
}
