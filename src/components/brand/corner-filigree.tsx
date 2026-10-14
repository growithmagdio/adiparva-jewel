import * as React from 'react';

interface CornerFiligreeProps {
  className?: string;
  position?: 'top-left' | 'bottom-left' | 'top-right' | 'bottom-right';
}

/**
 * Traditional Indian Heritage Antique Gold Corner Filigree Flourish
 * Matches the ornate temple corner decorations in the Adiparva hero reference design.
 */
export function CornerFiligree({
  className = '',
  position = 'top-left',
}: CornerFiligreeProps) {
  const getTransform = () => {
    switch (position) {
      case 'bottom-left':
        return 'scale(1, -1)';
      case 'top-right':
        return 'scale(-1, 1)';
      case 'bottom-right':
        return 'scale(-1, -1)';
      default:
        return 'none';
    }
  };

  return (
    <div
      className={`absolute pointer-events-none select-none z-20 ${className}`}
      style={{ transform: getTransform() }}
      aria-hidden="true"
    >
      <svg
        width="110"
        height="110"
        viewBox="0 0 110 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[70px] h-[70px] sm:w-[90px] sm:h-[90px] lg:w-[110px] lg:h-[110px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
      >
        {/* Outer Hairline Border with Stepped Indent */}
        <path
          d="M6 104 V28 C6 15.85 15.85 6 28 6 H104"
          stroke="#B68A3A"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M12 104 V32 C12 20.95 20.95 12 32 12 H104"
          stroke="#D7B56D"
          strokeWidth="0.8"
          strokeOpacity="0.75"
          strokeLinecap="round"
        />

        {/* Corner Heart/Lotus Scrollwork */}
        <path
          d="M28 28 C36 20 48 24 48 34 C48 42 34 50 28 54 C22 50 8 42 8 34 C8 24 20 20 28 28 Z"
          fill={`url(#goldGrad-${position})`}
          fillOpacity="0.35"
          stroke="#D7B56D"
          strokeWidth="1"
        />

        {/* Central Floral Paisley Bud */}
        <path
          d="M28 28 C31 22 37 24 37 29 C37 34 29 38 28 40 C27 38 19 34 19 29 C19 24 25 22 28 28 Z"
          fill="#FAF5EC"
          fillOpacity="0.75"
        />

        {/* Delicate Tendril Scrolls */}
        <path
          d="M28 12 Q40 4 52 12 Q64 20 76 12"
          stroke="#B68A3A"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
        <path
          d="M12 28 Q4 40 12 52 Q20 64 12 76"
          stroke="#B68A3A"
          strokeWidth="0.9"
          strokeLinecap="round"
        />

        {/* Accent Beads / Jewels */}
        <circle cx="28" cy="28" r="3" fill="#FAF5EC" stroke="#B68A3A" strokeWidth="0.8" />
        <circle cx="6" cy="6" r="2.5" fill="#D7B56D" />
        <circle cx="52" cy="12" r="2" fill="#D7B56D" />
        <circle cx="12" cy="52" r="2" fill="#D7B56D" />
        <circle cx="76" cy="12" r="1.5" fill="#B68A3A" />
        <circle cx="12" cy="76" r="1.5" fill="#B68A3A" />

        {/* Small corner leaf flourish */}
        <path
          d="M16 16 C22 10 26 12 26 16 C26 20 20 22 16 16 Z"
          fill="#B68A3A"
          fillOpacity="0.6"
        />

        {/* Gradient Definition */}
        <defs>
          <linearGradient id={`goldGrad-${position}`} x1="8" y1="20" x2="48" y2="54" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F5D07A" />
            <stop offset="50%" stopColor="#D7B56D" />
            <stop offset="100%" stopColor="#B68A3A" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
