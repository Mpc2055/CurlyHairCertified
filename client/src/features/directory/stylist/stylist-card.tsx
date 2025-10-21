import { Stylist } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Instagram, MapPin, CheckCircle2, Globe, Phone, Mail, Pencil } from "lucide-react";

interface StylistCardProps {
  stylist: Stylist & {
    salonName?: string;
    salonAddress?: string;
    salonId?: string;
  };
  onViewOnMap?: () => void;
  isSelected?: boolean;
}

export function StylistCard({ stylist, onViewOnMap, isSelected = false }: StylistCardProps) {
  const getInstagramUrl = (handle: string) => {
    const cleanHandle = handle.replace('@', '');
    return `https://instagram.com/${cleanHandle}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      className={`
        overflow-hidden hover-elevate transition-all duration-200 h-full flex flex-col
        ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
      `}
      data-testid={`card-stylist-${stylist.id}`}
      data-salon-id={stylist.salonId}
    >
      <CardContent className="p-6 flex-1 flex flex-col">
        {/* Avatar - Centered for grid view */}
        <div className="flex justify-center mb-4">
          <Avatar className="w-24 h-24 border-2 border-border">
            {stylist.photo ? (
              <AvatarImage src={stylist.photo} alt={stylist.name} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xl">
              {getInitials(stylist.name)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col text-center">
          {/* Name and Verification */}
          <div className="mb-2">
            <h3 className="font-semibold text-lg text-foreground mb-1" data-testid={`text-stylist-name-${stylist.id}`}>
              {stylist.name}
            </h3>
            {stylist.verified && (
              <Badge variant="outline" className="border-chart-3 text-chart-3 gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </Badge>
            )}
          </div>

          {/* Salon Info */}
          {stylist.salonName && (
            <div className="mb-3">
              <p className="text-sm font-medium text-muted-foreground">{stylist.salonName}</p>
              {stylist.salonAddress && (
                <p className="text-xs text-muted-foreground">{stylist.salonAddress}</p>
              )}
            </div>
          )}

          {/* Price - Prominent display */}
          {stylist.price && (
            <div className="mb-3">
              <span className="text-2xl font-bold text-primary" data-testid={`text-price-${stylist.id}`}>
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
                  variant="secondary"
                  className="text-xs"
                  data-testid={`badge-certification-${cert.id}`}
                >
                  {cert.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Contact Links - Compact for grid */}
          <div className="flex flex-col gap-2 mt-auto">
            {stylist.instagram && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2 w-full"
                data-testid={`link-instagram-${stylist.id}`}
              >
                <a href={getInstagramUrl(stylist.instagram)} target="_blank" rel="noopener noreferrer">
                  <Instagram className="w-4 h-4" />
                  Portfolio
                </a>
              </Button>
            )}

            {stylist.website && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2 w-full"
                data-testid={`link-website-${stylist.id}`}
              >
                <a href={stylist.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="w-4 h-4" />
                  Website
                </a>
              </Button>
            )}

            <div className="flex gap-2">
              {stylist.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-2 flex-1"
                  data-testid={`link-phone-${stylist.id}`}
                >
                  <a href={`tel:${stylist.phone}`}>
                    <Phone className="w-4 h-4" />
                  </a>
                </Button>
              )}

              {stylist.email && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-2 flex-1"
                  data-testid={`link-email-${stylist.id}`}
                >
                  <a href={`mailto:${stylist.email}`}>
                    <Mail className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </div>

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
        </div>
      </CardContent>
    </Card>
  );
}
