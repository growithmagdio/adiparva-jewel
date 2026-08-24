import * as React from 'react';

interface KolamDividerProps {
  className?: string;
}

export function KolamDivider({ className = '' }: KolamDividerProps) {
  return (
    <div
      className={`flex items-center justify-center gap-3 w-full max-w-[320px] mx-auto my-8 opacity-80 ${className}`}
      aria-hidden="true"
    >
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[var(--color-temple-gold)]/50 to-[var(--color-temple-gold)]" />
      <div className="flex items-center gap-1.5 text-[var(--color-temple-gold)] text-[12px]">
        <span className="w-1 h-1 rounded-full bg-[var(--color-temple-gold)]/60" />
        <span className="font-serif">✦</span>
        <span className="w-1 h-1 rounded-full bg-[var(--color-temple-gold)]/60" />
      </div>
      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[var(--color-temple-gold)]/50 to-[var(--color-temple-gold)]" />
    </div>
  );
}
