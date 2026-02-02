import * as React from 'react';
import { ChevronLeft } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { Button } from '../base/Button.js';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Page title */
  title: string;
  /** Page description/subtitle */
  description?: string;
  /** Back button click handler (shows back button when provided) */
  onBack?: () => void;
  /** Back button label */
  backLabel?: string;
  /** Action buttons or other elements */
  actions?: React.ReactNode;
  /** Breadcrumb navigation */
  breadcrumb?: React.ReactNode;
  /** Badge or tag to show next to the title */
  badge?: React.ReactNode;
  /** Whether the header is sticky */
  sticky?: boolean;
}

/**
 * PageHeader component for consistent page headings.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="Matter Details"
 *   description="View and manage matter information"
 *   onBack={() => navigate(-1)}
 *   actions={<Button>Edit</Button>}
 * />
 * ```
 */
const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  (
    {
      className,
      title,
      description,
      onBack,
      backLabel = 'Back',
      actions,
      breadcrumb,
      badge,
      sticky = false,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'border-b bg-background',
          sticky && 'sticky top-0 z-40',
          className
        )}
        {...props}
      >
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          {breadcrumb && <div className="mb-2">{breadcrumb}</div>}

          {/* Back button */}
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mb-2 -ml-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {backLabel}
            </Button>
          )}

          {/* Title row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight truncate">
                  {title}
                </h1>
                {badge}
              </div>
              {description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>

            {/* Actions */}
            {actions && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);
PageHeader.displayName = 'PageHeader';

export { PageHeader };
