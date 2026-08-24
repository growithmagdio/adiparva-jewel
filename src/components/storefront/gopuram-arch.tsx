'use client';

import * as React from 'react';
import Image from 'next/image';

interface GopuramArchProps {
  src: string;
  alt: string;
  aspect?: 'portrait' | 'square' | 'wide' | 'custom';
  className?: string;
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
  children?: React.ReactNode;
}

export function GopuramArch({
  src,
  alt,
  aspect = 'portrait',
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, 50vw',
  width,
  height,
  children,
}: GopuramArchProps) {
  const aspectClass =
    aspect === 'portrait'
      ? 'aspect-[3/4]'
      : aspect === 'square'
      ? 'aspect-square'
      : aspect === 'wide'
      ? 'aspect-[16/9]'
      : '';

  return (
    <div
      className={`relative overflow-hidden rounded-t-[999px] rounded-b-[10px] bg-[#120D0E] group ${aspectClass} ${className}`}
    >
      {/* 1px Inset Hairline Gold Frame */}
      <div
        className="absolute inset-[8px] sm:inset-[10px] pointer-events-none z-20 border border-[var(--color-temple-gold)]/40 rounded-t-[999px] rounded-b-[6px] transition-all duration-500 group-hover:border-[var(--color-gold-light)] group-hover:inset-[6px]"
        style={{
          boxShadow: 'inset 0 0 80px rgba(0, 0, 0, 0.75)',
        }}
      />

      {/* Deep Vignette Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/40" />

      {/* Main Image */}
      <Image
        src={src}
        alt={alt}
        fill={!width && !height}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {children && <div className="relative z-30">{children}</div>}
    </div>
  );
}
