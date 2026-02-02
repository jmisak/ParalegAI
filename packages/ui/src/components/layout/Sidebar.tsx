import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronLeft, Menu, X } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { Button } from '../base/Button.js';

const sidebarVariants = cva(
  'flex flex-col border-r bg-background transition-all duration-300',
  {
    variants: {
      position: {
        left: 'fixed left-0 top-0 h-screen z-40',
        right: 'fixed right-0 top-0 h-screen z-40',
      },
      size: {
        sm: 'w-56',
        md: 'w-64',
        lg: 'w-72',
        xl: 'w-80',
      },
    },
    defaultVariants: {
      position: 'left',
      size: 'md',
    },
  }
);

export interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  /** Whether the sidebar is open (controlled) */
  open?: boolean;
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether the sidebar can be collapsed */
  collapsible?: boolean;
  /** Collapsed width (when collapsible) */
  collapsedWidth?: string;
  /** Logo or branding element */
  header?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
}

/**
 * Sidebar component for app navigation.
 *
 * @example
 * ```tsx
 * <Sidebar
 *   header={<Logo />}
 *   footer={<UserMenu />}
 * >
 *   <SidebarNav>
 *     <SidebarNavItem href="/" icon={<Home />}>Dashboard</SidebarNavItem>
 *   </SidebarNav>
 * </Sidebar>
 * ```
 */
const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      className,
      position,
      size,
      open: controlledOpen,
      defaultOpen = true,
      onOpenChange,
      collapsible = false,
      collapsedWidth = '4rem',
      header,
      footer,
      children,
      ...props
    },
    ref
  ) => {
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

    const handleToggle = () => {
      const newValue = !isOpen;
      if (controlledOpen === undefined) {
        setInternalOpen(newValue);
      }
      onOpenChange?.(newValue);
    };

    return (
      <>
        {/* Mobile overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={handleToggle}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          ref={ref}
          className={cn(
            sidebarVariants({ position, size }),
            !isOpen && collapsible && 'lg:block',
            !isOpen && !collapsible && '-translate-x-full lg:translate-x-0',
            className
          )}
          style={
            collapsible && !isOpen
              ? { width: collapsedWidth }
              : undefined
          }
          aria-label="Sidebar navigation"
          {...props}
        >
          {/* Header */}
          {header && (
            <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
              <div className={cn(!isOpen && collapsible && 'hidden')}>
                {header}
              </div>
              {collapsible && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggle}
                  className="hidden lg:flex"
                  aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                  <ChevronLeft
                    className={cn(
                      'h-4 w-4 transition-transform',
                      !isOpen && 'rotate-180'
                    )}
                  />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggle}
                className="lg:hidden"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto py-4">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="shrink-0 border-t p-4">{footer}</div>
          )}
        </aside>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          className="fixed bottom-4 left-4 z-50 lg:hidden shadow-lg bg-background"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </>
    );
  }
);
Sidebar.displayName = 'Sidebar';

/**
 * Sidebar navigation group.
 */
interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  /** Group label */
  label?: string;
}

const SidebarNav = React.forwardRef<HTMLElement, SidebarNavProps>(
  ({ className, label, children, ...props }, ref) => {
    return (
      <nav ref={ref} className={cn('px-3', className)} {...props}>
        {label && (
          <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </h3>
        )}
        <ul className="space-y-1" role="list">
          {children}
        </ul>
      </nav>
    );
  }
);
SidebarNav.displayName = 'SidebarNav';

/**
 * Sidebar navigation item.
 */
interface SidebarNavItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  /** Navigation destination */
  href?: string;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Whether this item is currently active */
  active?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Badge or count to display */
  badge?: React.ReactNode;
}

const SidebarNavItem = React.forwardRef<HTMLLIElement, SidebarNavItemProps>(
  ({ className, href, icon, active, onClick, badge, children, ...props }, ref) => {
    const content = (
      <>
        {icon && (
          <span className="shrink-0 [&_svg]:h-5 [&_svg]:w-5">{icon}</span>
        )}
        <span className="flex-1 truncate">{children}</span>
        {badge && <span className="shrink-0">{badge}</span>}
      </>
    );

    const itemClasses = cn(
      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
      active
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      className
    );

    return (
      <li ref={ref} {...props}>
        {href ? (
          <a href={href} className={itemClasses}>
            {content}
          </a>
        ) : (
          <button
            type="button"
            onClick={onClick}
            className={cn(itemClasses, 'w-full text-left')}
          >
            {content}
          </button>
        )}
      </li>
    );
  }
);
SidebarNavItem.displayName = 'SidebarNavItem';

export { Sidebar, SidebarNav, SidebarNavItem, sidebarVariants };
