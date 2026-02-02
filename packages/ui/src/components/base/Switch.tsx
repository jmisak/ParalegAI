import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '../../utils/cn.js';

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  /** Label text displayed next to the switch */
  label?: string;
  /** Description text displayed below the label */
  description?: string;
  /** Position of the label relative to the switch */
  labelPosition?: 'left' | 'right';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Switch/Toggle component with label and description support.
 *
 * @example
 * ```tsx
 * <Switch label="Enable notifications" />
 * <Switch label="Dark mode" description="Use dark theme for the app" />
 * <Switch label="Airplane mode" labelPosition="left" />
 * ```
 */
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(
  (
    {
      className,
      label,
      description,
      labelPosition = 'right',
      size = 'md',
      id,
      ...props
    },
    ref
  ) => {
    const switchId = id || React.useId();
    const descriptionId = description ? `${switchId}-description` : undefined;

    const sizeClasses = {
      sm: {
        root: 'h-4 w-7',
        thumb: 'h-3 w-3 data-[state=checked]:translate-x-3',
      },
      md: {
        root: 'h-5 w-9',
        thumb: 'h-4 w-4 data-[state=checked]:translate-x-4',
      },
      lg: {
        root: 'h-6 w-11',
        thumb: 'h-5 w-5 data-[state=checked]:translate-x-5',
      },
    };

    const switchElement = (
      <SwitchPrimitive.Root
        ref={ref}
        id={switchId}
        className={cn(
          'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
          sizeClasses[size].root,
          className
        )}
        aria-describedby={descriptionId}
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            'pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0',
            sizeClasses[size].thumb
          )}
        />
      </SwitchPrimitive.Root>
    );

    if (!label && !description) {
      return switchElement;
    }

    const labelContent = (
      <div className="flex flex-col gap-0.5">
        {label && (
          <LabelPrimitive.Root
            htmlFor={switchId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </LabelPrimitive.Root>
        )}
        {description && (
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    );

    return (
      <div className="flex items-center gap-3">
        {labelPosition === 'left' && labelContent}
        {switchElement}
        {labelPosition === 'right' && labelContent}
      </div>
    );
  }
);
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
