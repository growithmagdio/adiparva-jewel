'use client';

import * as React from 'react';
import { BicameralHeading, MicroLabel, StatusPill, Button, Price } from '@/components/primitives';
import { getCoupons } from '@/lib/data/queries';
import { Coupon } from '@/lib/data/types';
import { Ticket, Plus } from 'lucide-react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = React.useState<Coupon[]>([]);

  React.useEffect(() => {
    async function loadCoupons() {
      const data = await getCoupons();
      setCoupons(data);
    }
    loadCoupons();
  }, []);

  return (
    <div className="space-y-8 select-none max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[var(--color-cream-200)] pb-6">
        <div>
          <MicroLabel className="text-[var(--color-gold-600)]">OFFER INSTRUMENTS</MicroLabel>
          <BicameralHeading italicPart="Offer" romanPart="Coupons" size="xl" />
        </div>

        <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
          CREATE COUPON CODE
        </Button>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] rounded-[var(--radius-card)] overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-cream-200)] bg-[var(--color-cream-50)]">
              <th className="py-3 px-4"><MicroLabel>CODE</MicroLabel></th>
              <th className="py-3 px-4"><MicroLabel>TYPE & VALUE</MicroLabel></th>
              <th className="py-3 px-4"><MicroLabel>MIN ORDER</MicroLabel></th>
              <th className="py-3 px-4"><MicroLabel>STATUS</MicroLabel></th>
              <th className="py-3 px-4 text-right"><MicroLabel>USAGE</MicroLabel></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-cream-200)] text-xs font-sans">
            {coupons.map((c) => {
              const statusVariant = c.status === 'active' ? 'ok' : c.status === 'scheduled' ? 'warn' : 'risk';
              return (
                <tr key={c.id} className="h-14 hover:bg-[var(--color-cream-50)] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-sm text-[var(--color-gold-600)]">{c.code}</td>
                  <td className="py-3 px-4 text-[var(--color-text-900)] font-medium">
                    {c.type === 'percent' ? `${c.value}% OFF` : `₹${c.value} FLAT`}
                  </td>
                  <td className="py-3 px-4 text-[var(--color-text-700)]">
                    <Price amount={c.minOrder} size="sm" />
                  </td>
                  <td className="py-3 px-4">
                    <StatusPill variant={statusVariant} dot>
                      {c.status}
                    </StatusPill>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-[var(--color-text-900)]">
                    {c.usedCount} / {c.usageLimit}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
