import { ReactNode } from "react";
import { Navigation } from "@/components/navigation";

interface PageLayoutProps {
  children: ReactNode;
  /** Include navigation header (default: true) */
  includeNav?: boolean;
  /** Use full height layout with flex (default: false) */
  fullHeight?: boolean;
  /** Additional className for the wrapper */
  className?: string;
}

/**
 * PageLayout provides consistent structure for pages
 * - Optional navigation header
 * - Consistent background and minimum height
 * - Support for full-height layouts (for pages with maps, etc.)
 */
export function PageLayout({
  children,
  includeNav = true,
  fullHeight = false,
  className = ""
}: PageLayoutProps) {
  const wrapperClass = fullHeight
    ? `flex flex-col h-screen ${className}`
    : `min-h-screen bg-background ${className}`;

  return (
    <div className={wrapperClass}>
      {includeNav && <Navigation />}
      {children}
    </div>
  );
}
