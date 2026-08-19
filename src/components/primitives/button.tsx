'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'ghost' | 'text' | 'whatsapp' | 'danger';
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
      'inline-flex items-center justify-center font-marcellus uppercase tracking-[0.16em] text-[12px] transition-all duration-320 focus-visible:outline-1 focus-visible:outline-[var(--color-gold)] focus-visible:outline-offset-[3px] disabled:opacity-50 disabled:pointer-events-none cursor-pointer rounded-[2px] border border-transparent';

    const variantStyles = {
      primary:
        'bg-[var(--color-vault)] text-[var(--color-ivory)] border-transparent hover:border-[var(--color-gold)] hover:bg-[var(--color-ink)]',
      secondary:
        'bg-transparent text-[var(--color-ink)] border-[var(--color-hairline)] hover:border-[var(--color-gold)]',
      gold:
        'bg-[var(--color-gold)] text-[var(--color-vault)] hover:bg-[var(--color-gold-lit)] font-semibold',
      ghost:
        'bg-transparent text-[var(--color-ink)] border-[var(--color-hairline)] hover:border-[var(--color-gold)]',
      text:
        'bg-transparent text-[var(--color-ink)] border-transparent underline underline-offset-4 decoration-[var(--color-gold)] hover:text-[var(--color-gold)] p-0 h-auto',
      whatsapp:
        'bg-transparent text-[var(--color-leaf)] border-[var(--color-leaf)] hover:bg-[var(--color-leaf)]/5',
      danger:
        'bg-[var(--color-kumkum)] text-white hover:bg-[var(--color-kumkum)]/90',
    };

    const sizeStyles = {
      sm: 'h-[40px] px-4 text-[11px]',
      md: 'h-[52px] px-6 text-[12px]',
      lg: 'h-[60px] px-8 text-[13px]',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variantStyles[variant], variant !== 'text' && sizeStyles[size], className))}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0 mr-2" aria-hidden="true" />
        ) : (
          leftIcon && <span className="shrink-0 mr-2">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0 ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
