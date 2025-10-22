import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  /** Icon to display */
  icon?: LucideIcon;
  /** Title for empty state */
  title: string;
  /** Description text */
  description?: string;
  /** Primary action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Show in card format (default: true) */
  inCard?: boolean;
  /** Custom content to render instead of default layout */
  children?: ReactNode;
}

/**
 * EmptyState displays a consistent empty state message
 * Used when lists or data sets have no items to show
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  inCard = true,
  children
}: EmptyStateProps) {
  const content = children || (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center gap-4">
      {Icon && <Icon className="w-12 h-12 text-muted-foreground" />}
      <div>
        <h3 className="font-heading text-xl font-semibold mb-2">{title}</h3>
        {description && (
          <p className="text-muted-foreground text-base">{description}</p>
        )}
      </div>
      {action && (
        <Button onClick={action.onClick} className="mt-2">
          {action.label}
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
