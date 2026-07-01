import { cn } from '@/lib/utils';
import { forwardRef, type TextareaHTMLAttributes } from 'react';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
  label?: string;
  hint?: string;
  hasError?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, label, hint, hasError, className, id, ...props }, ref) => {
    const textareaId = id || props.name;
    const showError = error || hasError;

    return (
      <div className="flex flex-col gap-1-5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={showError ? 'true' : undefined}
          aria-describedby={
            showError
              ? `${textareaId}-error`
              : hint
                ? `${textareaId}-hint`
                : undefined
          }
          className={cn(
            [
              'flex min-h-[80px] w-full rounded-lg',
              'border border-border-strong',
              'bg-background',
              'px-3 py-2',
              'text-sm text-foreground',
              'placeholder:text-foreground-muted',
              'transition-colors duration-normal',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary-400',
              'disabled:cursor-not-allowed disabled:opacity-disabled disabled:bg-neutral-50',
              'resize-y',
            ].join(' '),
            showError && 'border-danger-500 focus-visible:ring-danger-500',
            className,
          )}
          {...props}
        />

        {error && (
          <p
            id={`${textareaId}-error`}
            role="alert"
            className="text-xs text-danger-600"
          >
            {error}
          </p>
        )}

        {hint && !error && (
          <p
            id={`${textareaId}-hint`}
            className="text-xs text-foreground-muted"
          >
            {hint}
          </p>
        )}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
