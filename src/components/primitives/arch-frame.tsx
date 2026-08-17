'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ArchFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: 'portrait' | 'square' | 'wide';
  showGoldStroke?: boolean;
  children: React.ReactNode;
}

export const ArchFrame = React.forwardRef<HTMLDivElement, ArchFrameProps>(
  (
    {
      className,
      ratio = 'portrait',
      showGoldStroke = true,
      children,
      ...props
    },
    ref
  ) => {
    const ratioClasses = {
      portrait: 'aspect-[4/5]',
      square: 'aspect-square',
      wide: 'aspect-[16/9]',
    };

    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'relative overflow-hidden group select-none',
            ratioClasses[ratio],
            className
          )
        )}
        style={{
          clipPath: 'polygon(50% 0%, 65% 8%, 78% 8%, 78% 18%, 90% 18%, 90% 28%, 90% 100%, 10% 100%, 10% 28%, 20% 28%, 20% 18%, 32% 18%, 32% 8%, 50% 0%)',
        }}
        {...props}
      >
        {/* Child content (Image / React element) */}
        <div className="w-full h-full relative transition-transform duration-500 ease-out group-hover:scale-[1.03]">
          {children}
        </div>

        {/* Hairline gold stroke inset 6px */}
        {showGoldStroke && (
          <div
            className="absolute inset-[6px] pointer-events-none z-10 border border-[var(--color-gold-500)]/40 transition-opacity duration-300"
            style={{
              clipPath: 'polygon(50% 0%, 65% 8%, 78% 8%, 78% 18%, 90% 18%, 90% 28%, 90% 100%, 10% 100%, 10% 28%, 20% 28%, 20% 18%, 32% 18%, 32% 8%, 50% 0%)',
            }}
            aria-hidden="true"
          />
        )}
      </div>
    );
  }
);

ArchFrame.displayName = 'ArchFrame';
