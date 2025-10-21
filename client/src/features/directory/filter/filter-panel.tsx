import { useState } from "react";
import { FilterOptions } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, MapIcon } from "lucide-react";

interface FilterPanelProps {
  organizations: string[];
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  activeFilterCount: number;
  onOpenMap?: () => void;
}

export function FilterPanel({ organizations, filters, onFilterChange, activeFilterCount, onOpenMap }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  const handleOrganizationToggle = (orgName: string) => {
    const newOrgs = localFilters.organizations.includes(orgName)
      ? localFilters.organizations.filter(o => o !== orgName)
      : [...localFilters.organizations, orgName];

    const updated = { ...localFilters, organizations: newOrgs };
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
      organizations: [],
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
        {/* Issuing Organizations */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Issuing Organization</Label>
          <div className="space-y-2">
            {organizations.map((org) => (
              <div key={org} className="flex items-center gap-2">
                <Checkbox
                  id={`org-${org}`}
                  checked={localFilters.organizations.includes(org)}
                  onCheckedChange={() => handleOrganizationToggle(org)}
                  data-testid={`checkbox-org-${org}`}
                />
                <label
                  htmlFor={`org-${org}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {org}
                </label>
              </div>
            ))}
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
