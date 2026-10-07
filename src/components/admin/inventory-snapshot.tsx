'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, MicroLabel, Price, StatusPill } from '@/components/primitives';
import { Product } from '@/lib/data/types';
import { AlertTriangle, Boxes, ArrowRight } from 'lucide-react';

export interface InventorySnapshotProps {
  products: Product[];
}

export function InventorySnapshot({ products }: InventorySnapshotProps) {
  // Filter live products sorted by lowest totalStock first (top 5)
  const needsRestockList = React.useMemo(() => {
    return products
      .filter((p) => p.status === 'live')
      .sort((a, b) => a.totalStock - b.totalStock)
      .slice(0, 5);
  }, [products]);

  return (
    <Card padded={false} className="p-6 space-y-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-[var(--color-warn-fg)] shrink-0" />
            <h3 className="font-serif font-medium text-[1.25rem] text-[var(--color-text-900)]">
              Needs Restock
            </h3>
          </div>
          <MicroLabel className="text-[var(--color-warn-fg)]">LOWEST 5</MicroLabel>
        </div>

        {needsRestockList.length === 0 ? (
          <p className="text-xs text-[var(--color-text-500)] py-4">All live collection pieces maintain sufficient stock levels.</p>
        ) : (
          <div className="space-y-2.5">
            {needsRestockList.map((item) => {
              const threshold = item.lowStockThreshold ?? 3;
              const isSoldOut = item.totalStock === 0;

              return (
                <Link
                  key={item.id}
                  href={`/admin/inventory?tab=${isSoldOut ? 'sold_out' : 'low_stock'}`}
                  className="flex items-center justify-between group p-2 rounded-[var(--radius-card)] bg-[var(--color-cream-50)] border border-[var(--color-cream-200)] hover:border-[var(--color-gold-500)] transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-[44px] h-[44px] rounded-[var(--radius-card)] bg-[var(--color-cream-200)] relative overflow-hidden shrink-0 border border-[var(--color-cream-300)]">
                      <Image
                        src={item.images[0] || '/images/products/maharani-temple-necklace-1.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="font-sans font-semibold text-[12px] text-[var(--color-text-900)] group-hover:text-[var(--color-gold-600)] transition-colors truncate">
                        {item.name}
                      </span>
                      <span className="font-sans text-[10px] text-[var(--color-text-500)]">
                        {item.code || `AP-${item.id.slice(-6)}`}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-2">
                    {isSoldOut ? (
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[var(--color-risk-bg)] text-[var(--color-risk-fg)]">
                        Sold out
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--color-warn-bg)] text-[var(--color-warn-fg)]">
                        {item.totalStock} left
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-[var(--color-cream-200)] text-right mt-auto">
        <Link
          href="/admin/inventory"
          className="inline-flex items-center gap-1.5 font-sans font-medium text-xs text-[var(--color-gold-600)] hover:text-[var(--color-gold-700)] transition-colors"
        >
          <span>Open Full Stock Inventory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
}
