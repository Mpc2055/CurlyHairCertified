import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DirectoryData, FilterOptions, Salon } from "@shared/schema";
import { GoogleMap } from "@/components/map/google-map";
import { FilterPanel } from "@/components/filter/filter-panel";
import { SearchBar } from "@/components/search/search-bar";
import { SalonGroup } from "@/components/salon/salon-group";
import { Button } from "@/components/ui/button";
import { Loader2, Map, List } from "lucide-react";
import { Link } from "wouter";

export default function Rochester() {
  const [selectedSalonId, setSelectedSalonId] = useState<string>();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    certifications: [],
    onlineBooking: undefined,
    minPrice: undefined,
    maxPrice: undefined,
  });
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const { data, isLoading, error } = useQuery<DirectoryData>({
    queryKey: ['/api/directory'],
  });

  // Filter salons based on current filters
  const filteredSalons = useMemo(() => {
    if (!data?.salons) return [];

    return data.salons
      .map((salon) => {
        // Filter stylists within each salon
        const filteredStylists = salon.stylists.filter((stylist) => {
          // Certification filter
          if (filters.certifications.length > 0) {
            const hasCert = stylist.certifications.some(cert =>
              filters.certifications.includes(cert.name)
            );
            if (!hasCert) return false;
          }

          // Online booking filter
          if (filters.onlineBooking && !stylist.canBookOnline) {
            return false;
          }

          // Price filter
          if (stylist.price) {
            if (filters.minPrice && stylist.price < filters.minPrice) return false;
            if (filters.maxPrice && stylist.price > filters.maxPrice) return false;
          }

          return true;
        });

        return { ...salon, stylists: filteredStylists };
      })
      .filter((salon) => salon.stylists.length > 0);
  }, [data?.salons, filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.certifications.length > 0) count += filters.certifications.length;
    if (filters.onlineBooking) count += 1;
    if (filters.minPrice) count += 1;
    if (filters.maxPrice) count += 1;
    return count;
  }, [filters]);

  const handleSearch = () => {
    // TODO: Implement geocoding and proximity search in backend
    console.log("Search:", searchQuery);
  };

  const handleMarkerClick = (salonId: string) => {
    setSelectedSalonId(salonId);
    // Scroll to salon in list
    const element = document.querySelector(`[data-testid="salon-group-${salonId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleViewOnMap = (salonId: string) => {
    setSelectedSalonId(salonId);
    setViewMode('map');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6">
        <p className="text-destructive text-lg">Failed to load directory data</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b bg-background px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <Link href="/">
            <h1 className="text-2xl font-bold text-primary cursor-pointer hover-elevate px-3 py-1 rounded-lg" data-testid="link-home">
              Curly Hair Certified
            </h1>
          </Link>
          <div className="flex-1 max-w-2xl">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
            />
          </div>
        </div>
      </header>

      {/* Mobile View Toggle */}
      <div className="md:hidden border-b bg-background p-2 flex gap-2">
        <Button
          variant={viewMode === 'map' ? 'default' : 'outline'}
          className="flex-1 gap-2"
          onClick={() => setViewMode('map')}
          data-testid="button-toggle-map"
        >
          <Map className="w-4 h-4" />
          Map
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          className="flex-1 gap-2"
          onClick={() => setViewMode('list')}
          data-testid="button-toggle-list"
        >
          <List className="w-4 h-4" />
          List
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map - Desktop or Mobile Map View */}
        <div className={`${viewMode === 'map' ? 'block' : 'hidden'} md:block md:w-3/5 h-full`}>
          <GoogleMap
            salons={filteredSalons}
            selectedSalonId={selectedSalonId}
            onMarkerClick={handleMarkerClick}
          />
        </div>

        {/* List - Desktop or Mobile List View */}
        <div className={`${viewMode === 'list' ? 'flex' : 'hidden'} md:flex md:w-2/5 flex-col h-full border-l`}>
          {/* Filter Panel */}
          <div className="p-6 border-b bg-background flex-shrink-0">
            <FilterPanel
              certifications={data?.certifications || []}
              filters={filters}
              onFilterChange={setFilters}
              activeFilterCount={activeFilterCount}
            />
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {filteredSalons.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No stylists found matching your criteria</p>
                <Button
                  variant="outline"
                  onClick={() => setFilters({
                    certifications: [],
                    onlineBooking: undefined,
                    minPrice: undefined,
                    maxPrice: undefined,
                  })}
                  data-testid="button-clear-filters-empty"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="text-sm text-muted-foreground" data-testid="text-results-count">
                  {filteredSalons.reduce((acc, salon) => acc + salon.stylists.length, 0)} stylists found
                  {activeFilterCount > 0 && ` (${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active)`}
                </div>
                
                {filteredSalons.map((salon) => (
                  <SalonGroup
                    key={salon.id}
                    salon={salon}
                    onViewOnMap={handleViewOnMap}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
