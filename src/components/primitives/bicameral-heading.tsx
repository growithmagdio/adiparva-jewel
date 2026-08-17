'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BicameralHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  italicPart: string;
  romanPart: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'left' | 'center' | 'right';
}

export const BicameralHeading = React.forwardRef<HTMLHeadingElement, BicameralHeadingProps>(
  (
    {
      className,
      italicPart,
      romanPart,
      as: Tag = 'h2',
      size = 'lg',
      align = 'left',
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'text-xl sm:text-2xl',
      md: 'text-2xl sm:text-3xl',
      lg: 'text-3xl sm:text-4xl',
      xl: 'text-4xl sm:text-5xl lg:text-6xl',
    };

    const alignClasses = {
      left: 'justify-start text-left',
      center: 'justify-center text-center',
      right: 'justify-end text-right',
    };

    return (
      <Tag
        ref={ref}
        className={twMerge(
          clsx(
            'inline-flex items-baseline gap-[0.5em] leading-tight text-[var(--color-text-900)]',
            sizeClasses[size],
            alignClasses[align],
            className
          )
        )}
        {...props}
      >
        <span className="font-serif italic font-normal text-[1em]">
          {italicPart}
        </span>
        <span className="font-sans font-normal text-[0.78em] tracking-normal text-[var(--color-text-900)]">
          {romanPart}
        </span>
      </Tag>
    );
  }
);

BicameralHeading.displayName = 'BicameralHeading';
