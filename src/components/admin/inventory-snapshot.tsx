'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, MicroLabel, Price } from '@/components/primitives';
import { Product } from '@/lib/data/types';
import { AlertCircle } from 'lucide-react';

export interface InventorySnapshotProps {
  products: Product[];
}

export function InventorySnapshot({ products }: InventorySnapshotProps) {
  // Top featured stock items
  const topItems = products.slice(0, 2);

  // Low availability items (< 5 units)
  const lowStockItems = products.filter((p) => p.totalStock < 5 && p.status === 'live');

  return (
    <Card padded={false} className="p-6 space-y-6 flex flex-col justify-between">
      <div>
        <h3 className="font-serif font-medium text-[1.375rem] text-[var(--color-text-900)] mb-5">
          Inventory Snapshot
        </h3>

        {/* Top Inventory Rows */}
        <div className="space-y-4">
          {topItems.map((item) => (
            <Link
              key={item.id}
              href={`/admin/products/${item.id}`}
              className="flex items-center justify-between group p-1.5 -mx-1.5 rounded-[var(--radius-card)] hover:bg-[var(--color-cream-50)] transition-colors"
            >
              <div className="flex items-center space-x-3.5">
                {/* 56px Square Thumbnail */}
                <div className="w-[56px] h-[56px] rounded-[var(--radius-card)] bg-[var(--color-cream-200)] relative overflow-hidden shrink-0 border border-[var(--color-cream-300)]">
                  <Image
                    src={item.images[0] || '/images/products/maharani-temple-necklace-1.jpg'}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-col">
                  <span className="font-sans font-semibold text-[12px] uppercase tracking-[0.04em] text-[var(--color-text-900)] group-hover:text-[var(--color-gold-600)] transition-colors line-clamp-1">
                    {item.name}
                  </span>
                  <span className="font-sans font-medium text-[12px] text-[var(--color-ok-fg)] mt-0.5">
                    {item.totalStock} units available
                  </span>
                </div>
              </div>

              {/* Price Right-Aligned in Gold */}
              <Price amount={item.price} size="sm" className="text-[var(--color-gold-600)] font-sans font-medium text-sm" />
            </Link>
          ))}
        </div>
      </div>

      {/* Low Availability Alert Group */}
      <div className="pt-5 border-t border-[var(--color-cream-200)] space-y-3">
        <div className="flex items-center space-x-2 text-[var(--color-risk-fg)]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <MicroLabel className="text-[var(--color-risk-fg)] text-[10px]">LOW AVAILABILITY</MicroLabel>
        </div>

        {lowStockItems.length === 0 ? (
          <p className="text-xs text-[var(--color-text-500)]">All live collection pieces maintain sufficient stock levels.</p>
        ) : (
          <div className="space-y-2">
            {lowStockItems.slice(0, 3).map((piece) => (
              <Link
                key={piece.id}
                href={`/admin/products/${piece.id}`}
                className="flex items-center justify-between text-xs font-sans group hover:bg-[var(--color-cream-50)] p-1 rounded transition-colors"
              >
                <span className="text-[var(--color-text-700)] group-hover:text-[var(--color-text-900)] line-clamp-1">
                  {piece.name}
                </span>
                <span className="font-semibold text-[var(--color-risk-fg)] shrink-0 ml-2">
                  {piece.totalStock} left
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
