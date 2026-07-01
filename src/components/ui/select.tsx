import { cn } from '@/lib/utils';
import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  label?: string;
  hint?: string;
  hasError?: boolean;
  selectSize?: 'sm' | 'md' | 'lg';
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      placeholder,
      error,
      label,
      hint,
      hasError,
      selectSize = 'md',
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const selectId = id || props.name;
    const showError = error || hasError;

    const sizeClasses = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-9 px-3 text-sm',
      lg: 'h-10 px-4 text-base',
    };

    return (
      <div className="flex flex-col gap-1-5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={showError ? 'true' : undefined}
            aria-describedby={
              showError
                ? `${selectId}-error`
                : hint
                  ? `${selectId}-hint`
                  : undefined
            }
            className={cn(
              [
                'flex w-full appearance-none rounded-lg',
                'border border-border-strong',
                'bg-background',
                'text-foreground',
                'pr-10',
                'transition-colors duration-normal',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary-400',
                'disabled:cursor-not-allowed disabled:opacity-disabled disabled:bg-neutral-50',
              ].join(' '),
              sizeClasses[selectSize],
              showError && 'border-danger-500 focus-visible:ring-danger-500',
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-foreground-muted"
            aria-hidden="true"
          />
        </div>

        {error && (
          <p
            id={`${selectId}-error`}
            role="alert"
            className="text-xs text-danger-600"
          >
            {error}
          </p>
        )}

        {hint && !error && (
          <p
            id={`${selectId}-hint`}
            className="text-xs text-foreground-muted"
          >
            {hint}
          </p>
        )}
      </div>
    );
  },
);
Select.displayName = 'Select';
