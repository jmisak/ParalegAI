import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as LabelPrimitive from '@radix-ui/react-label';
import { Check, Minus } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  /** Label text displayed next to the checkbox */
  label?: string;
  /** Description text displayed below the label */
  description?: string;
  /** Error message displayed below the checkbox */
  error?: string;
  /** Show indeterminate state (partial selection) */
  indeterminate?: boolean;
}

/**
 * Checkbox component with label, description, and error state support.
 *
 * @example
 * ```tsx
 * <Checkbox label="Accept terms and conditions" />
 * <Checkbox label="Newsletter" description="Receive weekly updates" />
 * <Checkbox error="You must accept the terms" />
 * ```
 */
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(
  (
    { className, label, description, error, indeterminate, id, ...props },
    ref
  ) => {
    const checkboxId = id || React.useId();
    const errorId = error ? `${checkboxId}-error` : undefined;
    const descriptionId = description ? `${checkboxId}-description` : undefined;
    const describedBy = [errorId, descriptionId].filter(Boolean).join(' ') || undefined;

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-start gap-2">
          <CheckboxPrimitive.Root
            ref={ref}
            id={checkboxId}
            className={cn(
              'peer h-4 w-4 shrink-0 rounded-sm border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground',
              error
                ? 'border-destructive'
                : 'border-primary',
              className
            )}
            checked={indeterminate ? 'indeterminate' : props.checked}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            {...props}
          >
            <CheckboxPrimitive.Indicator
              className={cn('flex items-center justify-center text-current')}
            >
              {indeterminate ? (
                <Minus className="h-3.5 w-3.5" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
            </CheckboxPrimitive.Indicator>
          </CheckboxPrimitive.Root>
          {(label || description) && (
            <div className="flex flex-col gap-0.5">
              {label && (
                <LabelPrimitive.Root
                  htmlFor={checkboxId}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {label}
                </LabelPrimitive.Root>
              )}
              {description && (
                <p
                  id={descriptionId}
                  className="text-sm text-muted-foreground"
                >
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
