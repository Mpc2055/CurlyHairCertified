import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SortOption } from "./StylistGrid";
import { ArrowUpDown, UserPlus } from "lucide-react";
import { Link } from "wouter";

interface SortControlsProps {
  sortBy: SortOption;
  onSortChange: (sortBy: SortOption) => void;
  resultCount: number;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'price-asc', label: 'Price (Low to High)' },
  { value: 'price-desc', label: 'Price (High to Low)' },
  { value: 'certs-desc', label: 'Most Certifications' },
  { value: 'rating-desc', label: 'Highest Rated Salon' },
];

/**
 * SortControls provides sorting options for the stylist grid
 */
export function SortControls({ sortBy, onSortChange, resultCount }: SortControlsProps) {
  // Template for recommending a new stylist
  const recommendTemplate = `I'd like to recommend a certified curly hair stylist for the Rochester directory:

Stylist Name:
Salon Name:
Location (City, State):
Certifications:
Phone:
Email:
Website:
Instagram:
Curly Cut Price:
Additional Notes: `;

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="text-sm text-muted-foreground" data-testid="stylist-count">
        <span className="font-semibold text-foreground">{resultCount}</span> stylist{resultCount !== 1 ? 's' : ''} found
      </div>

      {/* Recommend a Stylist Button */}
      <Link href={`/forum/2?prefill=${encodeURIComponent(recommendTemplate)}`}>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          data-testid="button-recommend-stylist"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Recommend a Stylist</span>
        </Button>
      </Link>

      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
        <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="w-[200px]" data-testid="sort-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
