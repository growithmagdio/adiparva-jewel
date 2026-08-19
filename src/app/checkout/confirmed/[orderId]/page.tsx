'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { GopuramRule } from '@/components/ui/GopuramRule';
import { Button } from '@/components/primitives/button';
import { getOrderById } from '@/lib/data/queries';
import { Order } from '@/lib/data/types';
import { MessageSquare, Check, ArrowRight } from 'lucide-react';

export default function OrderConfirmedPage() {
  const params = useParams();
  const orderId = (params?.orderId as string) || '';

  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [whatsappOpted, setWhatsappOpted] = React.useState(false);

  React.useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      if (orderId) {
        const found = await getOrderById(orderId);
        setOrder(found);
      }
      setLoading(false);
    }
    loadOrder();
  }, [orderId]);

  if (loading) return null;

  const firstItem = order?.items[0];

  return (
    <div className="min-h-screen bg-[var(--color-ivory)] text-[var(--color-ink)] flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-16 space-y-16">
        {/* Order Placed Heading Block */}
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <GopuramRule size="sm" />

          <span className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
            Reservation Record: #{order?.id || orderId}
          </span>

          <h1 className="font-bodoni text-[44px] sm:text-[64px] text-[var(--color-ink)] leading-none">
            Order placed.
          </h1>

          <p className="font-karla text-[16px] text-[var(--color-ink)]/75 leading-relaxed">
            Your heirlooms have been registered with the atelier vault. A formal certificate deed and dispatch tracking link have been dispatched to{' '}
            <span className="font-medium text-[var(--color-ink)]">{order?.customerEmail || 'your email'}</span>.
          </p>
        </div>

        {/* Order Details & First Item Display */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          {/* First Item Image (Left 5 Cols) */}
          <div className="md:col-span-5 relative aspect-[4/5] bg-[var(--color-vault)] overflow-hidden">
            {firstItem && (
              <Image
                src={firstItem.image}
                alt={firstItem.name}
                fill
                sizes="(max-width: 768px) 100vw, 350px"
                className="object-cover"
              />
            )}
          </div>

          {/* Itemized Summary & Actions (Right 7 Cols) */}
          <div className="md:col-span-7 space-y-6 font-karla">
            <div className="border-b border-[var(--color-hairline)] pb-4 space-y-1">
              <h3 className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
                Expected Delivery
              </h3>
              <p className="font-bodoni text-2xl text-[var(--color-ink)]">
                Fri, 21 Aug 2026
              </p>
              <p className="text-xs text-[var(--color-ink)]/60">
                Insured Armored Transit via BlueDart Apex
              </p>
            </div>

            {/* Line Items */}
            <div className="space-y-3 divide-y divide-[var(--color-hairline)]/40">
              {order?.items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="pt-3 flex justify-between text-sm">
                  <div>
                    <h4 className="font-medium text-[var(--color-ink)]">{item.name}</h4>
                    <p className="text-xs text-[var(--color-ink)]/60">Qty: {item.qty}</p>
                  </div>
                  <span className="font-medium text-[var(--color-ink)] [font-variant-numeric:tabular-nums]">
                    ₹{(item.unitPrice * item.qty).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Paid */}
            <div className="border-t border-[var(--color-hairline)] pt-4 flex justify-between items-baseline">
              <span className="font-marcellus text-xs uppercase tracking-[0.18em] text-[var(--color-gold)]">Total Paid</span>
              <span className="font-bodoni text-[28px] text-[var(--color-ink)] [font-variant-numeric:tabular-nums]">
                ₹{(order?.total || 45000).toLocaleString('en-IN')}
              </span>
            </div>

            {/* WhatsApp Tracking Opt-In */}
            <div className="p-4 bg-[var(--color-bone)] border border-[var(--color-hairline)] flex items-center justify-between gap-4 rounded-[2px]">
              <div className="space-y-0.5">
                <span className="font-marcellus text-[11px] uppercase tracking-[0.14em] text-[var(--color-leaf)] block">
                  WhatsApp Concierge Updates
                </span>
                <p className="text-xs text-[var(--color-ink)]/70">
                  Receive live transit milestones and delivery dispatch photos directly on WhatsApp.
                </p>
              </div>

              <button
                onClick={() => setWhatsappOpted(true)}
                className={`px-4 py-2 text-xs font-marcellus uppercase tracking-[0.14em] border transition-colors shrink-0 rounded-[2px] ${
                  whatsappOpted
                    ? 'border-[var(--color-leaf)] bg-[var(--color-leaf)] text-white'
                    : 'border-[var(--color-leaf)] text-[var(--color-leaf)] hover:bg-[var(--color-leaf)]/10'
                }`}
              >
                {whatsappOpted ? 'Opted In ✓' : 'Opt In'}
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href={`/account/orders/${order?.id || orderId}`}>
                <Button variant="ghost">Track order</Button>
              </Link>
              <Link href="/collections">
                <Button variant="gold">Continue browsing</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
