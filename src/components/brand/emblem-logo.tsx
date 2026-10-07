'use client';

import * as React from 'react';

export interface EmblemLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function EmblemLogo({ className = 'h-10 w-auto', ...props }: EmblemLogoProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Outer Decorative Gopuram Pointed Arch Frame */}
      <path
        d="M60 6C40 22 18 36 18 64C18 88 36 112 60 114C84 112 102 88 102 64C102 36 80 22 60 6Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Inner Inset Filigree Border */}
      <path
        d="M60 14C44 28 26 40 26 64C26 83 40 104 60 106C80 104 94 83 94 64C94 40 76 28 60 14Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="2 2"
      />

      {/* Gopuram Apex Crown Motif */}
      <path
        d="M60 6V22M52 11H68M60 2C62 4 62 4 60 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Central 8-Petal Temple Lotus Rosette */}
      <circle cx="60" cy="64" r="16" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="60" cy="64" r="6" fill="currentColor" />

      {/* Lotus Petal Flourishes (8 Symmetrical Radial Petals) */}
      <path
        d="M60 42C56 50 64 50 60 42Z 
           M60 86C56 78 64 78 60 86Z 
           M38 64C46 60 46 68 38 64Z 
           M82 64C74 60 74 68 82 64Z 
           M44 48C52 52 48 60 44 48Z 
           M76 80C68 76 72 68 76 80Z 
           M44 80C52 76 48 68 44 80Z 
           M76 48C68 52 72 60 76 48Z"
        fill="currentColor"
      />

      {/* Symmetrical Side Filigree Scroll Work */}
      <path
        d="M32 54C24 54 24 68 32 68M88 54C96 54 96 68 88 68"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <path
        d="M60 26C48 38 38 50 38 64M60 26C72 38 82 50 82 64"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Base Pedestal Lines */}
      <path
        d="M38 98C46 102 54 104 60 104C66 104 74 102 82 98"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
