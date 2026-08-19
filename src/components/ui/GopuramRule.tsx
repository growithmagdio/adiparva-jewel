'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GopuramRuleProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GopuramRule: React.FC<GopuramRuleProps> = ({
  size = 'md',
  className = '',
}) => {
  const dimensions = {
    sm: 'w-[240px] h-[24px]',
    md: 'w-[560px] h-[32px] max-w-full',
    lg: 'w-full h-[36px]',
  };

  // SVG viewBox: 1000 x 40
  // Left half path drawing from left to center
  const leftPath = "M 0 35 L 430 35 L 430 24 L 460 24 L 460 13 L 485 13 L 485 2 L 500 2";
  // Right half path drawing from right to center
  const rightPath = "M 1000 35 L 570 35 L 570 24 L 540 24 L 540 13 L 515 13 L 515 2 L 500 2";

  return (
    <div className={`flex justify-center items-center my-6 ${dimensions[size]} ${className}`}>
      <svg
        viewBox="0 0 1000 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
        aria-hidden="true"
      >
        <motion.path
          d={leftPath}
          stroke="var(--color-gold)"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: '-20%' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.path
          d={rightPath}
          stroke="var(--color-gold)"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: '-20%' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
    </div>
  );
};
