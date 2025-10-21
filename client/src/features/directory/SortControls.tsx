import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SortOption } from "./StylistGrid";
import { ArrowUpDown } from "lucide-react";

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
];

/**
 * SortControls provides sorting options for the stylist grid
 */
export function SortControls({ sortBy, onSortChange, resultCount }: SortControlsProps) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="text-sm text-muted-foreground" data-testid="stylist-count">
        <span className="font-semibold text-foreground">{resultCount}</span> stylist{resultCount !== 1 ? 's' : ''} found
      </div>

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
