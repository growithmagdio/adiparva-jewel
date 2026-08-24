'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { KolamDivider } from '@/components/storefront/kolam-divider';
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
    <div className="min-h-screen bg-[var(--color-vault-black)] text-[var(--color-ivory)] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12 space-y-10">
        <div className="border-b border-[var(--color-temple-gold)]/20 pb-6">
          <div className="font-marcellus text-[11px] uppercase tracking-[0.35em] text-[var(--color-temple-gold)]">
            PATRON REPOSITORY
          </div>
          <h1 className="font-serif text-[36px] sm:text-[48px] font-light text-[var(--color-ivory)]">
            Order <em className="italic text-gold-gradient font-normal">History</em>
          </h1>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-[var(--color-sanctum)] rounded animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 rounded-[4px] p-8">
            <KolamDivider />
            <h2 className="font-serif text-2xl text-[var(--color-ivory)]">No order records found</h2>
            <p className="font-jost text-sm text-[var(--color-sandal)]/70 font-light">Explore our heritage collection to place your first reservation.</p>
            <Link
              href="/collections"
              className="h-10 px-6 border border-[var(--color-temple-gold)] text-[var(--color-temple-gold)] font-marcellus text-[11px] uppercase tracking-[0.2em] inline-flex items-center justify-center rounded-[2px]"
            >
              EXPLORE COLLECTION
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 p-6 rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-[var(--color-temple-gold)]/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[var(--color-vault-black)] border border-[var(--color-temple-gold)]/30 rounded-[2px] text-[var(--color-temple-gold)]">
                    <Package className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-marcellus text-[11px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)]">
                      #{order.id}
                    </div>
                    <div className="font-serif text-lg text-[var(--color-ivory)] font-light">
                      {order.items.length} {order.items.length === 1 ? 'Piece' : 'Pieces'} reserved
                    </div>
                    <div className="font-jost text-xs text-[var(--color-sandal)]/70">
                      Status: <span className="text-[var(--color-gold-light)] font-medium capitalize">{order.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="font-sans text-xl text-[var(--color-ivory)] tabular-nums">
                    ₹{order.total.toLocaleString('en-IN')}
                  </div>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="h-10 px-5 border border-[var(--color-temple-gold)] text-[var(--color-temple-gold)] font-marcellus text-[11px] uppercase tracking-[0.18em] flex items-center gap-1.5 rounded-[2px] hover:bg-[var(--color-burgundy-silk)] hover:text-[var(--color-ivory)] transition-colors"
                  >
                    <span>TIMELINE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
