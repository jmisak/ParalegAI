import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  Clock,
  AlertTriangle,
  AlertCircle,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { cn } from '../../utils/cn.js';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical' | 'passed';

const deadlineAlertVariants = cva(
  'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
  {
    variants: {
      urgency: {
        low: 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200',
        medium: 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
        high: 'border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200',
        critical: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
        passed: 'border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400',
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      urgency: 'medium',
      size: 'md',
    },
  }
);

const urgencyConfig: Record<
  UrgencyLevel,
  { icon: React.ElementType; label: string }
> = {
  low: { icon: Calendar, label: 'On Track' },
  medium: { icon: Clock, label: 'Approaching' },
  high: { icon: AlertTriangle, label: 'Due Soon' },
  critical: { icon: AlertCircle, label: 'Urgent' },
  passed: { icon: CheckCircle, label: 'Passed' },
};

export interface DeadlineAlertProps
  extends VariantProps<typeof deadlineAlertVariants> {
  /** The deadline date */
  deadline: Date;
  /** Label describing the deadline */
  label: string;
  /** Override automatic urgency calculation */
  urgency?: UrgencyLevel;
  /** Show time remaining */
  showTimeRemaining?: boolean;
  /** Whether the deadline has been completed */
  completed?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional className */
  className?: string;
}

/**
 * Calculates urgency level based on days until deadline.
 */
function calculateUrgency(deadline: Date, completed: boolean): UrgencyLevel {
  if (completed) return 'passed';

  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  const daysUntil = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) return 'critical';
  if (daysUntil <= 1) return 'critical';
  if (daysUntil <= 3) return 'high';
  if (daysUntil <= 7) return 'medium';
  return 'low';
}

/**
 * Formats time remaining in a human-readable way.
 */
function formatTimeRemaining(deadline: Date): string {
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();

  if (diff < 0) {
    const daysPast = Math.abs(Math.ceil(diff / (1000 * 60 * 60 * 24)));
    if (daysPast === 0) return 'Past due today';
    if (daysPast === 1) return '1 day overdue';
    return `${daysPast} days overdue`;
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days === 0) {
    if (hours === 0) return 'Less than an hour';
    if (hours === 1) return '1 hour remaining';
    return `${hours} hours remaining`;
  }
  if (days === 1) return '1 day remaining';
  if (days < 7) return `${days} days remaining`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? '1 week remaining' : `${weeks} weeks remaining`;
  }
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month remaining' : `${months} months remaining`;
}

/**
 * DeadlineAlert displays an urgency-colored deadline with time remaining.
 *
 * @example
 * ```tsx
 * <DeadlineAlert
 *   deadline={new Date('2024-03-15')}
 *   label="Closing Date"
 *   showTimeRemaining
 * />
 * <DeadlineAlert
 *   deadline={new Date('2024-03-10')}
 *   label="Document Due"
 *   urgency="critical"
 * />
 * ```
 */
const DeadlineAlert = React.forwardRef<HTMLDivElement, DeadlineAlertProps>(
  (
    {
      deadline,
      label,
      urgency: overrideUrgency,
      size,
      showTimeRemaining = true,
      completed = false,
      onClick,
      className,
    },
    ref
  ) => {
    const urgency = overrideUrgency || calculateUrgency(deadline, completed);
    const config = urgencyConfig[urgency];
    const Icon = config.icon;

    const formatDate = (date: Date): string => {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    };

    return (
      <div
        ref={ref}
        className={cn(
          deadlineAlertVariants({ urgency, size }),
          onClick && 'cursor-pointer hover:opacity-90',
          completed && 'line-through opacity-60',
          className
        )}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
      >
        <Icon className={cn('h-4 w-4 shrink-0', size === 'lg' && 'h-5 w-5')} />
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="font-medium truncate">{label}</span>
          <div className="flex items-center gap-2 text-xs opacity-80">
            <span>{formatDate(deadline)}</span>
            {showTimeRemaining && !completed && (
              <>
                <span aria-hidden="true">-</span>
                <span className="font-medium">
                  {formatTimeRemaining(deadline)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
);
DeadlineAlert.displayName = 'DeadlineAlert';

export { DeadlineAlert, deadlineAlertVariants, calculateUrgency, formatTimeRemaining };
