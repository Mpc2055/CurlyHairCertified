import { useState } from "react";
import { FilterOptions, Certification } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, MapIcon } from "lucide-react";

interface FilterPanelProps {
  certifications: Certification[];
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  activeFilterCount: number;
  onOpenMap?: () => void;
}

export function FilterPanel({ certifications, filters, onFilterChange, activeFilterCount, onOpenMap }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  const handleCertificationToggle = (certName: string) => {
    const newCerts = localFilters.certifications.includes(certName)
      ? localFilters.certifications.filter(c => c !== certName)
      : [...localFilters.certifications, certName];
    
    const updated = { ...localFilters, certifications: newCerts };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handleOnlineBookingToggle = (checked: boolean) => {
    const updated = { ...localFilters, onlineBooking: checked || undefined };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value) : undefined;
    const updated = type === 'min' 
      ? { ...localFilters, minPrice: numValue }
      : { ...localFilters, maxPrice: numValue };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const clearAllFilters = () => {
    const cleared: FilterOptions = {
      certifications: [],
      onlineBooking: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      searchLocation: undefined,
    };
    setLocalFilters(cleared);
    onFilterChange(cleared);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Filters</CardTitle>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="gap-2"
            data-testid="button-clear-filters"
          >
            <X className="w-4 h-4" />
            Clear ({activeFilterCount})
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Certifications */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Certifications</Label>
          <div className="space-y-2">
            {certifications.map((cert) => (
              <div key={cert.id} className="flex items-center gap-2">
                <Checkbox
                  id={`cert-${cert.id}`}
                  checked={localFilters.certifications.includes(cert.name)}
                  onCheckedChange={() => handleCertificationToggle(cert.name)}
                  data-testid={`checkbox-cert-${cert.id}`}
                />
                <label
                  htmlFor={`cert-${cert.id}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {cert.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Online Booking */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Availability</Label>
          <div className="flex items-center gap-2">
            <Checkbox
              id="online-booking"
              checked={localFilters.onlineBooking || false}
              onCheckedChange={handleOnlineBookingToggle}
              data-testid="checkbox-online-booking"
            />
            <label htmlFor="online-booking" className="text-sm cursor-pointer">
              Online Booking Available
            </label>
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Price Range</Label>
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Min"
                value={localFilters.minPrice || ''}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                data-testid="input-min-price"
              />
            </div>
            <span className="text-muted-foreground">to</span>
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Max"
                value={localFilters.maxPrice || ''}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                data-testid="input-max-price"
              />
            </div>
          </div>
        </div>

        {/* Map Button */}
        {onOpenMap && (
          <div className="pt-6 border-t">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={onOpenMap}
              data-testid="button-open-map"
            >
              <MapIcon className="w-4 h-4" />
              View Map
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
