import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink } from "lucide-react";

interface SalonRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salonName: string;
  rating: number;
  reviewCount: number;
  reviewsUrl: string;
}

export function SalonRatingDialog({
  open,
  onOpenChange,
  salonName,
  rating,
  reviewCount,
  reviewsUrl,
}: SalonRatingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Salon Reviews</DialogTitle>
          <DialogDescription>
            Reviews for {salonName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {/* Large Rating Display */}
          <div className="flex items-center gap-2">
            <Star className="w-12 h-12 fill-yellow-400 text-yellow-400" />
            <div className="flex flex-col">
              <span className="text-4xl font-bold">{rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                {reviewCount.toLocaleString()} {reviewCount === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          </div>

          {/* Clarification Message */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              These are reviews for <span className="font-medium text-foreground">{salonName}</span>, not the individual stylist.
              They reflect the overall salon experience including atmosphere, cleanliness, and booking process.
            </p>
          </div>

          {/* Link to Google Reviews */}
          <Button
            asChild
            className="w-full gap-2"
            size="lg"
          >
            <a
              href={reviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Read all reviews on Google
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
