'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { BicameralHeading, MicroLabel, Price, Button } from '@/components/primitives';
import { getOrders } from '@/lib/data/queries';
import { Order } from '@/lib/data/types';
import { User, ShoppingBag, Heart, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

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
    <div className="min-h-screen bg-[var(--color-cream-100)] text-[var(--color-text-700)] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-10 space-y-10">
        <div className="border-b border-[var(--color-cream-200)] pb-6 flex items-center justify-between">
          <div>
            <MicroLabel className="text-[var(--color-gold-600)]">PATRON PROFILE</MicroLabel>
            <BicameralHeading italicPart="Patron" romanPart="Overview" size="xl" />
          </div>

          <span className="px-3.5 py-1.5 bg-[var(--color-gold-100)] text-[var(--color-gold-700)] text-xs font-semibold rounded-[var(--radius-pill)] tracking-wider">
            COLLECTOR TIER
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-6 rounded-[var(--radius-card)] space-y-2">
            <User className="w-5 h-5 text-[var(--color-gold-600)]" />
            <MicroLabel>PATRON NAME</MicroLabel>
            <h4 className="font-serif text-xl font-medium text-[var(--color-text-900)]">Priya Sharma</h4>
            <p className="text-xs text-[var(--color-text-500)]">priya.sharma@example.com</p>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-6 rounded-[var(--radius-card)] space-y-2">
            <ShoppingBag className="w-5 h-5 text-[var(--color-gold-600)]" />
            <MicroLabel>TOTAL RESERVATIONS</MicroLabel>
            <h4 className="font-serif text-xl font-medium text-[var(--color-text-900)]">14 Orders</h4>
            <Link href="/account/orders" className="text-xs text-[var(--color-gold-600)] font-medium inline-flex items-center gap-1">
              <span>View order history</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-6 rounded-[var(--radius-card)] space-y-2">
            <Heart className="w-5 h-5 text-[var(--color-gold-600)]" />
            <MicroLabel>SAVED HEIRLOOMS</MicroLabel>
            <h4 className="font-serif text-xl font-medium text-[var(--color-text-900)]">2 Saved Pieces</h4>
            <Link href="/wishlist" className="text-xs text-[var(--color-gold-600)] font-medium inline-flex items-center gap-1">
              <span>View saved wishlist</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {recentOrder && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-8 rounded-[var(--radius-card)] space-y-4 shadow-xs">
            <MicroLabel className="text-[var(--color-gold-600)]">MOST RECENT RESERVATION</MicroLabel>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-cream-200)] pb-4">
              <div>
                <h4 className="font-serif text-2xl font-medium text-[var(--color-text-900)]">Order #{recentOrder.id}</h4>
                <p className="text-xs text-[var(--color-text-500)] mt-0.5">Placed on {recentOrder.placedAt}</p>
              </div>

              <Price amount={recentOrder.total} size="lg" className="font-semibold" />
            </div>

            <div className="pt-2 flex justify-end">
              <Link href={`/account/orders/${recentOrder.id}`}>
                <Button variant="secondary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  VIEW ORDER TIMELINE
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
