import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
  /** Error title (default: "Something went wrong") */
  title?: string;
  /** Error description */
  message?: string;
  /** Callback for retry action */
  onRetry?: () => void;
  /** Custom retry button text (default: "Try again") */
  retryText?: string;
  /** Show in card format (default: true) */
  inCard?: boolean;
}

/**
 * ErrorState displays a consistent error message with optional retry
 * Used across the app for error handling
 */
export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this content. Please try again.",
  onRetry,
  retryText = "Try again",
  inCard = true
}: ErrorStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center gap-4">
      <AlertCircle className="w-12 h-12 text-destructive" />
      <div>
        <h3 className="font-heading text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-base">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-2">
          {retryText}
        </Button>
      )}
    </div>
  );

  if (inCard) {
    return (
      <Card>
        <CardContent className="p-0">
          {content}
        </CardContent>
      </Card>
    );
  }

  return content;
}
