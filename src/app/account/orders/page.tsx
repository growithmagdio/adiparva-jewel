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
    <div className="min-h-screen bg-[#FAF5EC] text-[#765E55] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12 space-y-10">
        <div className="border-b border-[#E7D7C0] pb-6">
          <div className="font-marcellus text-[11px] uppercase tracking-[0.35em] text-[#B68A3A] font-semibold">
            PATRON REPOSITORY
          </div>
          <h1 className="font-serif text-[36px] sm:text-[48px] font-normal text-[#5B1018]">
            Order <em className="italic font-normal text-[#B68A3A]">History</em>
          </h1>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-white/60 border border-[#E7D7C0] rounded animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-white border border-[#E7D7C0] rounded-[4px] p-8 shadow-sm">
            <KolamDivider />
            <h2 className="font-serif text-2xl text-[#5B1018]">No order records found</h2>
            <p className="font-jost text-sm text-[#765E55]">Explore our heritage collection to place your first reservation.</p>
            <Link
              href="/collections"
              className="h-10 px-6 bg-[#5B1018] text-[#FAF5EC] hover:bg-[#3B090D] font-marcellus text-[11px] uppercase tracking-[0.2em] inline-flex items-center justify-center rounded-[2px] transition-colors"
            >
              EXPLORE COLLECTION
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-[#E7D7C0] p-6 rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-[#B68A3A] transition-all shadow-xs"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#FAF5EC] border border-[#E7D7C0] rounded-[2px] text-[#B68A3A]">
                    <Package className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-marcellus text-[11px] uppercase tracking-[0.2em] text-[#B68A3A] font-semibold">
                      #{order.id}
                    </div>
                    <div className="font-serif text-lg text-[#5B1018] font-normal">
                      {order.items.length} {order.items.length === 1 ? 'Piece' : 'Pieces'} reserved
                    </div>
                    <div className="font-jost text-xs text-[#765E55]">
                      Status: <span className="text-[#5B1018] font-medium capitalize">{order.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="font-sans text-xl text-[#5B1018] font-semibold tabular-nums">
                    ₹{order.total.toLocaleString('en-IN')}
                  </div>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="h-10 px-5 bg-[#5B1018] text-[#FAF5EC] hover:bg-[#3B090D] font-marcellus text-[11px] uppercase tracking-[0.18em] flex items-center gap-1.5 rounded-[2px] transition-colors"
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
