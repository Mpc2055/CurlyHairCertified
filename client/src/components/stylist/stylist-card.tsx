import { Stylist } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Instagram, MapPin, CheckCircle2, Globe, Phone, Mail } from "lucide-react";

interface StylistCardProps {
  stylist: Stylist;
  onViewOnMap?: () => void;
}

export function StylistCard({ stylist, onViewOnMap }: StylistCardProps) {
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
    <Card className="overflow-hidden hover-elevate transition-all duration-200" data-testid={`card-stylist-${stylist.id}`}>
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Avatar */}
          <Avatar className="w-20 h-20 border-2 border-border">
            {stylist.photo ? (
              <AvatarImage src={stylist.photo} alt={stylist.name} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
              {getInitials(stylist.name)}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Name and Verification */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-lg text-foreground" data-testid={`text-stylist-name-${stylist.id}`}>
                {stylist.name}
              </h3>
              {stylist.verified && (
                <Badge variant="outline" className="border-chart-3 text-chart-3 gap-1 flex-shrink-0">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </Badge>
              )}
            </div>

            {/* Certifications */}
            {stylist.certifications.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
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

            {/* Price and Online Booking */}
            <div className="flex items-center gap-3 mb-3 text-sm">
              {stylist.price && (
                <span className="font-semibold text-primary" data-testid={`text-price-${stylist.id}`}>
                  ${stylist.price}
                </span>
              )}
              {stylist.canBookOnline && (
                <Badge variant="outline" className="text-xs">
                  Online Booking
                </Badge>
              )}
            </div>

            {/* Contact Links */}
            <div className="flex flex-wrap gap-2">
              {stylist.instagram && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-2"
                  data-testid={`link-instagram-${stylist.id}`}
                >
                  <a href={getInstagramUrl(stylist.instagram)} target="_blank" rel="noopener noreferrer">
                    <Instagram className="w-4 h-4" />
                    {stylist.instagram}
                  </a>
                </Button>
              )}
              
              {stylist.website && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-2"
                  data-testid={`link-website-${stylist.id}`}
                >
                  <a href={stylist.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                </Button>
              )}
              
              {stylist.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-2"
                  data-testid={`link-phone-${stylist.id}`}
                >
                  <a href={`tel:${stylist.phone}`}>
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                </Button>
              )}
              
              {stylist.email && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-2"
                  data-testid={`link-email-${stylist.id}`}
                >
                  <a href={`mailto:${stylist.email}`}>
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                </Button>
              )}
            </div>

            {/* View on Map Button */}
            {onViewOnMap && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 gap-2"
                onClick={onViewOnMap}
                data-testid={`button-view-map-${stylist.id}`}
              >
                <MapPin className="w-4 h-4" />
                View on Map
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
