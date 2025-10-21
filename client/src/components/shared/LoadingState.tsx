import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  /** Custom message to display (default: "Loading...") */
  message?: string;
  /** Size of the spinner (default: 32) */
  size?: number;
  /** Center the content vertically (default: true) */
  centered?: boolean;
}

/**
 * LoadingState displays a consistent loading spinner with optional message
 * Used across the app for async operations
 */
export function LoadingState({
  message = "Loading...",
  size = 32,
  centered = true
}: LoadingStateProps) {
  const containerClass = centered
    ? "flex flex-col items-center justify-center min-h-[400px] gap-4"
    : "flex flex-col items-center gap-4 p-8";

  return (
    <div className={containerClass}>
      <Loader2 className="animate-spin text-primary" style={{ width: size, height: size }} />
      {message && (
        <p className="text-muted-foreground text-sm">{message}</p>
      )}
    </div>
  );
}
