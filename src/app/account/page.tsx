'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { KolamDivider } from '@/components/storefront/kolam-divider';
import { getOrders } from '@/lib/data/queries';
import { Order } from '@/lib/data/types';
import { User, ShoppingBag, Heart, ArrowRight } from 'lucide-react';

export default function AccountOverviewPage() {
  const [recentOrder, setRecentOrder] = React.useState<Order | null>(null);

  React.useEffect(() => {
    async function loadData() {
      const orders = await getOrders();
      if (orders.length > 0) setRecentOrder(orders[0]);
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-vault-black)] text-[var(--color-ivory)] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12 space-y-10">
        <div className="border-b border-[var(--color-temple-gold)]/20 pb-6 flex items-center justify-between">
          <div>
            <div className="font-marcellus text-[11px] uppercase tracking-[0.35em] text-[var(--color-temple-gold)]">
              PATRON PROFILE
            </div>
            <h1 className="font-serif text-[36px] sm:text-[48px] font-light text-[var(--color-ivory)]">
              Patron <em className="italic text-gold-gradient font-normal">Overview</em>
            </h1>
          </div>

          <span className="px-4 py-1.5 border border-[var(--color-temple-gold)]/40 bg-[var(--color-burgundy-silk)] text-[var(--color-gold-light)] font-marcellus text-xs uppercase tracking-[0.2em] rounded-[2px]">
            COLLECTOR TIER
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 p-6 rounded-[4px] space-y-3 shadow-lg">
            <User className="w-5 h-5 text-[var(--color-temple-gold)] stroke-[1.5]" />
            <div className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)]">
              PATRON NAME
            </div>
            <h4 className="font-serif text-xl font-light text-[var(--color-ivory)]">Priya Sharma</h4>
            <p className="font-jost text-xs text-[var(--color-sandal)]/70">priya.sharma@example.com</p>
          </div>

          <div className="bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 p-6 rounded-[4px] space-y-3 shadow-lg">
            <ShoppingBag className="w-5 h-5 text-[var(--color-temple-gold)] stroke-[1.5]" />
            <div className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)]">
              TOTAL RESERVATIONS
            </div>
            <h4 className="font-serif text-xl font-light text-[var(--color-ivory)]">14 Orders</h4>
            <Link href="/account/orders" className="font-marcellus text-xs text-[var(--color-temple-gold)] hover:text-[var(--color-gold-light)] inline-flex items-center gap-1.5 transition-colors">
              <span>View order history</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 p-6 rounded-[4px] space-y-3 shadow-lg">
            <Heart className="w-5 h-5 text-[var(--color-temple-gold)] stroke-[1.5]" />
            <div className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)]">
              SAVED HEIRLOOMS
            </div>
            <h4 className="font-serif text-xl font-light text-[var(--color-ivory)]">2 Saved Pieces</h4>
            <Link href="/wishlist" className="font-marcellus text-xs text-[var(--color-temple-gold)] hover:text-[var(--color-gold-light)] inline-flex items-center gap-1.5 transition-colors">
              <span>View saved wishlist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {recentOrder && (
          <div className="bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 p-8 rounded-[4px] space-y-6 shadow-xl">
            <div className="font-marcellus text-[11px] uppercase tracking-[0.3em] text-[var(--color-temple-gold)]">
              MOST RECENT RESERVATION
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-temple-gold)]/20 pb-4">
              <div>
                <h4 className="font-serif text-2xl font-light text-[var(--color-ivory)]">Order #{recentOrder.id}</h4>
                <p className="font-jost text-xs text-[var(--color-sandal)]/70 mt-1">Placed on {new Date(recentOrder.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>

              <div className="font-sans text-2xl font-normal text-[var(--color-ivory)] tabular-nums">
                ₹{recentOrder.total.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                href={`/account/orders/${recentOrder.id}`}
                className="h-10 px-6 border border-[var(--color-temple-gold)] text-[var(--color-temple-gold)] font-marcellus text-[11px] uppercase tracking-[0.2em] inline-flex items-center gap-2 rounded-[2px] hover:bg-[var(--color-burgundy-silk)] hover:text-[var(--color-ivory)] transition-colors"
              >
                <span>VIEW ORDER TIMELINE</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
