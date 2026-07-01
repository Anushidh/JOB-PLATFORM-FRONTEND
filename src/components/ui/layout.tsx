import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';
import { forwardRef as fwdRef } from 'react';

/* ─── Container ─── */
const containerVariants = cva('mx-auto w-full px-4 sm:px-6 lg:px-8', {
  variants: {
    size: {
      xs: 'max-w-xs',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      full: 'max-w-full',
    },
  },
  defaultVariants: {
    size: 'xl',
  },
});

export type ContainerProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof containerVariants>;

export const Container = fwdRef<HTMLDivElement, ContainerProps>(
  ({ size, className, children, ...props }, ref) => (
    <div ref={ref} className={cn(containerVariants({ size }), className)} {...props}>
      {children}
    </div>
  ),
);
Container.displayName = 'Container';

/* ─── Stack ─── */
const stackVariants = cva('flex', {
  variants: {
    direction: {
      row: 'flex-row',
      col: 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'col-reverse': 'flex-col-reverse',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    gap: {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      5: 'gap-5',
      6: 'gap-6',
      8: 'gap-8',
      10: 'gap-10',
      12: 'gap-12',
    },
    wrap: {
      true: 'flex-wrap',
      false: 'flex-nowrap',
    },
  },
  defaultVariants: {
    direction: 'col',
    gap: 4,
    wrap: false,
  },
});

export type StackProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof stackVariants>;

export const Stack = fwdRef<HTMLDivElement, StackProps>(
  ({ direction, align, justify, gap, wrap, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(stackVariants({ direction, align, justify, gap, wrap }), className)}
      {...props}
    >
      {children}
    </div>
  ),
);
Stack.displayName = 'Stack';

/* ─── Grid ─── */
const gridVariants = cva('grid', {
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      12: 'grid-cols-12',
    },
    gap: {
      0: 'gap-0',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      5: 'gap-5',
      6: 'gap-6',
      8: 'gap-8',
    },
  },
  defaultVariants: {
    cols: 1,
    gap: 6,
  },
});

export type GridProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof gridVariants>;

export const Grid = fwdRef<HTMLDivElement, GridProps>(
  ({ cols, gap, className, children, ...props }, ref) => (
    <div ref={ref} className={cn(gridVariants({ cols, gap }), className)} {...props}>
      {children}
    </div>
  ),
);
Grid.displayName = 'Grid';

/* ─── Section ─── */
const sectionVariants = cva('', {
  variants: {
    spacing: {
      sm: 'py-8',
      md: 'py-12',
      lg: 'py-16',
      xl: 'py-20',
    },
  },
  defaultVariants: {
    spacing: 'md',
  },
});

export type SectionProps = HTMLAttributes<HTMLElement> &
  VariantProps<typeof sectionVariants>;

export const Section = fwdRef<HTMLElement, SectionProps>(
  ({ spacing, className, children, ...props }, ref) => (
    <section ref={ref} className={cn(sectionVariants({ spacing }), className)} {...props}>
      {children}
    </section>
  ),
);
Section.displayName = 'Section';

/* ─── Surface ─── */
const surfaceVariants = cva('rounded-xl', {
  variants: {
    variant: {
      flat: 'bg-surface',
      elevated: 'bg-surface-elevated shadow-sm border border-border',
      outlined: 'bg-background border border-border',
    },
    padding: {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    },
  },
  defaultVariants: {
    variant: 'elevated',
    padding: 'md',
  },
});

export type SurfaceProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof surfaceVariants>;

export const Surface = fwdRef<HTMLDivElement, SurfaceProps>(
  ({ variant, padding, className, children, ...props }, ref) => (
    <div ref={ref} className={cn(surfaceVariants({ variant, padding }), className)} {...props}>
      {children}
    </div>
  ),
);
Surface.displayName = 'Surface';

/* ─── Page ─── */
export type PageProps = HTMLAttributes<HTMLDivElement>;

export const Page = fwdRef<HTMLDivElement, PageProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('min-h-screen bg-background', className)}
      {...props}
    >
      {children}
    </div>
  ),
);
Page.displayName = 'Page';

/* ─── Divider ─── */
const dividerVariants = cva('bg-border', {
  variants: {
    orientation: {
      horizontal: 'h-px w-full',
      vertical: 'h-full w-px',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

export type DividerProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof dividerVariants>;

export const Divider = fwdRef<HTMLDivElement, DividerProps>(
  ({ orientation, className, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      aria-orientation={orientation || 'horizontal'}
      className={cn(dividerVariants({ orientation }), className)}
      {...props}
    />
  ),
);
Divider.displayName = 'Divider';
