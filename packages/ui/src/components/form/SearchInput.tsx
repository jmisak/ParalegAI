import * as React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { Button } from '../base/Button.js';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** Current search value (controlled) */
  value?: string;
  /** Default value (uncontrolled) */
  defaultValue?: string;
  /** Change handler (called after debounce) */
  onChange?: (value: string) => void;
  /** Immediate change handler (called on every keystroke) */
  onChangeImmediate?: (value: string) => void;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Loading state */
  loading?: boolean;
  /** Show clear button */
  clearable?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Wrapper className */
  wrapperClassName?: string;
}

/**
 * SearchInput component with debounced onChange.
 *
 * @example
 * ```tsx
 * <SearchInput
 *   placeholder="Search matters..."
 *   onChange={(value) => handleSearch(value)}
 *   debounceMs={300}
 * />
 * ```
 */
const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      value: controlledValue,
      defaultValue = '',
      onChange,
      onChangeImmediate,
      debounceMs = 300,
      loading = false,
      clearable = true,
      size = 'md',
      wrapperClassName,
      placeholder = 'Search...',
      disabled,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const [debouncedValue, setDebouncedValue] = React.useState(defaultValue);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Merge refs
    React.useImperativeHandle(ref, () => inputRef.current!);

    const value = controlledValue !== undefined ? controlledValue : internalValue;

    // Debounce effect
    React.useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedValue(value);
      }, debounceMs);

      return () => clearTimeout(timer);
    }, [value, debounceMs]);

    // Call onChange when debounced value changes
    React.useEffect(() => {
      onChange?.(debouncedValue);
    }, [debouncedValue, onChange]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onChangeImmediate?.(newValue);
    };

    const handleClear = () => {
      if (controlledValue === undefined) {
        setInternalValue('');
      }
      onChangeImmediate?.('');
      onChange?.('');
      inputRef.current?.focus();
    };

    const sizeClasses = {
      sm: 'h-8 text-sm pl-8 pr-8',
      md: 'h-10 pl-10 pr-10',
      lg: 'h-12 text-base pl-12 pr-12',
    };

    const iconSizes = {
      sm: 'h-3.5 w-3.5',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    };

    const iconPositions = {
      sm: 'left-2.5',
      md: 'left-3',
      lg: 'left-4',
    };

    const clearPositions = {
      sm: 'right-1',
      md: 'right-1',
      lg: 'right-2',
    };

    return (
      <div className={cn('relative', wrapperClassName)}>
        {/* Search icon */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none',
            iconPositions[size]
          )}
        >
          {loading ? (
            <Loader2 className={cn(iconSizes[size], 'animate-spin')} />
          ) : (
            <Search className={iconSizes[size]} />
          )}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            // Hide native search cancel button
            '[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden',
            sizeClasses[size],
            className
          )}
          {...props}
        />

        {/* Clear button */}
        {clearable && value && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              'absolute top-1/2 -translate-y-1/2 h-7 w-7',
              clearPositions[size]
            )}
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className={iconSizes[size]} />
          </Button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';

export { SearchInput };
