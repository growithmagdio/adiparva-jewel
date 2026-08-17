'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { BicameralHeading, MicroLabel, Price, StatusPill, Button, EmptyState } from '@/components/primitives';
import { getOrders } from '@/lib/data/queries';
import { Order } from '@/lib/data/types';
import { ArrowRight, Package } from 'lucide-react';

export default function AccountOrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
      setLoading(false);
    }
    loadOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-cream-100)] text-[var(--color-text-700)] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-10 space-y-10">
        <div className="border-b border-[var(--color-cream-200)] pb-6">
          <MicroLabel className="text-[var(--color-gold-600)]">PATRON REPOSITORY</MicroLabel>
          <BicameralHeading italicPart="Order" romanPart="History" size="xl" />
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-[var(--color-surface)] rounded animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            title="No order records found"
            description="Explore our heritage collection to place your first reservation."
            actionLabel="Explore collection"
            onAction={() => (window.location.href = '/collections')}
          />
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => {
              const statusVariant =
                ord.status === 'delivered'
                  ? 'ok'
                  : ord.status === 'shipped'
                  ? 'info'
                  : ord.status === 'confirmed' || ord.status === 'pending'
                  ? 'warn'
                  : 'risk';

              return (
                <div
                  key={ord.id}
                  className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] hover:border-[var(--color-gold-500)] p-6 rounded-[var(--radius-card)] shadow-xs transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer"
                  onClick={() => (window.location.href = `/account/orders/${ord.id}`)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-lg font-medium text-[var(--color-text-900)] group-hover:text-[var(--color-gold-600)] transition-colors">
                        #{ord.id}
                      </span>
                      <StatusPill variant={statusVariant} dot>
                        {ord.status}
                      </StatusPill>
                    </div>
                    <p className="text-xs text-[var(--color-text-500)]">
                      Placed on {ord.placedAt} • {ord.items.length} piece(s) reserved
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <Price amount={ord.total} size="md" className="font-semibold" />
                    <ArrowRight className="w-4 h-4 text-[var(--color-gold-600)] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
