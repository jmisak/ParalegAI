import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn.js';

const stackVariants = cva('flex', {
  variants: {
    direction: {
      vertical: 'flex-col',
      horizontal: 'flex-row',
    },
    gap: {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
      '2xl': 'gap-12',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    wrap: {
      true: 'flex-wrap',
      false: 'flex-nowrap',
    },
  },
  defaultVariants: {
    direction: 'vertical',
    gap: 'md',
    align: 'stretch',
    justify: 'start',
    wrap: false,
  },
});

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {
  /** HTML element to render as */
  as?: 'div' | 'section' | 'article' | 'ul' | 'ol' | 'nav';
  /** Divider between items */
  divider?: React.ReactNode;
}

/**
 * Stack component for vertical or horizontal layouts with consistent spacing.
 *
 * @example
 * ```tsx
 * <Stack gap="lg">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Stack>
 * <Stack direction="horizontal" gap="md" align="center">
 *   <Button>Action 1</Button>
 *   <Button>Action 2</Button>
 * </Stack>
 * ```
 */
const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      className,
      direction,
      gap,
      align,
      justify,
      wrap,
      as: Component = 'div',
      divider,
      children,
      ...props
    },
    ref
  ) => {
    const childArray = React.Children.toArray(children).filter(Boolean);

    return (
      <Component
        ref={ref as any}
        className={cn(stackVariants({ direction, gap, align, justify, wrap }), className)}
        {...props}
      >
        {divider
          ? childArray.map((child, index) => (
              <React.Fragment key={index}>
                {child}
                {index < childArray.length - 1 && divider}
              </React.Fragment>
            ))
          : children}
      </Component>
    );
  }
);
Stack.displayName = 'Stack';

/**
 * Shorthand for horizontal Stack.
 */
const HStack = React.forwardRef<
  HTMLDivElement,
  Omit<StackProps, 'direction'>
>((props, ref) => <Stack ref={ref} direction="horizontal" {...props} />);
HStack.displayName = 'HStack';

/**
 * Shorthand for vertical Stack.
 */
const VStack = React.forwardRef<
  HTMLDivElement,
  Omit<StackProps, 'direction'>
>((props, ref) => <Stack ref={ref} direction="vertical" {...props} />);
VStack.displayName = 'VStack';

export { Stack, HStack, VStack, stackVariants };
