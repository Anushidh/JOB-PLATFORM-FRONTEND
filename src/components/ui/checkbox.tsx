import { cn } from '@/lib/utils';
import { forwardRef, type InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string;
  description?: string;
  error?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className, id, ...props }, ref) => {
    const checkboxId = id || props.name;

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={checkboxId}
          className={cn(
            'flex items-start gap-3 cursor-pointer select-none group',
            props.disabled && 'cursor-not-allowed opacity-disabled',
          )}
        >
          <div className="relative flex shrink-0 mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              className="peer sr-only"
              aria-invalid={error ? 'true' : undefined}
              {...props}
            />
            <div
              className={cn(
                [
                  'size-4 rounded-sm',
                  'border border-border-strong',
                  'bg-background',
                  'transition-all duration-fast',
                  'peer-checked:bg-primary-600 peer-checked:border-primary-600',
                  'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
                  'group-hover:border-neutral-400',
                ].join(' '),
                error && 'border-danger-500',
              )}
            />
            <Check
              className="absolute inset-0 m-auto size-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
              strokeWidth={3}
              aria-hidden="true"
            />
          </div>

          <div className="flex flex-col gap-0-5">
            {label && (
              <span className="text-sm font-medium text-foreground leading-tight">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-foreground-muted">
                {description}
              </span>
            )}
          </div>
        </label>

        {error && (
          <p role="alert" className="text-xs text-danger-600 ml-[28px]">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Checkbox.displayName = 'Checkbox';
