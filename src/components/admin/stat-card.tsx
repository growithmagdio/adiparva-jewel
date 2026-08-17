'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { MicroLabel } from '@/components/primitives';

export interface StatCardProps {
  label: string;
  value: string;
  delta: string;
  icon: React.ComponentType<{ className?: string }>;
  isEmphasis?: boolean; // Card 2 emphasis mode
  index?: number;
}

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  isEmphasis = false,
  index = 0,
}: StatCardProps) {
  const isStable = delta.toLowerCase().includes('stable');
  const isPositive = delta.includes('+') || delta.includes('↗');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, delay: index * 0.06, ease: 'easeOut' }}
      className="bg-[var(--color-surface)] rounded-[var(--radius-card)] border border-[var(--color-cream-200)] shadow-[0_1px_2px_rgba(28,15,7,0.04)] p-6 flex flex-col justify-between select-none relative overflow-hidden"
    >
      {/* Top Row: 56px Tile + Floated Top-Right Delta */}
      <div className="flex items-start justify-between">
        {/* 56px Tile */}
        <div
          className={clsx(
            'w-[56px] h-[56px] rounded-[var(--radius-tile)] flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-105',
            isEmphasis
              ? 'bg-[var(--color-gold-600)] text-white shadow-xs'
              : 'bg-[var(--color-gold-100)] text-[var(--color-gold-600)]'
          )}
        >
          <Icon className="w-6 h-6" />
        </div>

        {/* Delta Floated Top-Right */}
        <div
          className={clsx(
            'font-sans font-medium text-[13px] leading-none pt-1',
            isStable
              ? 'text-[var(--color-text-500)]'
              : isPositive
              ? 'text-[var(--color-ok-fg)]'
              : 'text-[var(--color-risk-fg)]'
          )}
        >
          {delta}
        </div>
      </div>

      {/* 28px Gap */}
      <div className="h-[28px]" aria-hidden="true" />

      {/* Bottom Block: Micro-Label + Playfair 2.25rem Value */}
      <div className="space-y-1">
        <MicroLabel>{label}</MicroLabel>
        <div className="font-serif font-normal text-[2.25rem] leading-none text-[var(--color-text-900)] [font-variant-numeric:lining-nums]">
          {value}
        </div>
      </div>
    </motion.div>
  );
}
