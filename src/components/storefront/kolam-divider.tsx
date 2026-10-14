import * as React from 'react';

interface KolamDividerProps {
  className?: string;
}

export function KolamDivider({ className = '' }: KolamDividerProps) {
  return (
    <div
      className={`flex items-center justify-center gap-3 w-full max-w-[280px] mx-auto my-6 select-none opacity-85 ${className}`}
      aria-hidden="true"
    >
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#B68A3A]/40 to-[#B68A3A]" />
      <div className="flex items-center gap-1.5 text-[#B68A3A] text-[11px]">
        <span className="w-1 h-1 rounded-full bg-[#B68A3A]" />
        <span className="font-serif text-[#5B1018]">✦</span>
        <span className="w-1 h-1 rounded-full bg-[#B68A3A]" />
      </div>
      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#B68A3A]/40 to-[#B68A3A]" />
    </div>
  );
}
