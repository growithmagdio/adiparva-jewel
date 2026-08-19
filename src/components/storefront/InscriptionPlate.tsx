'use client';

import * as React from 'react';
import { Product } from '@/lib/data/types';

interface InscriptionPlateProps {
  product: Product;
}

export function InscriptionPlate({ product }: InscriptionPlateProps) {
  const specs = [
    { label: 'Weight', value: product.weightGrams ? `${product.weightGrams} grams` : '48.5 grams' },
    { label: 'Plating', value: product.plating || '22kt Gold Plating' },
    { label: 'Base Metal', value: product.baseMetal || 'Brass & Silver Alloy' },
    { label: 'Stones', value: product.stones ? product.stones.join(', ') : 'Hand-set Kemp & River Pearls' },
    { label: 'Closure', value: product.closure || 'Adjustable Silk Dori / S-Hook' },
    { label: 'Length', value: product.lengthInches || '16 to 18 inches adjustable' },
    { label: 'Origin', value: product.artisanCluster || 'Madurai, Tamil Nadu' },
  ];

  return (
    <div className="bg-[var(--color-bone)] border border-[var(--color-hairline)] p-5 space-y-3 rounded-[2px] select-none">
      <div className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)] border-b border-[var(--color-hairline)]/50 pb-2">
        ATELIER INSCRIPTION & SPECIFICATIONS
      </div>
      <table className="w-full font-karla text-xs border-collapse">
        <tbody>
          {specs.map((spec) => (
            <tr key={spec.label} className="border-b border-[var(--color-hairline)]/30 last:border-none">
              <td className="py-2 font-marcellus text-[11px] uppercase tracking-[0.14em] text-[var(--color-gold)] w-1/3">
                {spec.label}
              </td>
              <td className="py-2 text-[var(--color-ink)] text-right sm:text-left font-medium">
                {spec.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
