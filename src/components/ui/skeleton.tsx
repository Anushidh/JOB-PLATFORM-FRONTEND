import { cn } from '@/lib/utils';
import { forwardRef, type HTMLAttributes } from 'react';

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  /** Make it circular (e.g. avatar placeholder) */
  circle?: boolean;
  /** Width — defaults to full */
  width?: string | number;
  /** Height — defaults to 16px */
  height?: string | number;
};

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ circle, width, height, className, style, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-neutral-150',
        circle ? 'rounded-full' : 'rounded-md',
        className,
      )}
      style={{
        width: width ?? '100%',
        height: height ?? '1rem',
        ...style,
      }}
      {...props}
    />
  ),
);
Skeleton.displayName = 'Skeleton';

/* ─── Preset Skeleton Patterns ─── */

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="0.875rem"
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border p-6">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton circle width={40} height={40} />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton height="0.875rem" width="60%" />
          <Skeleton height="0.75rem" width="40%" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}
