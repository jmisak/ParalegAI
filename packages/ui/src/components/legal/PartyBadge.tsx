import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  User,
  Home,
  Building2,
  Landmark,
  FileText,
  Briefcase,
} from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { Avatar } from '../base/Avatar.js';
import { SimpleTooltip } from '../base/Tooltip.js';

export type PartyRole =
  | 'buyer'
  | 'seller'
  | 'lender'
  | 'title'
  | 'attorney'
  | 'agent'
  | 'other';

const partyBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
  {
    variants: {
      role: {
        buyer: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        seller: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
        lender: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
        title: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        attorney: 'bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-300',
        agent: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300',
        other: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      role: 'other',
      size: 'md',
    },
  }
);

const roleConfig: Record<
  PartyRole,
  { label: string; icon: React.ElementType }
> = {
  buyer: { label: 'Buyer', icon: Home },
  seller: { label: 'Seller', icon: User },
  lender: { label: 'Lender', icon: Landmark },
  title: { label: 'Title Company', icon: FileText },
  attorney: { label: 'Attorney', icon: Briefcase },
  agent: { label: 'Agent', icon: Building2 },
  other: { label: 'Party', icon: User },
};

export interface PartyBadgeProps
  extends VariantProps<typeof partyBadgeVariants> {
  /** Party role */
  role: PartyRole;
  /** Party name */
  name?: string;
  /** Show role icon */
  showIcon?: boolean;
  /** Show avatar */
  avatar?: string;
  /** Avatar fallback text */
  avatarFallback?: string;
  /** Additional details shown in tooltip */
  details?: string;
  /** Click handler */
  onClick?: () => void;
  /** Additional className */
  className?: string;
}

/**
 * PartyBadge displays a colored badge indicating a party's role in a transaction.
 *
 * @example
 * ```tsx
 * <PartyBadge role="buyer" name="John Doe" showIcon />
 * <PartyBadge role="seller" avatar="/avatar.jpg" />
 * <PartyBadge role="lender" name="First National Bank" />
 * ```
 */
const PartyBadge = React.forwardRef<HTMLSpanElement, PartyBadgeProps>(
  (
    {
      role,
      name,
      size,
      showIcon = true,
      avatar,
      avatarFallback,
      details,
      onClick,
      className,
    },
    ref
  ) => {
    const config = roleConfig[role];
    const Icon = config.icon;

    const badgeContent = (
      <span
        ref={ref}
        className={cn(
          partyBadgeVariants({ role, size }),
          onClick && 'cursor-pointer hover:opacity-80',
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
        {avatar && (
          <Avatar
            src={avatar}
            fallback={
              avatarFallback ||
              (name
                ? name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                : config.label[0])
            }
            size="xs"
            className="h-4 w-4"
          />
        )}
        {showIcon && !avatar && <Icon className="h-3.5 w-3.5" />}
        <span>{name || config.label}</span>
      </span>
    );

    if (details) {
      return (
        <SimpleTooltip content={details}>
          {badgeContent}
        </SimpleTooltip>
      );
    }

    return badgeContent;
  }
);
PartyBadge.displayName = 'PartyBadge';

export { PartyBadge, partyBadgeVariants };
