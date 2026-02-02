import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn.js';

const textareaVariants = cva(
  'flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-input',
        error: 'border-destructive focus-visible:ring-destructive',
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
      },
    },
    defaultVariants: {
      variant: 'default',
      resize: 'vertical',
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  /** Label text displayed above the textarea */
  label?: string;
  /** Helper or description text displayed below the textarea */
  helperText?: string;
  /** Error message displayed below the textarea */
  error?: string;
  /** Maximum character count. Shows a counter when provided */
  maxCharacters?: number;
  /** Show character count even without maxCharacters */
  showCount?: boolean;
  /** Wrapper className for the entire textarea group */
  wrapperClassName?: string;
}

/**
 * Textarea component with character count, label, and error state support.
 *
 * @example
 * ```tsx
 * <Textarea label="Description" placeholder="Enter description" />
 * <Textarea maxCharacters={500} showCount />
 * <Textarea error="This field is required" />
 * ```
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      resize,
      label,
      helperText,
      error,
      maxCharacters,
      showCount = false,
      wrapperClassName,
      id,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const textareaId = id || React.useId();
    const errorId = error ? `${textareaId}-error` : undefined;
    const helperId = helperText ? `${textareaId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

    const [charCount, setCharCount] = React.useState(
      String(value || defaultValue || '').length
    );

    const textareaVariant = error ? 'error' : variant;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    const shouldShowCount = showCount || maxCharacters !== undefined;
    const isOverLimit = maxCharacters !== undefined && charCount > maxCharacters;

    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <LabelPrimitive.Root
            htmlFor={textareaId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </LabelPrimitive.Root>
        )}
        <textarea
          className={cn(
            textareaVariants({ variant: textareaVariant, resize }),
            className
          )}
          ref={ref}
          id={textareaId}
          aria-invalid={Boolean(error) || isOverLimit}
          aria-describedby={describedBy}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          maxLength={maxCharacters}
          {...props}
        />
        <div className="flex items-center justify-between">
          <div>
            {error && (
              <p id={errorId} className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            {helperText && !error && (
              <p id={helperId} className="text-sm text-muted-foreground">
                {helperText}
              </p>
            )}
          </div>
          {shouldShowCount && (
            <p
              className={cn(
                'text-sm',
                isOverLimit ? 'text-destructive' : 'text-muted-foreground'
              )}
              aria-live="polite"
            >
              {charCount}
              {maxCharacters !== undefined && `/${maxCharacters}`}
            </p>
          )}
        </div>
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
