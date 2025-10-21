import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin, Award, Instagram, MessageSquare } from "lucide-react";
import { PageLayout } from "@/layouts/PageLayout";

export default function Landing() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-map-accent/10" />
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            Find Your Perfect<br />
            <span className="text-primary">Curly Hair Stylist</span><br />
            in Rochester
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Discover certified curly hair specialists near you. Browse by certifications, view portfolios, and join our community.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/roc">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 h-auto"
                data-testid="button-browse-stylists"
              >
                Browse Rochester Stylists
              </Button>
            </Link>
            
            <Link href="/forum">
              <Button 
                variant="outline"
                size="lg" 
                className="text-lg px-8 py-6 h-auto gap-2 bg-background/80 backdrop-blur-sm"
                data-testid="button-join-community"
              >
                <MessageSquare className="w-5 h-5" />
                Join Community
              </Button>
            </Link>
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-20 max-w-5xl mx-auto">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Certified Specialists</h3>
              <p className="text-sm text-muted-foreground">
                All stylists verified with professional certifications
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-lg bg-map-accent/10 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-map-accent" />
              </div>
              <h3 className="font-semibold text-lg">Location Search</h3>
              <p className="text-sm text-muted-foreground">
                Find stylists near you with interactive map
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <Instagram className="w-8 h-8 text-chart-3" />
              </div>
              <h3 className="font-semibold text-lg">View Their Work</h3>
              <p className="text-sm text-muted-foreground">
                Browse Instagram portfolios before booking
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Community Forum</h3>
              <p className="text-sm text-muted-foreground">
                Share experiences and ask questions
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
