import { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface RootLayoutProps {
  children: ReactNode;
}

/**
 * RootLayout wraps the entire application with global providers
 * - ErrorBoundary for error handling
 * - QueryClientProvider for data fetching
 * - TooltipProvider for Radix UI tooltips
 * - Toaster for toast notifications
 */
export function RootLayout({ children }: RootLayoutProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          {children}
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
