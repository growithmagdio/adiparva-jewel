'use client';

import React from 'react';

interface KolamLatticeProps {
  className?: string;
}

export const KolamLattice: React.FC<KolamLatticeProps> = ({ className = '' }) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none opacity-[0.04] overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <pattern
          id="kolam-lattice"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="20" cy="20" r="1.5" fill="#FAF7F1" />
          <circle cx="0" cy="0" r="1" fill="#D6AC5E" />
          <circle cx="40" cy="0" r="1" fill="#D6AC5E" />
          <circle cx="0" cy="40" r="1" fill="#D6AC5E" />
          <circle cx="40" cy="40" r="1" fill="#D6AC5E" />
          <path
            d="M 20 0 Q 30 10 20 20 Q 10 30 20 40 Q 30 30 20 20 Q 10 10 20 0 Z"
            fill="none"
            stroke="#D6AC5E"
            strokeWidth="0.5"
          />
        </pattern>
        <rect width="100%" height="100%" fill="url(#kolam-lattice)" />
      </svg>
    </div>
  );
};
