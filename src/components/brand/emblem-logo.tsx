'use client';

import * as React from 'react';

export interface EmblemLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  color?: string; // primary line color
  accentColor?: string; // dots & accents
}

/**
 * Authentic Adiparva Sacred Sikku Kolam (Brahma Mudi) Emblem
 * 4-fold symmetrical temple kolam with interlaced ribbons,
 * cardinal concentric loop terminals, diagonal petal flourishes, and sacred bindu dots.
 * Transparent background - no orange square.
 */
export function EmblemLogo({
  className = 'h-10 w-auto',
  color = '#5B1018', // Deep Maroon
  accentColor = '#B68A3A', // Antique Gold
  ...props
}: EmblemLogoProps) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* 4 Cardinal Terminal Loops (North, South, East, West) */}
      {/* North Loop */}
      <g>
        <path
          d="M80 8 C72 8 68 18 72 26 C75 32 80 36 80 44 C80 36 85 32 88 26 C92 18 88 8 80 8 Z"
          stroke={color}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="80" cy="20" r="5" stroke={color} strokeWidth="2" fill="none" />
        <circle cx="80" cy="20" r="2.2" fill={accentColor} />
      </g>

      {/* South Loop */}
      <g>
        <path
          d="M80 152 C72 152 68 142 72 134 C75 128 80 124 80 116 C80 124 85 128 88 134 C92 142 88 152 80 152 Z"
          stroke={color}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="80" cy="140" r="5" stroke={color} strokeWidth="2" fill="none" />
        <circle cx="80" cy="140" r="2.2" fill={accentColor} />
      </g>

      {/* West Loop */}
      <g>
        <path
          d="M8 80 C8 72 18 68 26 72 C32 75 36 80 44 80 C36 80 32 85 26 88 C18 92 8 88 8 80 Z"
          stroke={color}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="80" r="5" stroke={color} strokeWidth="2" fill="none" />
        <circle cx="20" cy="80" r="2.2" fill={accentColor} />
      </g>

      {/* East Loop */}
      <g>
        <path
          d="M152 80 C152 72 142 68 134 72 C128 75 124 80 116 80 C124 80 128 85 134 88 C142 92 152 88 152 80 Z"
          stroke={color}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="140" cy="80" r="5" stroke={color} strokeWidth="2" fill="none" />
        <circle cx="140" cy="80" r="2.2" fill={accentColor} />
      </g>

      {/* 4 Diagonal Petal Wings (NE, NW, SE, SW) */}
      {/* North-East Wing */}
      <g>
        <path
          d="M102 38 C116 32 130 42 124 56 C120 64 112 68 104 68"
          stroke={color}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M122 30 C136 34 140 50 132 60 C126 66 116 66 108 64"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="120" cy="46" r="2.5" fill={accentColor} />
      </g>

      {/* North-West Wing */}
      <g>
        <path
          d="M58 38 C44 32 30 42 36 56 C40 64 48 68 56 68"
          stroke={color}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M38 30 C24 34 20 50 28 60 C34 66 44 66 52 64"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="40" cy="46" r="2.5" fill={accentColor} />
      </g>

      {/* South-East Wing */}
      <g>
        <path
          d="M102 122 C116 128 130 118 124 104 C120 96 112 92 104 92"
          stroke={color}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M122 130 C136 126 140 110 132 100 C126 94 116 94 108 96"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="120" cy="114" r="2.5" fill={accentColor} />
      </g>

      {/* South-West Wing */}
      <g>
        <path
          d="M58 122 C44 128 30 118 36 104 C40 96 48 92 56 92"
          stroke={color}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M38 130 C24 126 20 110 28 100 C34 94 44 94 52 96"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="40" cy="114" r="2.5" fill={accentColor} />
      </g>

      {/* Interlacing Sikku Ribbons Matrix (The Central Sacred Web) */}
      {/* Diagonal Band 1: NW to SE */}
      <path
        d="M50 50 Q65 65 80 80 Q95 95 110 110"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* Diagonal Band 2: NE to SW */}
      <path
        d="M110 50 Q95 65 80 80 Q65 95 50 110"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      {/* Outer Interlacing Diamond Lattice Lines */}
      <path
        d="M80 34 L126 80 L80 126 L34 80 Z"
        stroke={color}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M80 48 L112 80 L80 112 L48 80 Z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Inner Central Petal Curves and Knots */}
      <path
        d="M66 66 C73 59 87 59 94 66 C101 73 101 87 94 94 C87 101 73 101 66 94 C59 87 59 73 66 66 Z"
        stroke={color}
        strokeWidth="2.2"
      />

      {/* Center Sacred Bindu Rosette */}
      <circle cx="80" cy="80" r="6" stroke={accentColor} strokeWidth="1.8" fill="none" />
      <circle cx="80" cy="80" r="2.8" fill={color} />

      {/* Grid of Sacred Dots (Pullis) inside each cell */}
      {/* Inner Ring Dots */}
      <circle cx="80" cy="62" r="2.4" fill={accentColor} />
      <circle cx="80" cy="98" r="2.4" fill={accentColor} />
      <circle cx="62" cy="80" r="2.4" fill={accentColor} />
      <circle cx="98" cy="80" r="2.4" fill={accentColor} />

      {/* Mid Ring Dots */}
      <circle cx="62" cy="62" r="2.2" fill={color} />
      <circle cx="98" cy="62" r="2.2" fill={color} />
      <circle cx="62" cy="98" r="2.2" fill={color} />
      <circle cx="98" cy="98" r="2.2" fill={color} />

      {/* Outer Ring Cardinal Dots */}
      <circle cx="80" cy="40" r="2.2" fill={accentColor} />
      <circle cx="80" cy="120" r="2.2" fill={accentColor} />
      <circle cx="40" cy="80" r="2.2" fill={accentColor} />
      <circle cx="120" cy="80" r="2.2" fill={accentColor} />
    </svg>
  );
}
