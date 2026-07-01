import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

const inputVariants = cva(
  [
    'flex w-full rounded-lg',
    'border border-border-strong',
    'bg-background',
    'text-foreground',
    'placeholder:text-foreground-muted',
    'transition-colors duration-normal ease-default',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary-400',
    'disabled:cursor-not-allowed disabled:opacity-disabled disabled:bg-neutral-50',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
  ].join(' '),
  {
    variants: {
      inputSize: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-9 px-3 text-sm',
        lg: 'h-10 px-4 text-base',
      },
      hasError: {
        true: 'border-danger-500 focus-visible:ring-danger-500',
      },
    },
    defaultVariants: {
      inputSize: 'md',
      hasError: false,
    },
  },
);

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> &
  VariantProps<typeof inputVariants> & {
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    error?: string;
    label?: string;
    hint?: string;
  };

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      inputSize,
      hasError,
      leftIcon,
      rightIcon,
      error,
      label,
      hint,
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || props.name;
    const showError = error || hasError;

    return (
      <div className="flex flex-col gap-1-5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted [&>svg]:size-4">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={showError ? 'true' : undefined}
            aria-describedby={
              showError
                ? `${inputId}-error`
                : hint
                  ? `${inputId}-hint`
                  : undefined
            }
            className={cn(
              inputVariants({ inputSize, hasError: !!showError }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className,
            )}
            {...props}
          />

          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted [&>svg]:size-4 [&_svg]:size-4 [&>button]:p-0 [&>button]:leading-none">
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-xs text-danger-600"
          >
            {error}
          </p>
        )}

        {hint && !error && (
          <p
            id={`${inputId}-hint`}
            className="text-xs text-foreground-muted"
          >
            {hint}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { inputVariants };
