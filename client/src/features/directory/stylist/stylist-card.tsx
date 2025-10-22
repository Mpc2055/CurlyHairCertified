import { useState } from "react";
import { Stylist } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Instagram, Globe, Phone, Mail, Pencil, Star } from "lucide-react";
import { SalonRatingDialog } from "./salon-rating-dialog";

interface StylistCardProps {
  stylist: Stylist & {
    salonName?: string;
    salonAddress?: string;
    salonCity?: string;
    salonState?: string;
    salonId?: string;
    salonGooglePlaceId?: string;
    salonGoogleRating?: number;
    salonGoogleReviewCount?: number;
    salonGoogleReviewsUrl?: string;
  };
  onViewOnMap?: () => void;
  isSelected?: boolean;
}

export function StylistCard({ stylist, onViewOnMap, isSelected = false }: StylistCardProps) {
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);

  const getInstagramUrl = (handle: string) => {
    const cleanHandle = handle.replace('@', '');
    return `https://instagram.com/${cleanHandle}`;
  };

  // Check if we should display salon rating
  const hasRating =
    stylist.salonGoogleRating &&
    stylist.salonGoogleReviewCount &&
    stylist.salonGoogleReviewsUrl &&
    stylist.salonGooglePlaceId !== 'NOT_FOUND';

  return (
    <Card
      className={`
        overflow-hidden hover-elevate transition-all duration-200 h-full flex flex-col
        hover:shadow-lg hover:scale-[1.02]
        ${isSelected ? 'ring-2 ring-primary ring-offset-2 shadow-xl' : ''}
      `}
      data-testid={`card-stylist-${stylist.id}`}
      data-salon-id={stylist.salonId}
    >
      <CardContent className="p-4 flex-1 flex flex-col">
        {/* Content */}
        <div className="flex-1 flex flex-col text-center">
          {/* Stylist Name - Hero Element */}
          <div className="mb-2">
            <h3 className="font-heading font-bold text-2xl tracking-tight text-foreground mb-1" data-testid={`text-stylist-name-${stylist.id}`}>
              {stylist.name}
            </h3>
          </div>

          {/* Salon Info - Two Line Compact */}
          {stylist.salonName && (
            <div className="mb-2">
              {/* Line 1: Salon Name + Rating */}
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">{stylist.salonName}</span>
                {hasRating && (
                  <>
                    <span className="mx-1">•</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsRatingDialogOpen(true);
                      }}
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                      data-testid={`button-salon-rating-${stylist.id}`}
                    >
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{stylist.salonGoogleRating?.toFixed(1)}</span>
                      <span className="text-xs">({stylist.salonGoogleReviewCount?.toLocaleString()})</span>
                    </button>
                  </>
                )}
              </div>
              {/* Line 2: City, State */}
              {stylist.salonCity && stylist.salonState && (
                <div className="text-xs text-muted-foreground">
                  {stylist.salonCity}, {stylist.salonState}
                </div>
              )}
            </div>
          )}

          {/* Price - Prominent display */}
          {stylist.price && (
            <div className="mb-3">
              <span className="font-heading text-3xl font-bold text-primary" data-testid={`text-price-${stylist.id}`}>
                ${stylist.price}
              </span>
            </div>
          )}

          {/* Certifications */}
          {stylist.certifications.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 justify-center">
              {stylist.certifications.map((cert) => (
                <Badge
                  key={cert.id}
                  variant="outline"
                  className="text-xs border-primary/30 text-primary bg-primary/5 font-medium px-3 py-1"
                  data-testid={`badge-certification-${cert.id}`}
                >
                  {cert.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Contact Icons - Horizontal Row with Tooltips */}
          <TooltipProvider>
            <div className="flex gap-2 justify-center mt-auto mb-2">
              {stylist.instagram && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      asChild
                      className="h-9 w-9"
                      data-testid={`link-instagram-${stylist.id}`}
                    >
                      <a href={getInstagramUrl(stylist.instagram)} target="_blank" rel="noopener noreferrer">
                        <Instagram className="w-4 h-4" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Instagram</TooltipContent>
                </Tooltip>
              )}

              {stylist.website && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      asChild
                      className="h-9 w-9"
                      data-testid={`link-website-${stylist.id}`}
                    >
                      <a href={stylist.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Website</TooltipContent>
                </Tooltip>
              )}

              {stylist.phone && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      asChild
                      className="h-9 w-9"
                      data-testid={`link-phone-${stylist.id}`}
                    >
                      <a href={`tel:${stylist.phone}`}>
                        <Phone className="w-4 h-4" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Phone</TooltipContent>
                </Tooltip>
              )}

              {stylist.email && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      asChild
                      className="h-9 w-9"
                      data-testid={`link-email-${stylist.id}`}
                    >
                      <a href={`mailto:${stylist.email}`}>
                        <Mail className="w-4 h-4" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Email</TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>

            {/* Suggest Correction Link */}
            <div className="mt-2 pt-2 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="gap-2 w-full text-muted-foreground hover:text-foreground"
                data-testid={`link-suggest-correction-${stylist.id}`}
              >
                <a
                  href={`/forum/1?prefill=${encodeURIComponent(`Re: ${stylist.name}\n\nIssue: `)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Pencil className="w-3 h-3" />
                  Suggest Correction
                </a>
              </Button>
            </div>
        </div>
      </CardContent>

      {/* Salon Rating Dialog */}
      {hasRating && stylist.salonName && (
        <SalonRatingDialog
          open={isRatingDialogOpen}
          onOpenChange={setIsRatingDialogOpen}
          salonName={stylist.salonName}
          rating={stylist.salonGoogleRating!}
          reviewCount={stylist.salonGoogleReviewCount!}
          reviewsUrl={stylist.salonGoogleReviewsUrl!}
        />
      )}
    </Card>
  );
}
