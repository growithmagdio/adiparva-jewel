'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { BicameralHeading, MicroLabel, Price, StatusPill, Button } from '@/components/primitives';
import { getOrderById } from '@/lib/data/queries';
import { Order } from '@/lib/data/types';
import { ArrowLeft, Truck, CheckCircle2, ShieldCheck, Printer, Clock } from 'lucide-react';

export default function AccountOrderDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || '';

  const [currentOrder, setCurrentOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      if (id) {
        const found = await getOrderById(id);
        setCurrentOrder(found);
      }
      setLoading(false);
    }
    loadOrder();
  }, [id]);

  if (loading) return null;

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-[var(--color-cream-100)] flex flex-col font-sans">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <h2 className="font-serif text-3xl text-[var(--color-text-900)]">Order Not Found</h2>
          <p className="text-xs text-[var(--color-text-500)] mt-2">Order #{id} could not be located in your account history.</p>
          <Link href="/account/orders" className="mt-6">
            <Button variant="primary">Return to Order History</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const timelineSteps = [
    { label: 'Confirmed', status: 'confirmed', note: 'Assigned in atelier vault' },
    { label: 'Shipped', status: 'shipped', note: 'Dispatched via armored transit' },
    { label: 'Delivered', status: 'delivered', note: 'Handed over with verification deed' },
  ];

  const currentStepIdx = currentOrder.status === 'delivered' ? 2 : currentOrder.status === 'shipped' ? 1 : 0;

  return (
    <div className="min-h-screen bg-[var(--color-cream-100)] text-[var(--color-text-700)] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-10 space-y-10">
        <div>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 text-xs font-sans font-semibold uppercase tracking-wider text-[var(--color-gold-600)] hover:text-[var(--color-gold-700)]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Order History</span>
          </Link>
        </div>

        {/* Header Title */}
        <div className="border-b border-[var(--color-cream-200)] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <MicroLabel className="text-[var(--color-gold-600)]">ORDER DEED #{currentOrder.id}</MicroLabel>
            <BicameralHeading italicPart="Order" romanPart={`#${currentOrder.id}`} size="xl" />
            <p className="text-xs font-sans text-[var(--color-text-500)] mt-1">Placed on {currentOrder.placedAt}</p>
          </div>

          <div className="flex items-center gap-3">
            <StatusPill
              variant={
                currentOrder.status === 'delivered'
                  ? 'ok'
                  : currentOrder.status === 'shipped'
                  ? 'info'
                  : currentOrder.status === 'confirmed'
                  ? 'warn'
                  : 'risk'
              }
              dot
            >
              {currentOrder.status}
            </StatusPill>

            <Button variant="secondary" size="sm" onClick={() => window.print()} leftIcon={<Printer className="w-4 h-4" />}>
              PRINT INVOICE
            </Button>
          </div>
        </div>

        {/* Status Timeline Widget */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-8 rounded-[var(--radius-card)] shadow-xs space-y-6">
          <MicroLabel className="text-[var(--color-gold-600)]">ARMORED TRANSIT TIMELINE</MicroLabel>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {timelineSteps.map((step, idx) => {
              const isCompleted = idx <= currentStepIdx;
              return (
                <div
                  key={step.status}
                  className={`p-4 rounded-[var(--radius-card)] border transition-colors ${
                    isCompleted
                      ? 'border-[var(--color-gold-600)] bg-[var(--color-cream-50)] text-[var(--color-text-900)]'
                      : 'border-[var(--color-cream-200)] text-[var(--color-text-400)] bg-[var(--color-cream-100)]/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-[var(--color-gold-600)]' : 'text-[var(--color-text-400)]'}`} />
                    <span className="font-serif font-medium text-lg">{step.label}</span>
                  </div>
                  <p className="text-xs font-sans text-[var(--color-text-500)]">{step.note}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Reserved Items (Left 7 Cols) */}
          <div className="lg:col-span-7 bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-6 rounded-[var(--radius-card)] shadow-xs space-y-4">
            <MicroLabel className="text-[var(--color-gold-600)]">RESERVED HEIRLOOM ITEMS</MicroLabel>

            <div className="divide-y divide-[var(--color-cream-200)]">
              {currentOrder.items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="py-4 flex gap-4 text-xs font-sans">
                  <div className="w-16 h-16 bg-[var(--color-cream-100)] rounded relative overflow-hidden shrink-0 border border-[var(--color-cream-300)]">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-serif text-sm font-medium text-[var(--color-text-900)]">{item.name}</h5>
                    <p className="text-[11px] text-[var(--color-text-500)] mt-0.5">Quantity: {item.qty}</p>
                  </div>
                  <Price amount={item.unitPrice * item.qty} size="sm" className="font-semibold" />
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Payment Summary (Right 5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-6 rounded-[var(--radius-card)] shadow-xs space-y-3 text-xs font-sans">
              <MicroLabel className="text-[var(--color-gold-600)]">SHIPPING ADDRESS</MicroLabel>
              <p className="font-semibold text-[var(--color-text-900)]">{currentOrder.customerName}</p>
              <p className="text-[var(--color-text-700)]">{currentOrder.shippingAddress.line1}</p>
              <p className="text-[var(--color-text-700)]">
                {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.pincode}
              </p>
              <p className="text-[var(--color-text-500)] pt-1">Phone: {currentOrder.shippingAddress.phone}</p>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-6 rounded-[var(--radius-card)] shadow-xs space-y-3 text-xs font-sans">
              <MicroLabel className="text-[var(--color-gold-600)]">PAYMENT BREAKDOWN</MicroLabel>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{currentOrder.subtotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (3% Rate)</span>
                <span>{currentOrder.gst.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between font-serif text-base font-semibold text-[var(--color-text-900)] border-t border-[var(--color-cream-300)] pt-2">
                <span>Total Amount ({currentOrder.paymentMethod})</span>
                <Price amount={currentOrder.total} size="md" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
