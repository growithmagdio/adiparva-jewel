'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface MicroLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  as?: 'span' | 'div' | 'p' | 'h4' | 'h5' | 'h6' | 'label';
  htmlFor?: string;
}

export const MicroLabel = React.forwardRef<HTMLElement, MicroLabelProps>(
  ({ className, as: Component = 'span', children, ...props }, ref) => {
    return (
      <Component
        ref={ref as any}
        className={twMerge(
          clsx(
            'font-sans font-semibold text-[11px] leading-none tracking-[0.14em] uppercase text-[var(--color-text-400)] block select-none',
            className
          )
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

MicroLabel.displayName = 'MicroLabel';
