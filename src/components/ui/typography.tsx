import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

/* ─── Text Variants ─── */
const textVariants = cva('', {
  variants: {
    variant: {
      display:
        'text-display font-bold leading-none tracking-tighter',
      h1: 'text-4xl font-bold leading-tight tracking-tight',
      h2: 'text-3xl font-semibold leading-tight tracking-tight',
      h3: 'text-2xl font-semibold leading-snug',
      h4: 'text-xl font-semibold leading-snug',
      h5: 'text-lg font-medium leading-snug',
      subtitle:
        'text-md font-medium leading-normal',
      body: 'text-base font-normal leading-normal',
      'body-sm':
        'text-sm font-normal leading-normal',
      caption:
        'text-xs font-normal leading-normal',
      label:
        'text-sm font-medium leading-none',
      overline:
        'text-xs font-semibold uppercase tracking-wider leading-none',
    },
    color: {
      default: 'text-foreground',
      secondary: 'text-foreground-secondary',
      muted: 'text-foreground-muted',
      primary: 'text-primary-600',
      success: 'text-success-600',
      warning: 'text-warning-600',
      danger: 'text-danger-600',
      inherit: 'text-inherit',
    },
  },
  defaultVariants: {
    variant: 'body',
    color: 'default',
  },
});

export type TextProps = HTMLAttributes<HTMLElement> &
  VariantProps<typeof textVariants> & {
    as?: keyof HTMLElementTagNameMap;
  };

const defaultElementMap: Record<string, keyof HTMLElementTagNameMap> = {
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  subtitle: 'p',
  body: 'p',
  'body-sm': 'p',
  caption: 'span',
  label: 'label',
  overline: 'span',
};

export function Text({
  variant,
  color,
  as,
  className,
  children,
  ...props
}: TextProps) {
  const Element = (as || defaultElementMap[variant || 'body'] || 'p') as 'p';
  return (
    <Element
      className={cn(textVariants({ variant, color }), className)}
      {...props}
    >
      {children}
    </Element>
  );
}
