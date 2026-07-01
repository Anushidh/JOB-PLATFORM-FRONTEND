import { cn } from '@/lib/utils';
import { forwardRef, type InputHTMLAttributes } from 'react';

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string;
  description?: string;
};

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, className, id, ...props }, ref) => {
    const radioId = id || `${props.name}-${props.value}`;

    return (
      <label
        htmlFor={radioId}
        className={cn(
          'flex items-center gap-3 cursor-pointer select-none group',
          props.disabled && 'cursor-not-allowed opacity-disabled',
        )}
      >
        <div className="relative flex shrink-0">
          <input
            ref={ref}
            type="radio"
            id={radioId}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              [
                'size-4 rounded-full',
                'border border-border-strong',
                'bg-background',
                'transition-all duration-fast',
                'peer-checked:border-primary-600',
                'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
                'group-hover:border-neutral-400',
              ].join(' '),
            )}
          />
          <div
            className="absolute inset-0 m-auto size-2 rounded-full bg-primary-600 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
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
    );
  },
);
Radio.displayName = 'Radio';

/* ─── RadioGroup Wrapper ─── */
export type RadioGroupProps = {
  label?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
};

export function RadioGroup({
  label,
  error,
  children,
  className,
  orientation = 'vertical',
}: RadioGroupProps) {
  return (
    <fieldset className={cn('flex flex-col gap-2', className)}>
      {label && (
        <legend className="text-sm font-medium text-foreground mb-1">
          {label}
        </legend>
      )}
      <div
        className={cn(
          'flex gap-4',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        )}
        role="radiogroup"
      >
        {children}
      </div>
      {error && (
        <p role="alert" className="text-xs text-danger-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}
