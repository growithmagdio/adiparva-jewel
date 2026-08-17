'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MicroLabel } from './micro-label';

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, label, helperText, error, required, htmlFor, children, ...props }, ref) => {
    return (
      <div ref={ref} className={twMerge('flex flex-col space-y-1.5', className)} {...props}>
        {label && (
          <MicroLabel as="label" htmlFor={htmlFor} className="text-[var(--color-text-700)]">
            {label}
            {required && <span className="text-[var(--color-risk-fg)] ml-1">*</span>}
          </MicroLabel>
        )}
        {children}
        {error ? (
          <p className="font-sans text-xs text-[var(--color-risk-fg)] mt-1 font-medium">{error}</p>
        ) : helperText ? (
          <p className="font-sans text-xs text-[var(--color-text-500)] mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Field.displayName = 'Field';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        aria-invalid={hasError ? 'true' : undefined}
        className={twMerge(
          clsx(
            'w-full px-3.5 py-2.5 bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded-[var(--radius-card)] font-sans text-sm text-[var(--color-text-900)] placeholder-[var(--color-text-400)] transition-colors duration-180 focus:border-[var(--color-gold-600)] focus:outline-2 focus:outline-[var(--color-gold-500)] focus:outline-offset-2 disabled:bg-[var(--color-cream-100)] disabled:cursor-not-allowed',
            hasError && 'border-[var(--color-risk-fg)] focus:border-[var(--color-risk-fg)]',
            className
          )
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, hasError, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        aria-invalid={hasError ? 'true' : undefined}
        className={twMerge(
          clsx(
            'w-full px-3.5 py-2.5 bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded-[var(--radius-card)] font-sans text-sm text-[var(--color-text-900)] transition-colors duration-180 focus:border-[var(--color-gold-600)] focus:outline-2 focus:outline-[var(--color-gold-500)] focus:outline-offset-2 disabled:bg-[var(--color-cream-100)] disabled:cursor-not-allowed cursor-pointer',
            hasError && 'border-[var(--color-risk-fg)] focus:border-[var(--color-risk-fg)]',
            className
          )
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={hasError ? 'true' : undefined}
        className={twMerge(
          clsx(
            'w-full px-3.5 py-2.5 bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded-[var(--radius-card)] font-sans text-sm text-[var(--color-text-900)] placeholder-[var(--color-text-400)] transition-colors duration-180 focus:border-[var(--color-gold-600)] focus:outline-2 focus:outline-[var(--color-gold-500)] focus:outline-offset-2 disabled:bg-[var(--color-cream-100)] disabled:cursor-not-allowed min-h-[100px] resize-y',
            hasError && 'border-[var(--color-risk-fg)] focus:border-[var(--color-risk-fg)]',
            className
          )
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';
