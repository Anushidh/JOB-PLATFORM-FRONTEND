import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { forwardRef, type HTMLAttributes } from 'react';

const badgeVariants = cva(
  [
    'inline-flex items-center gap-1',
    'rounded-full',
    'font-medium',
    'whitespace-nowrap',
    'transition-colors duration-fast',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'bg-neutral-100 text-foreground-secondary',
        primary:
          'bg-primary-50 text-primary-700',
        success:
          'bg-success-50 text-success-700',
        warning:
          'bg-warning-50 text-warning-700',
        danger:
          'bg-danger-50 text-danger-700',
        outline:
          'border border-border-strong text-foreground-secondary',
      },
      size: {
        sm: 'px-2 py-0-5 text-xs',
        md: 'px-2 py-1 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants> & {
    dot?: boolean;
  };

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant, size, dot, className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span
          className="size-1.5 rounded-full bg-current opacity-70"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  ),
);
Badge.displayName = 'Badge';

export { badgeVariants };
