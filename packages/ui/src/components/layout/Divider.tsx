import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn.js';

const dividerVariants = cva('shrink-0 bg-border', {
  variants: {
    orientation: {
      horizontal: 'h-px w-full',
      vertical: 'h-full w-px',
    },
    variant: {
      solid: '',
      dashed: 'border-dashed',
      dotted: 'border-dotted',
    },
    spacing: {
      none: '',
      sm: '',
      md: '',
      lg: '',
    },
  },
  compoundVariants: [
    {
      orientation: 'horizontal',
      spacing: 'sm',
      className: 'my-2',
    },
    {
      orientation: 'horizontal',
      spacing: 'md',
      className: 'my-4',
    },
    {
      orientation: 'horizontal',
      spacing: 'lg',
      className: 'my-6',
    },
    {
      orientation: 'vertical',
      spacing: 'sm',
      className: 'mx-2',
    },
    {
      orientation: 'vertical',
      spacing: 'md',
      className: 'mx-4',
    },
    {
      orientation: 'vertical',
      spacing: 'lg',
      className: 'mx-6',
    },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    variant: 'solid',
    spacing: 'md',
  },
});

export interface DividerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof dividerVariants> {
  /** Label text to display in the middle of the divider */
  label?: string;
  /** Position of the label */
  labelPosition?: 'left' | 'center' | 'right';
}

/**
 * Divider component for separating content.
 *
 * @example
 * ```tsx
 * <Divider />
 * <Divider orientation="vertical" />
 * <Divider label="OR" />
 * ```
 */
const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      className,
      orientation = 'horizontal',
      variant,
      spacing,
      label,
      labelPosition = 'center',
      ...props
    },
    ref
  ) => {
    // Simple divider without label
    if (!label) {
      return (
        <div
          ref={ref}
          role="separator"
          aria-orientation={orientation ?? undefined}
          className={cn(dividerVariants({ orientation, variant, spacing }), className)}
          {...props}
        />
      );
    }

    // Divider with label (only for horizontal)
    const labelPositionClasses = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
    };

    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation="horizontal"
        className={cn(
          'flex items-center',
          spacing === 'sm' && 'my-2',
          spacing === 'md' && 'my-4',
          spacing === 'lg' && 'my-6',
          labelPositionClasses[labelPosition],
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'h-px flex-1 bg-border',
            labelPosition === 'left' && 'max-w-[2rem]',
            labelPosition === 'right' && 'flex-1'
          )}
        />
        <span className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <div
          className={cn(
            'h-px flex-1 bg-border',
            labelPosition === 'right' && 'max-w-[2rem]',
            labelPosition === 'left' && 'flex-1'
          )}
        />
      </div>
    );
  }
);
Divider.displayName = 'Divider';

export { Divider, dividerVariants };
