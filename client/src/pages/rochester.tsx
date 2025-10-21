import { useState, useMemo } from "react";
import { FilterOptions } from "@shared/schema";
import { FilterPanel } from "@/features/directory/filter/filter-panel";
import { SearchBar } from "@/features/directory/search/search-bar";
import { StylistGrid, flattenSalonsToStylists, sortStylists, SortOption, StylistWithSalon } from "@/features/directory/StylistGrid";
import { SortControls } from "@/features/directory/SortControls";
import { MapPanel } from "@/features/directory/MapPanel";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { PageLayout } from "@/layouts/PageLayout";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared";
import { useDirectory } from "@/hooks/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function Rochester() {
  const [selectedSalonId, setSelectedSalonId] = useState<string>();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    certifications: [],
    onlineBooking: undefined,
    minPrice: undefined,
    maxPrice: undefined,
  });

  const { data, isLoading, error } = useDirectory();

  // Flatten and filter stylists
  const filteredAndSortedStylists = useMemo(() => {
    if (!data?.salons) return [];

    // First, flatten salons to individual stylists with salon context
    const allStylists = flattenSalonsToStylists(data.salons);

    // Filter stylists
    const filtered = allStylists.filter((stylist) => {
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

    // Sort stylists
    return sortStylists(filtered, sortBy);
  }, [data?.salons, filters, sortBy]);

  // Group back to salons for map display
  const filteredSalons = useMemo(() => {
    if (!data?.salons) return [];

    return data.salons
      .map((salon) => {
        const salonStylistIds = new Set(
          filteredAndSortedStylists
            .filter(s => s.salonId === salon.id)
            .map(s => s.id)
        );

        return {
          ...salon,
          stylists: salon.stylists.filter(s => salonStylistIds.has(s.id))
        };
      })
      .filter((salon) => salon.stylists.length > 0);
  }, [data?.salons, filteredAndSortedStylists]);

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

    // Scroll to the corresponding stylist card
    setTimeout(() => {
      const card = document.querySelector(`[data-salon-id="${salonId}"]`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleStylistClick = (stylist: StylistWithSalon) => {
    setSelectedSalonId(stylist.salonId);

    // Open map if it's closed
    if (!isMapOpen) {
      setIsMapOpen(true);
    }
  };

  if (isLoading) {
    return (
      <PageLayout fullHeight>
        <LoadingState message="Loading directory..." />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout fullHeight>
        <ErrorState
          title="Failed to load directory"
          message="We couldn't load the stylist directory. Please try again."
          onRetry={() => window.location.reload()}
          inCard={false}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Search Bar */}
      <div className="border-b bg-background px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
          />
        </div>
      </div>

      {/* Main Content: Sidebar + Grid Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar - Filters */}
        <aside className="hidden lg:block w-[260px] border-r bg-background overflow-y-auto">
          <div className="p-6 sticky top-0">
            <FilterPanel
              certifications={data?.certifications || []}
              filters={filters}
              onFilterChange={setFilters}
              activeFilterCount={activeFilterCount}
              onOpenMap={() => setIsMapOpen(true)}
            />
          </div>
        </aside>

        {/* Main Stylist Grid */}
        <main
          className={`
            flex-1 overflow-y-auto transition-all duration-300 ease-in-out
            ${isMapOpen ? 'lg:mr-[45%]' : ''}
          `}
        >
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Mobile Filter Button */}
            <div className="lg:hidden">
              <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2 w-full">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterPanel
                      certifications={data?.certifications || []}
                      filters={filters}
                      onFilterChange={setFilters}
                      activeFilterCount={activeFilterCount}
                      onOpenMap={() => {
                        setIsMapOpen(true);
                        setIsMobileFilterOpen(false);
                      }}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Sort Controls */}
            <SortControls
              sortBy={sortBy}
              onSortChange={setSortBy}
              resultCount={filteredAndSortedStylists.length}
            />

            {/* Stylist Grid */}
            {filteredAndSortedStylists.length === 0 ? (
              <EmptyState
                title="No stylists found"
                description="Try adjusting your filters to see more results"
                action={{
                  label: "Clear Filters",
                  onClick: () => setFilters({
                    certifications: [],
                    onlineBooking: undefined,
                    minPrice: undefined,
                    maxPrice: undefined,
                  })
                }}
              />
            ) : (
              <StylistGrid
                stylists={filteredAndSortedStylists}
                onStylistClick={handleStylistClick}
                selectedSalonId={selectedSalonId}
                isMapOpen={isMapOpen}
              />
            )}
          </div>
        </main>

        {/* Map Panel - Slides in from right on desktop, bottom sheet on mobile */}
        <MapPanel
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          onToggle={() => setIsMapOpen(!isMapOpen)}
          salons={filteredSalons}
          selectedSalonId={selectedSalonId}
          onMarkerClick={handleMarkerClick}
        />
      </div>
    </PageLayout>
  );
}
