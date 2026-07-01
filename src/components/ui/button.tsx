import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-medium whitespace-nowrap',
    'rounded-lg',
    'transition-all duration-normal ease-default',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    'disabled:pointer-events-none disabled:opacity-disabled',
    'select-none cursor-pointer',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'bg-primary-600 text-white',
          'hover:bg-primary-700',
          'active:bg-primary-800',
          'shadow-xs',
        ].join(' '),
        secondary: [
          'bg-neutral-100 text-foreground',
          'hover:bg-neutral-150',
          'active:bg-neutral-200',
        ].join(' '),
        outline: [
          'border border-border-strong text-foreground',
          'bg-background',
          'hover:bg-neutral-50',
          'active:bg-neutral-100',
        ].join(' '),
        ghost: [
          'text-foreground-secondary',
          'hover:bg-neutral-100 hover:text-foreground',
          'active:bg-neutral-150',
        ].join(' '),
        danger: [
          'bg-danger-600 text-white',
          'hover:bg-danger-700',
          'active:bg-danger-700',
          'shadow-xs',
        ].join(' '),
        'danger-outline': [
          'border border-danger-500 text-danger-600',
          'bg-background',
          'hover:bg-danger-50',
          'active:bg-danger-100',
        ].join(' '),
        link: [
          'text-primary-600 underline-offset-4',
          'hover:underline',
          'p-0 h-auto',
        ].join(' '),
      },
      size: {
        xs: 'h-7 px-2 text-xs rounded-md',
        sm: 'h-8 px-3 text-sm',
        md: 'h-9 px-4 text-sm',
        lg: 'h-10 px-5 text-base',
        xl: 'h-12 px-6 text-md',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-xs': 'size-7',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant,
      size,
      fullWidth,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        {...props}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : leftIcon ? (
          <span className="shrink-0 [&>svg]:size-4" aria-hidden="true">
            {leftIcon}
          </span>
        ) : null}

        {children && <span>{children}</span>}

        {rightIcon && !loading && (
          <span className="shrink-0 [&>svg]:size-4" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
