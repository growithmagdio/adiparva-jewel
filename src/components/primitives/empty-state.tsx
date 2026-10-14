'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';
import { MicroLabel } from './micro-label';
import { Button } from './button';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      eyebrow = 'STATUS NOTE',
      title,
      description,
      actionLabel,
      onAction,
      actionHref,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'flex flex-col items-center justify-center text-center p-10 sm:p-14 bg-[var(--color-surface)] border border-[var(--color-cream-200)] rounded-[var(--radius-card)] max-w-xl mx-auto my-6',
            className
          )
        )}
        {...props}
      >
        <MicroLabel className="mb-3 text-[var(--color-gold-600)]">{eyebrow}</MicroLabel>
        <h3 className="font-serif text-2xl font-medium text-[var(--color-text-900)] mb-2 leading-tight">
          {title}
        </h3>
        <p className="font-sans text-sm text-[var(--color-text-500)] max-w-md mb-6 leading-relaxed">
          {description}
        </p>

        {actionLabel && (
          <div>
            {actionHref ? (
              <Link href={actionHref}>
                <Button variant="secondary" size="md">
                  {actionLabel}
                </Button>
              </Link>
            ) : (
              <Button variant="secondary" size="md" onClick={onAction}>
                {actionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
