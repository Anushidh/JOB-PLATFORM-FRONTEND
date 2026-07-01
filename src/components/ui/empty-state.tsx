import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'py-16 px-6',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 text-foreground-muted [&>svg]:size-12 [&>svg]:stroke-[1.5]">
          {icon}
        </div>
      )}

      <h3 className="text-md font-semibold text-foreground">
        {title}
      </h3>

      {description && (
        <p className="mt-1-5 text-sm text-foreground-muted max-w-sm">
          {description}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
