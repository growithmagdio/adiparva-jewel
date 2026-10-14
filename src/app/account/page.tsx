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
    <div className="min-h-screen bg-[#FAF5EC] text-[#765E55] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12 space-y-10">
        <div className="border-b border-[#E7D7C0] pb-6 flex items-center justify-between">
          <div>
            <div className="font-marcellus text-[11px] uppercase tracking-[0.35em] text-[#B68A3A] font-semibold">
              PATRON PROFILE
            </div>
            <h1 className="font-serif text-[36px] sm:text-[48px] font-normal text-[#5B1018]">
              Patron <em className="italic font-normal text-[#B68A3A]">Overview</em>
            </h1>
          </div>

          <span className="px-4 py-1.5 border border-[#B68A3A] bg-[#5B1018] text-[#FAF5EC] font-marcellus text-xs uppercase tracking-[0.2em] rounded-[2px] font-semibold">
            COLLECTOR TIER
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#E7D7C0] p-6 rounded-[4px] space-y-3 shadow-xs">
            <User className="w-5 h-5 text-[#B68A3A] stroke-[1.5]" />
            <div className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[#B68A3A] font-semibold">
              PATRON NAME
            </div>
            <h4 className="font-serif text-xl font-normal text-[#5B1018]">Priya Sharma</h4>
            <p className="font-jost text-xs text-[#765E55]">priya.sharma@example.com</p>
          </div>

          <div className="bg-white border border-[#E7D7C0] p-6 rounded-[4px] space-y-3 shadow-xs">
            <ShoppingBag className="w-5 h-5 text-[#B68A3A] stroke-[1.5]" />
            <div className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[#B68A3A] font-semibold">
              TOTAL RESERVATIONS
            </div>
            <h4 className="font-serif text-xl font-normal text-[#5B1018]">14 Orders</h4>
            <Link href="/account/orders" className="font-marcellus text-xs text-[#B68A3A] hover:text-[#5B1018] inline-flex items-center gap-1.5 transition-colors font-medium">
              <span>View order history</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-[#E7D7C0] p-6 rounded-[4px] space-y-3 shadow-xs">
            <Heart className="w-5 h-5 text-[#B68A3A] stroke-[1.5]" />
            <div className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[#B68A3A] font-semibold">
              SAVED HEIRLOOMS
            </div>
            <h4 className="font-serif text-xl font-normal text-[#5B1018]">2 Saved Pieces</h4>
            <Link href="/wishlist" className="font-marcellus text-xs text-[#B68A3A] hover:text-[#5B1018] inline-flex items-center gap-1.5 transition-colors font-medium">
              <span>View saved wishlist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {recentOrder && (
          <div className="bg-white border border-[#E7D7C0] p-8 rounded-[4px] space-y-6 shadow-sm">
            <div className="font-marcellus text-[11px] uppercase tracking-[0.3em] text-[#B68A3A] font-semibold">
              MOST RECENT RESERVATION
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7D7C0] pb-4">
              <div>
                <h4 className="font-serif text-2xl font-normal text-[#5B1018]">Order #{recentOrder.id}</h4>
                <p className="font-jost text-xs text-[#765E55] mt-1">Placed on {new Date(recentOrder.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>

              <div className="font-sans text-2xl font-semibold text-[#5B1018] tabular-nums">
                ₹{recentOrder.total.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                href={`/account/orders/${recentOrder.id}`}
                className="h-10 px-6 bg-[#5B1018] text-[#FAF5EC] hover:bg-[#3B090D] font-marcellus text-[11px] uppercase tracking-[0.2em] inline-flex items-center gap-2 rounded-[2px] transition-colors"
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
