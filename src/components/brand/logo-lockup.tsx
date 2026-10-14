'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface LogoLockupProps {
  variant?: 'light' | 'dark';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  priority?: boolean;
}

/**
 * Official Brand Logo Lockup for ADI PARVA — THE TEMPLE OF TRADITION
 * Directly uses the user-provided /logo..png master asset.
 * Preserves the authentic Kolam emblem, deep maroon wordmark, and antique gold tagline.
 */
export function LogoLockup({
  className = '',
  size = 'md',
  priority = false,
}: LogoLockupProps) {
  // Sizing preserving natural aspect ratio of logo..png (1536 x 1024)
  const sizeClasses = {
    sm: 'h-10 sm:h-11 w-auto',
    md: 'h-14 sm:h-16 md:h-18 lg:h-20 w-auto',
    lg: 'h-20 sm:h-24 md:h-28 w-auto',
    xl: 'h-28 sm:h-36 w-auto',
  };

  return (
    <Link
      href="/"
      aria-label="ADI PARVA — The Temple of Tradition"
      title="ADI PARVA — The Temple of Tradition"
      className={`inline-flex items-center group shrink-0 select-none ${className}`}
    >
      <div className="relative transition-transform duration-300 group-hover:scale-[1.02]">
        <Image
          src="/logo..png"
          alt="ADI PARVA — THE TEMPLE OF TRADITION"
          width={1536}
          height={1024}
          priority={priority || size === 'md'}
          className={`${sizeClasses[size]} object-contain drop-shadow-xs`}
        />
      </div>
    </Link>
  );
}
