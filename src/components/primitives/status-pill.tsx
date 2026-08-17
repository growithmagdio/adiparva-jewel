'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type StatusVariant = 'ok' | 'info' | 'warn' | 'risk' | 'neutral';

export interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StatusVariant;
  dot?: boolean;
}

export const StatusPill = React.forwardRef<HTMLSpanElement, StatusPillProps>(
  ({ className, variant = 'neutral', dot = false, children, ...props }, ref) => {
    const variantStyles = {
      ok: 'bg-[var(--color-ok-bg)] text-[var(--color-ok-fg)]',
      info: 'bg-[var(--color-info-bg)] text-[var(--color-info-fg)]',
      warn: 'bg-[var(--color-warn-bg)] text-[var(--color-warn-fg)]',
      risk: 'bg-[var(--color-risk-bg)] text-[var(--color-risk-fg)]',
      neutral: 'bg-[var(--color-cream-200)] text-[var(--color-text-700)]',
    };

    const dotColors = {
      ok: 'bg-[var(--color-ok-fg)]',
      info: 'bg-[var(--color-info-fg)]',
      warn: 'bg-[var(--color-warn-fg)]',
      risk: 'bg-[var(--color-risk-fg)]',
      neutral: 'bg-[var(--color-text-500)]',
    };

    return (
      <span
        ref={ref}
        className={twMerge(
          clsx(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-pill)] font-sans font-semibold text-[11px] uppercase tracking-[0.08em] select-none shrink-0',
            variantStyles[variant],
            className
          )
        )}
        {...props}
      >
        {dot && (
          <span
            className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])}
            aria-hidden="true"
          />
        )}
        <span>{children}</span>
      </span>
    );
  }
);

StatusPill.displayName = 'StatusPill';
