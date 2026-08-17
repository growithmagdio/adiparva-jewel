'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { BicameralHeading, MicroLabel, Price, Button, ArchFrame, StatusPill } from '@/components/primitives';
import { getOrderById } from '@/lib/data/queries';
import { Order } from '@/lib/data/types';
import { CheckCircle2, ShieldCheck, ArrowRight, PackageCheck, Truck, Clock } from 'lucide-react';

export default function OrderConfirmedPage() {
  const params = useParams();
  const orderId = (params?.orderId as string) || '';

  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);

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
    <div className="min-h-screen bg-[var(--color-cream-100)] text-[var(--color-text-700)] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12 space-y-12">
        {/* Success Banner */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-8 sm:p-12 rounded-[var(--radius-card)] text-center max-w-3xl mx-auto space-y-4 shadow-md">
          <div className="w-16 h-16 rounded-full bg-[var(--color-ok-bg)] text-[var(--color-ok-fg)] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <MicroLabel className="text-[var(--color-gold-600)]">RESERVATION CONFIRMED</MicroLabel>
          <BicameralHeading italicPart="Order" romanPart="Confirmed" size="xl" align="center" />

          <p className="font-serif text-lg text-[var(--color-text-900)]">
            Order Reference: <span className="font-sans font-semibold text-[var(--color-gold-600)]">#{order?.id || orderId}</span>
          </p>

          <p className="font-sans text-xs sm:text-sm text-[var(--color-text-500)] max-w-lg mx-auto leading-relaxed">
            Your piece has been assigned in our vault. A formal certificate deed and armored transit tracking dispatch have been sent to{' '}
            <span className="font-semibold text-[var(--color-text-900)]">{order?.customerEmail}</span>.
          </p>
        </div>

        {/* Order Breakdown Grid */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Arch Frame Thumbnail of First Reserved Item (Left 5 Cols) */}
          <div className="lg:col-span-5 flex justify-center">
            {firstItem && (
              <ArchFrame ratio="portrait" className="w-full max-w-[320px] aspect-[4/5] shadow-xl">
                <ImageWithFallback src={firstItem.image} alt={firstItem.name} fill className="object-cover" />
              </ArchFrame>
            )}
          </div>

          {/* Reserved Items & Order Status Timeline (Right 7 Cols) */}
          <div className="lg:col-span-7 bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-6 sm:p-8 rounded-[var(--radius-card)] shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--color-cream-200)] pb-4">
              <MicroLabel className="text-[var(--color-gold-600)]">RESERVED HEIRLOOMS</MicroLabel>
              <StatusPill variant="ok" dot>
                {order?.status || 'confirmed'}
              </StatusPill>
            </div>

            {/* Line items list */}
            <div className="space-y-4">
              {order?.items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="flex justify-between items-center text-xs font-sans">
                  <div>
                    <h5 className="font-semibold text-[var(--color-text-900)]">{item.name}</h5>
                    <p className="text-[11px] text-[var(--color-gold-600)]">Qty: {item.qty}</p>
                  </div>
                  <Price amount={item.unitPrice * item.qty} size="sm" className="font-semibold" />
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-[var(--color-cream-200)] pt-4 flex justify-between items-center font-serif text-lg font-semibold text-[var(--color-text-900)]">
              <span>Total Paid</span>
              <Price amount={order?.total || 45000} size="lg" />
            </div>

            {/* Expected Delivery */}
            <div className="p-4 bg-[var(--color-cream-50)] border border-[var(--color-cream-200)] rounded text-xs font-sans text-[var(--color-text-700)] flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[var(--color-gold-600)]" />
                <span>Expected Armored Delivery:</span>
              </span>
              <span className="font-semibold text-[var(--color-text-900)]">30 April 2026</span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link href={`/account/orders/${order?.id || orderId}`} className="flex-1">
                <Button variant="primary" size="md" className="w-full justify-between" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  <span>Track order in account</span>
                </Button>
              </Link>

              <Link href="/collections" className="flex-1">
                <Button variant="secondary" size="md" className="w-full justify-center">
                  Continue browsing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
