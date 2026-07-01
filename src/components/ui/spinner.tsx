import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { forwardRef, type HTMLAttributes } from 'react';

const spinnerVariants = cva('animate-spin text-primary-600', {
  variants: {
    size: {
      xs: 'size-3',
      sm: 'size-4',
      md: 'size-5',
      lg: 'size-6',
      xl: 'size-8',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export type SpinnerProps = HTMLAttributes<SVGSVGElement> &
  VariantProps<typeof spinnerVariants> & {
    label?: string;
  };

export const Spinner = forwardRef<SVGSVGElement, SpinnerProps>(
  ({ size, label = 'Loading', className, ...props }, ref) => (
    <svg
      ref={ref}
      className={cn(spinnerVariants({ size }), className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      aria-label={label}
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  ),
);
Spinner.displayName = 'Spinner';
