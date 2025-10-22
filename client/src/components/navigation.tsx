import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { MessageSquare, Map, BookOpen } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          <Link href="/">
            <h1 
              className="text-xl md:text-2xl font-bold text-primary cursor-pointer hover-elevate px-3 py-1.5 rounded-lg" 
              data-testid="link-home"
            >
              Curly Hair Certified
            </h1>
          </Link>

          <nav className="flex items-center gap-2">
            <Link href="/roc">
              <Button
                variant={isActive("/roc") ? "default" : "ghost"}
                size="sm"
                data-testid="nav-directory"
                className="gap-2"
              >
                <Map className="w-4 h-4" />
                <span className="hidden sm:inline">Directory</span>
              </Button>
            </Link>

            <Link href="/blog">
              <Button
                variant={isActive("/blog") ? "default" : "ghost"}
                size="sm"
                data-testid="nav-blog"
                className="gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Blog</span>
              </Button>
            </Link>

            <Link href="/forum">
              <Button
                variant={isActive("/forum") ? "default" : "ghost"}
                size="sm"
                data-testid="nav-forum"
                className="gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Forum</span>
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
