import { ReactNode } from "react";

interface PageHeaderProps {
  /** Main title */
  title: string;
  /** Optional subtitle/description */
  description?: string;
  /** Actions to display on the right side */
  actions?: ReactNode;
  /** Use card background (default: true) */
  withBackground?: boolean;
}

/**
 * PageHeader provides a consistent header for pages
 * Includes title, optional description, and action buttons
 */
export function PageHeader({
  title,
  description,
  actions,
  withBackground = true
}: PageHeaderProps) {
  const containerClass = withBackground
    ? "border-b bg-card"
    : "border-b";

  return (
    <div className={containerClass}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-2 text-base">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
