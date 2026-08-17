'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-sans font-medium transition-all duration-180 focus-visible:outline-2 focus-visible:outline-[var(--color-gold-500)] focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

    const variantStyles = {
      primary:
        'bg-[var(--color-gold-600)] text-white hover:bg-[var(--color-gold-700)] active:bg-[var(--color-gold-700)] shadow-xs rounded-[var(--radius-card)]',
      secondary:
        'bg-[var(--color-surface)] text-[var(--color-text-900)] border border-[var(--color-cream-300)] hover:bg-[var(--color-cream-100)] hover:border-[var(--color-gold-600)] rounded-[var(--radius-card)]',
      ghost:
        'bg-transparent text-[var(--color-text-700)] hover:bg-[var(--color-cream-200)] hover:text-[var(--color-text-900)] rounded-[var(--radius-card)]',
      danger:
        'bg-[var(--color-risk-bg)] text-[var(--color-risk-fg)] border border-[var(--color-risk-fg)]/20 hover:bg-[var(--color-risk-fg)] hover:text-white rounded-[var(--radius-card)]',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs gap-1.5 tracking-wider uppercase',
      md: 'px-4 py-2 text-sm gap-2 tracking-wide',
      lg: 'px-6 py-3 text-base gap-2.5 tracking-wide',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variantStyles[variant], sizeStyles[size], className))}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
