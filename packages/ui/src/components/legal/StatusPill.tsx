import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  Clock,
  Play,
  Eye,
  CheckCircle,
  XCircle,
  Pause,
  AlertCircle,
  FileText,
  Pen,
  Send,
} from 'lucide-react';
import { cn } from '../../utils/cn.js';

export type MatterStatusType =
  | 'draft'
  | 'pending'
  | 'in-progress'
  | 'review'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'on-hold'
  | 'cancelled';

export type DocumentStatusType =
  | 'pending'
  | 'uploaded'
  | 'processing'
  | 'approved'
  | 'rejected'
  | 'signed'
  | 'sent';

const statusPillVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors',
  {
    variants: {
      status: {
        // Matter statuses
        draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        review: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
        approved: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
        'on-hold': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
        cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
        // Document statuses
        uploaded: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
        signed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        sent: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const statusConfig: Record<
  MatterStatusType | DocumentStatusType,
  { icon: React.ElementType; label: string }
> = {
  draft: { icon: FileText, label: 'Draft' },
  pending: { icon: Clock, label: 'Pending' },
  'in-progress': { icon: Play, label: 'In Progress' },
  review: { icon: Eye, label: 'Under Review' },
  approved: { icon: CheckCircle, label: 'Approved' },
  rejected: { icon: XCircle, label: 'Rejected' },
  completed: { icon: CheckCircle, label: 'Completed' },
  'on-hold': { icon: Pause, label: 'On Hold' },
  cancelled: { icon: XCircle, label: 'Cancelled' },
  uploaded: { icon: FileText, label: 'Uploaded' },
  processing: { icon: AlertCircle, label: 'Processing' },
  signed: { icon: Pen, label: 'Signed' },
  sent: { icon: Send, label: 'Sent' },
};

export interface StatusPillProps
  extends Omit<VariantProps<typeof statusPillVariants>, 'status'> {
  /** Status type */
  status: MatterStatusType | DocumentStatusType;
  /** Override the default label */
  label?: string;
  /** Show status icon */
  showIcon?: boolean;
  /** Animate the icon (for processing states) */
  animated?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional className */
  className?: string;
}

/**
 * StatusPill displays a colored pill indicating matter or document status.
 *
 * @example
 * ```tsx
 * <StatusPill status="in-progress" />
 * <StatusPill status="approved" showIcon />
 * <StatusPill status="processing" animated />
 * ```
 */
const StatusPill = React.forwardRef<HTMLSpanElement, StatusPillProps>(
  (
    {
      status,
      label: overrideLabel,
      size,
      showIcon = true,
      animated = false,
      onClick,
      className,
    },
    ref
  ) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    const label = overrideLabel || config.label;

    return (
      <span
        ref={ref}
        className={cn(
          statusPillVariants({ status, size }),
          onClick && 'cursor-pointer hover:opacity-80',
          className
        )}
        onClick={onClick}
        role={onClick ? 'button' : 'status'}
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
        aria-label={`Status: ${label}`}
      >
        {showIcon && (
          <Icon
            className={cn(
              'h-3.5 w-3.5',
              size === 'lg' && 'h-4 w-4',
              animated && 'animate-spin'
            )}
          />
        )}
        <span>{label}</span>
      </span>
    );
  }
);
StatusPill.displayName = 'StatusPill';

export { StatusPill, statusPillVariants };
