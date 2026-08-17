'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rect' | 'text' | 'pill' | 'tile' | 'arch';
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'rect', ...props }, ref) => {
    const variantClasses = {
      rect: 'rounded-[var(--radius-card)]',
      text: 'h-4 w-full rounded-[2px]',
      pill: 'h-6 rounded-[var(--radius-pill)]',
      tile: 'rounded-[var(--radius-tile)]',
      arch: 'aspect-[4/5] rounded-t-full',
    };

    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'animate-pulse bg-gradient-to-r from-[var(--color-cream-200)] via-[var(--color-cream-100)] to-[var(--color-cream-200)] bg-[length:200%_100%]',
            variantClasses[variant],
            className
          )
        )}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export function ProductCardSkeleton() {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] rounded-[var(--radius-card)] p-4 space-y-3">
      <Skeleton variant="rect" className="w-full aspect-[4/5]" />
      <Skeleton variant="text" className="w-1/3 h-3" />
      <Skeleton variant="text" className="w-3/4 h-5" />
      <Skeleton variant="text" className="w-1/2 h-4" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 py-4 px-6 border-b border-[var(--color-cream-200)]">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} variant="text" className="flex-1 h-4" />
      ))}
    </div>
  );
}
