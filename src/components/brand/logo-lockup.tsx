'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface LogoLockupProps {
  variant?: 'light' | 'dark';
  className?: string;
}

export function LogoLockup({ variant = 'light', className = '' }: LogoLockupProps) {
  const isDark = variant === 'dark';
  const titleColor = isDark ? 'text-[#FBF7EE]' : 'text-[#2A1E17]';
  const taglineColor = isDark ? 'text-[#B8923A]' : 'text-[#8A6A1F]';

  return (
    <Link
      href="/"
      aria-label="Adi Parva"
      title="Adi Parva"
      className={`inline-flex items-center gap-3 group shrink-0 select-none ${className}`}
    >
      {/* Logo Image: logo.jpeg (enlarged for crystal-clear word legibility) */}
      <Image
        src="/logo.jpeg"
        alt="Adi Parva"
        width={320}
        height={100}
        className="h-14 sm:h-16 md:h-20 lg:h-22 w-auto object-contain rounded-[3px] transition-transform duration-300 group-hover:scale-105 shrink-0 shadow-xs"
        priority
      />

      {/* Brand Text Lockup */}
      <div className="flex-col justify-center hidden min-[400px]:flex">
        <span
          className={`font-serif text-[22px] sm:text-[26px] md:text-[30px] tracking-[0.14em] font-medium leading-tight transition-colors ${titleColor}`}
        >
          ADI PARVA
        </span>
        <span
          className={`font-marcellus text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.38em] md:tracking-[0.48em] mt-1 hidden md:block leading-none ${taglineColor}`}
        >
          THE TEMPLE OF TRADITION
        </span>
      </div>
    </Link>
  );
}
