import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  FileText,
  MessageSquare,
  User,
  Calendar,
} from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { Avatar } from '../base/Avatar.js';

export type TimelineEventType =
  | 'created'
  | 'updated'
  | 'document'
  | 'comment'
  | 'status'
  | 'deadline'
  | 'milestone'
  | 'assignment';

const timelineItemVariants = cva('relative flex gap-4', {
  variants: {
    variant: {
      default: '',
      compact: 'gap-3',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const iconConfig: Record<
  TimelineEventType,
  { icon: React.ElementType; color: string }
> = {
  created: { icon: Circle, color: 'text-green-500 bg-green-100 dark:bg-green-900/50' },
  updated: { icon: CheckCircle, color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/50' },
  document: { icon: FileText, color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/50' },
  comment: { icon: MessageSquare, color: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/50' },
  status: { icon: AlertCircle, color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/50' },
  deadline: { icon: Calendar, color: 'text-red-500 bg-red-100 dark:bg-red-900/50' },
  milestone: { icon: CheckCircle, color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/50' },
  assignment: { icon: User, color: 'text-cyan-500 bg-cyan-100 dark:bg-cyan-900/50' },
};

export interface TimelineItemProps
  extends VariantProps<typeof timelineItemVariants> {
  /** Event type */
  type: TimelineEventType;
  /** Title/heading of the event */
  title: string;
  /** Description or details */
  description?: string;
  /** Timestamp of the event */
  timestamp: Date;
  /** User who performed the action */
  user?: {
    name: string;
    avatar?: string;
  };
  /** Custom icon to override the default */
  icon?: React.ReactNode;
  /** Whether this is the last item (hides the connecting line) */
  isLast?: boolean;
  /** Whether to show the full timestamp or relative time */
  showFullTimestamp?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional className */
  className?: string;
  /** Children for additional content */
  children?: React.ReactNode;
}

/**
 * Formats a timestamp relative to now.
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * TimelineItem displays a single event in a matter timeline.
 *
 * @example
 * ```tsx
 * <TimelineItem
 *   type="document"
 *   title="Purchase Agreement uploaded"
 *   description="Document requires review"
 *   timestamp={new Date()}
 *   user={{ name: 'John Doe', avatar: '/avatar.jpg' }}
 * />
 * ```
 */
const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  (
    {
      type,
      title,
      description,
      timestamp,
      user,
      icon: customIcon,
      variant,
      isLast = false,
      showFullTimestamp = false,
      onClick,
      className,
      children,
    },
    ref
  ) => {
    const config = iconConfig[type];
    const Icon = config.icon;

    const formatFullTimestamp = (date: Date): string => {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    };

    return (
      <div
        ref={ref}
        className={cn(
          timelineItemVariants({ variant }),
          onClick && 'cursor-pointer',
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
        {/* Icon column with connecting line */}
        <div className="flex flex-col items-center">
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
              config.color
            )}
          >
            {customIcon || <Icon className="h-4 w-4" />}
          </div>
          {!isLast && (
            <div className="w-0.5 flex-1 bg-border mt-2" aria-hidden="true" />
          )}
        </div>

        {/* Content column */}
        <div className={cn('flex-1 pb-8', isLast && 'pb-0')}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight">{title}</p>
              {description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            <time
              className="text-xs text-muted-foreground whitespace-nowrap"
              dateTime={timestamp.toISOString()}
              title={formatFullTimestamp(timestamp)}
            >
              {showFullTimestamp
                ? formatFullTimestamp(timestamp)
                : formatRelativeTime(timestamp)}
            </time>
          </div>

          {/* User info */}
          {user && (
            <div className="mt-2 flex items-center gap-2">
              <Avatar
                src={user.avatar}
                fallback={user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
                size="xs"
              />
              <span className="text-xs text-muted-foreground">{user.name}</span>
            </div>
          )}

          {/* Additional content */}
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    );
  }
);
TimelineItem.displayName = 'TimelineItem';

/**
 * Timeline container component for grouping TimelineItems.
 */
interface TimelineProps {
  children: React.ReactNode;
  className?: string;
}

const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ children, className }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-0', className)} role="list">
        {children}
      </div>
    );
  }
);
Timeline.displayName = 'Timeline';

export { TimelineItem, Timeline, formatRelativeTime };
