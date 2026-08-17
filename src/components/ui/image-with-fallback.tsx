'use client';

import * as React from 'react';
import Image, { ImageProps } from 'next/image';
import { clsx } from 'clsx';

export interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  titleText?: string;
}

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc = '/images/products/maharani-temple-necklace-1.jpg',
  titleText,
  className,
  fill,
  width,
  height,
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = React.useState<string>(typeof src === 'string' ? src : fallbackSrc);
  const [isError, setIsError] = React.useState(false);

  React.useEffect(() => {
    if (typeof src === 'string') {
      setImgSrc(src);
      setIsError(false);
    }
  }, [src]);

  const handleError = () => {
    if (imgSrc !== fallbackSrc && fallbackSrc) {
      setImgSrc(fallbackSrc);
    } else {
      setIsError(true);
    }
  };

  if (isError) {
    return (
      <div
        className={clsx(
          'bg-gradient-to-br from-[var(--color-ink-900)] via-[var(--color-ink-800)] to-[var(--color-gold-700)] text-[var(--color-gold-100)] flex flex-col items-center justify-center p-4 text-center select-none relative overflow-hidden',
          fill ? 'absolute inset-0 w-full h-full' : '',
          className
        )}
        style={{ width: width ? `${width}px` : undefined, height: height ? `${height}px` : undefined }}
      >
        {/* Filigree Background Motifs */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#D99A38_1px,transparent_1px)] [background-size:12px_12px]" />
        
        <div className="relative z-10 space-y-1">
          <span className="font-serif text-lg font-medium tracking-wider text-[var(--color-gold-400)] block">
            {titleText || alt || 'ADI PARVA'}
          </span>
          <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-[var(--color-cream-300)] block">
            HERITAGE JEWELLERY
          </span>
        </div>
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt || 'Adi Parva Heritage Piece'}
      fill={fill}
      width={width}
      height={height}
      className={className}
      onError={handleError}
    />
  );
}
