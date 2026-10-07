'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface PriceProps extends React.HTMLAttributes<HTMLSpanElement> {
  amount: number;
  compareAtAmount?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCompareAt?: boolean;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export const Price = React.forwardRef<HTMLSpanElement, PriceProps>(
  (
    {
      className,
      amount,
      compareAtAmount,
      size = 'md',
      showCompareAt = true,
      ...props
    },
    ref
  ) => {
    const formattedPrice = formatCurrency(amount);
    const formattedCompareAt =
      compareAtAmount && compareAtAmount > amount ? formatCurrency(compareAtAmount) : null;

    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base sm:text-lg',
      lg: 'text-xl sm:text-2xl',
      xl: 'text-2xl sm:text-3xl lg:text-4xl',
    };

    return (
      <span
        ref={ref}
        className={twMerge(
          clsx(
            'inline-flex items-baseline gap-2 font-serif font-normal text-[var(--color-text-900)] [font-variant-numeric:lining-nums]',
            sizeClasses[size],
            className
          )
        )}
        {...props}
      >
        <span>{formattedPrice}</span>

        {showCompareAt && formattedCompareAt && (
          <span className="line-through text-[var(--color-text-500)] text-[0.85em] font-normal">
            {formattedCompareAt}
          </span>
        )}
      </span>
    );
  }
);

Price.displayName = 'Price';
