import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { DayPicker } from 'react-day-picker';
import { cn } from '../../utils/cn.js';
import { Button } from '../base/Button.js';

export interface DatePickerProps {
  /** Selected date (controlled) */
  value?: Date | null;
  /** Default selected date (uncontrolled) */
  defaultValue?: Date | null;
  /** Change handler */
  onChange?: (date: Date | null) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Date format string */
  dateFormat?: string;
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Whether to allow clearing the date */
  clearable?: boolean;
  /** Additional className */
  className?: string;
  /** Wrapper className */
  wrapperClassName?: string;
}

/**
 * DatePicker component with calendar popover.
 *
 * @example
 * ```tsx
 * <DatePicker
 *   label="Due Date"
 *   value={date}
 *   onChange={setDate}
 *   minDate={new Date()}
 * />
 * ```
 */
const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value: controlledValue,
      defaultValue = null,
      onChange,
      placeholder = 'Select date',
      dateFormat = 'MMM d, yyyy',
      label,
      error,
      helperText,
      disabled = false,
      required = false,
      minDate,
      maxDate,
      clearable = true,
      className,
      wrapperClassName,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<Date | null>(
      defaultValue
    );
    const [isOpen, setIsOpen] = React.useState(false);

    const value = controlledValue !== undefined ? controlledValue : internalValue;

    const handleSelect = (date: Date | undefined) => {
      const newValue = date || null;
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
      setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (controlledValue === undefined) {
        setInternalValue(null);
      }
      onChange?.(null);
    };

    const id = React.useId();
    const errorId = error ? `${id}-error` : undefined;
    const helperId = helperText ? `${id}-helper` : undefined;

    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'text-sm font-medium leading-none',
              disabled && 'cursor-not-allowed opacity-70',
              error && 'text-destructive'
            )}
          >
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}

        <PopoverPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
          <PopoverPrimitive.Trigger asChild>
            <button
              ref={ref}
              id={id}
              type="button"
              disabled={disabled}
              aria-invalid={Boolean(error)}
              aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
              className={cn(
                'flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                error
                  ? 'border-destructive focus:ring-destructive'
                  : 'border-input',
                !value && 'text-muted-foreground',
                className
              )}
            >
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>{value ? format(value, dateFormat) : placeholder}</span>
              </div>
              {clearable && value && !disabled && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleClear}
                  aria-label="Clear date"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </button>
          </PopoverPrimitive.Trigger>

          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              className="z-50 rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
              align="start"
              sideOffset={4}
            >
              <DayPicker
                mode="single"
                selected={value || undefined}
                onSelect={handleSelect}
                disabled={(date) => {
                  if (minDate && date < minDate) return true;
                  if (maxDate && date > maxDate) return true;
                  return false;
                }}
                initialFocus
                classNames={{
                  months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                  month: 'space-y-4',
                  caption: 'flex justify-center pt-1 relative items-center',
                  caption_label: 'text-sm font-medium',
                  nav: 'space-x-1 flex items-center',
                  nav_button: cn(
                    'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-input'
                  ),
                  nav_button_previous: 'absolute left-1',
                  nav_button_next: 'absolute right-1',
                  table: 'w-full border-collapse space-y-1',
                  head_row: 'flex',
                  head_cell:
                    'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
                  row: 'flex w-full mt-2',
                  cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                  day: cn(
                    'h-9 w-9 p-0 font-normal aria-selected:opacity-100 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring'
                  ),
                  day_range_end: 'day-range-end',
                  day_selected:
                    'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                  day_today: 'bg-accent text-accent-foreground',
                  day_outside:
                    'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
                  day_disabled: 'text-muted-foreground opacity-50',
                  day_range_middle:
                    'aria-selected:bg-accent aria-selected:text-accent-foreground',
                  day_hidden: 'invisible',
                }}
              />
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>

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
    );
  }
);
DatePicker.displayName = 'DatePicker';

export { DatePicker };
