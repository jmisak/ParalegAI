import * as React from 'react';
import { cn } from '../../utils/cn.js';

export interface FormFieldWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Field label */
  label?: string;
  /** Field name for accessibility */
  name?: string;
  /** Helper text shown below the field */
  helperText?: string;
  /** Error message shown below the field */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Horizontal layout (label and input side by side) */
  horizontal?: boolean;
  /** Label width for horizontal layout */
  labelWidth?: string;
}

/**
 * FormFieldWrapper provides consistent layout for form fields.
 * For use without react-hook-form.
 *
 * @example
 * ```tsx
 * <FormFieldWrapper label="Email" error="Invalid email" required>
 *   <Input type="email" />
 * </FormFieldWrapper>
 * ```
 */
const FormFieldWrapper = React.forwardRef<HTMLDivElement, FormFieldWrapperProps>(
  (
    {
      className,
      label,
      name,
      helperText,
      error,
      required,
      disabled,
      horizontal = false,
      labelWidth = '8rem',
      children,
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    const fieldId = name || id;
    const errorId = error ? `${fieldId}-error` : undefined;
    const helperId = helperText ? `${fieldId}-helper` : undefined;

    const labelElement = label && (
      <label
        htmlFor={fieldId}
        className={cn(
          'text-sm font-medium leading-none',
          disabled && 'cursor-not-allowed opacity-70',
          error && 'text-destructive'
        )}
        style={horizontal ? { width: labelWidth, flexShrink: 0 } : undefined}
      >
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
    );

    const messagesElement = (
      <>
        {error && (
          <p
            id={errorId}
            className="text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </>
    );

    // Clone children to inject aria attributes
    const enhancedChildren = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<{
          id?: string;
          'aria-invalid'?: boolean;
          'aria-describedby'?: string;
          disabled?: boolean;
        }>, {
          id: fieldId,
          'aria-invalid': Boolean(error),
          'aria-describedby': [errorId, helperId].filter(Boolean).join(' ') || undefined,
          disabled: disabled || (child.props as { disabled?: boolean }).disabled,
        });
      }
      return child;
    });

    if (horizontal) {
      return (
        <div
          ref={ref}
          className={cn('flex items-start gap-4', className)}
          {...props}
        >
          {labelElement}
          <div className="flex-1 space-y-1.5">
            {enhancedChildren}
            {messagesElement}
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn('space-y-1.5', className)} {...props}>
        {labelElement}
        {enhancedChildren}
        {messagesElement}
      </div>
    );
  }
);
FormFieldWrapper.displayName = 'FormFieldWrapper';

export { FormFieldWrapper };
