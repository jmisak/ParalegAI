import * as React from 'react';
import { Calendar, Users, FileText, Clock, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { Card, CardHeader, CardContent, CardFooter } from '../base/Card.js';
import { Badge } from '../base/Badge.js';
import { Avatar } from '../base/Avatar.js';

export type MatterStatus =
  | 'pending'
  | 'in-progress'
  | 'review'
  | 'approved'
  | 'completed'
  | 'on-hold';

export type MatterType =
  | 'purchase'
  | 'sale'
  | 'refinance'
  | 'commercial'
  | 'residential';

export interface MatterParty {
  id: string;
  name: string;
  role: 'buyer' | 'seller' | 'lender' | 'title' | 'attorney' | 'other';
  avatar?: string;
}

export interface MatterCardProps {
  /** Unique matter identifier */
  id: string;
  /** Matter reference number */
  referenceNumber: string;
  /** Property address or matter title */
  title: string;
  /** Matter type */
  type: MatterType;
  /** Current status */
  status: MatterStatus;
  /** Closing/deadline date */
  closingDate?: Date;
  /** Parties involved */
  parties?: MatterParty[];
  /** Number of documents */
  documentCount?: number;
  /** Number of tasks */
  taskCount?: number;
  /** Completed tasks */
  completedTasks?: number;
  /** Click handler */
  onClick?: () => void;
  /** Additional className */
  className?: string;
}

const statusConfig: Record<
  MatterStatus,
  { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'info' }
> = {
  pending: { label: 'Pending', variant: 'secondary' },
  'in-progress': { label: 'In Progress', variant: 'info' },
  review: { label: 'Under Review', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  completed: { label: 'Completed', variant: 'success' },
  'on-hold': { label: 'On Hold', variant: 'secondary' },
};

const typeConfig: Record<MatterType, { label: string; color: string }> = {
  purchase: { label: 'Purchase', color: 'text-green-600 bg-green-50 dark:bg-green-950' },
  sale: { label: 'Sale', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950' },
  refinance: { label: 'Refinance', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
  commercial: { label: 'Commercial', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950' },
  residential: { label: 'Residential', color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950' },
};

/**
 * MatterCard displays a summary of a legal matter/case.
 *
 * @example
 * ```tsx
 * <MatterCard
 *   id="1"
 *   referenceNumber="MTR-2024-001"
 *   title="123 Main Street, Springfield"
 *   type="purchase"
 *   status="in-progress"
 *   closingDate={new Date('2024-03-15')}
 *   parties={[{ id: '1', name: 'John Doe', role: 'buyer' }]}
 *   documentCount={12}
 *   taskCount={8}
 *   completedTasks={5}
 * />
 * ```
 */
const MatterCard = React.forwardRef<HTMLDivElement, MatterCardProps>(
  (
    {
      _id,
      referenceNumber,
      title,
      type,
      status,
      closingDate,
      parties = [],
      documentCount = 0,
      taskCount = 0,
      completedTasks = 0,
      onClick,
      className,
    },
    ref
  ) => {
    const statusInfo = statusConfig[status];
    const typeInfo = typeConfig[type];
    const progress = taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0;

    const formatDate = (date: Date): string => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    };

    const getDaysUntil = (date: Date): number => {
      const now = new Date();
      const diff = date.getTime() - now.getTime();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const daysUntilClosing = closingDate ? getDaysUntil(closingDate) : null;

    return (
      <Card
        ref={ref}
        className={cn(
          'transition-all duration-200',
          onClick && 'cursor-pointer hover:shadow-md hover:border-primary/50',
          className
        )}
        onClick={onClick}
        hoverable={Boolean(onClick)}
        clickable={Boolean(onClick)}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={`Matter ${referenceNumber}: ${title}`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                {referenceNumber}
              </p>
              <h3 className="text-base font-semibold truncate mt-1">{title}</h3>
            </div>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={cn(
                'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                typeInfo.color
              )}
            >
              {typeInfo.label}
            </span>
          </div>
        </CardHeader>

        <CardContent className="pb-2">
          <div className="space-y-3">
            {/* Closing Date */}
            {closingDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Closing:</span>
                <span className="font-medium">{formatDate(closingDate)}</span>
                {daysUntilClosing !== null && daysUntilClosing >= 0 && (
                  <span
                    className={cn(
                      'text-xs px-1.5 py-0.5 rounded',
                      daysUntilClosing <= 3
                        ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                        : daysUntilClosing <= 7
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400'
                        : 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                    )}
                  >
                    {daysUntilClosing === 0
                      ? 'Today'
                      : daysUntilClosing === 1
                      ? 'Tomorrow'
                      : `${daysUntilClosing} days`}
                  </span>
                )}
              </div>
            )}

            {/* Parties */}
            {parties.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div className="flex -space-x-2">
                  {parties.slice(0, 4).map((party) => (
                    <Avatar
                      key={party.id}
                      src={party.avatar}
                      fallback={party.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                      size="xs"
                      className="border-2 border-background"
                    />
                  ))}
                  {parties.length > 4 && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                      +{parties.length - 4}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {taskCount > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {completedTasks}/{taskCount} tasks
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-2 border-t">
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {documentCount} docs
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {taskCount} tasks
              </span>
            </div>
            {onClick && (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        </CardFooter>
      </Card>
    );
  }
);
MatterCard.displayName = 'MatterCard';

export { MatterCard };
