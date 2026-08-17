'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { BicameralHeading, MicroLabel, Price, StatusPill, Button } from '@/components/primitives';
import { getOrderById, updateOrderStatus } from '@/lib/data/queries';
import { Order, OrderStatus } from '@/lib/data/types';
import { ArrowLeft, Printer, CheckCircle2, Save } from 'lucide-react';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || '';

  const [order, setOrder] = React.useState<Order | null>(null);
  const [status, setStatus] = React.useState<OrderStatus>('pending');
  const [updating, setUpdating] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    async function loadOrder() {
      if (id) {
        const found = await getOrderById(id);
        if (found) {
          setOrder(found);
          setStatus(found.status);
        }
      }
    }
    loadOrder();
  }, [id]);

  if (!order) return null;

  const handleUpdateStatus = async () => {
    setUpdating(true);
    const updated = await updateOrderStatus(order.id, status, `Status changed by Chief Curator to ${status}`);
    if (updated) setOrder(updated);
    setUpdating(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div className="space-y-8 select-none max-w-4xl">
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-xs font-sans font-semibold uppercase tracking-wider text-[var(--color-gold-600)] hover:text-[var(--color-gold-700)]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Order Register</span>
        </Link>
      </div>

      <div className="border-b border-[var(--color-cream-200)] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <MicroLabel className="text-[var(--color-gold-600)]">ORDER REGISTER #{order.id}</MicroLabel>
          <BicameralHeading italicPart="Order" romanPart={`#${order.id}`} size="xl" />
        </div>

        <Button variant="secondary" size="sm" onClick={() => window.print()} leftIcon={<Printer className="w-4 h-4" />}>
          PRINT INVOICE
        </Button>
      </div>

      {/* Status Update Card */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-6 rounded-[var(--radius-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <MicroLabel>MANAGE ORDER STATUS</MicroLabel>
          <p className="text-xs text-[var(--color-text-500)] mt-0.5">Update fulfillment status across armored transit dispatch</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="bg-[var(--color-cream-100)] border border-[var(--color-cream-300)] rounded px-3 py-2 text-xs font-semibold text-[var(--color-text-900)] outline-none"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <Button variant="primary" size="sm" onClick={handleUpdateStatus} disabled={updating}>
            {updating ? 'SAVING...' : 'UPDATE'}
          </Button>
        </div>
      </div>

      {/* Order Summary & Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-6 rounded-[var(--radius-card)] space-y-4">
          <MicroLabel className="text-[var(--color-gold-600)]">PATRON & SHIPPING</MicroLabel>
          <div className="text-xs font-sans space-y-1">
            <p className="font-semibold text-sm text-[var(--color-text-900)]">{order.customerName}</p>
            <p className="text-[var(--color-text-500)]">{order.customerEmail}</p>
            <p className="text-[var(--color-text-700)] pt-2">{order.shippingAddress.line1}</p>
            <p className="text-[var(--color-text-700)]">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
            </p>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-6 rounded-[var(--radius-card)] space-y-4">
          <MicroLabel className="text-[var(--color-gold-600)]">PAYMENT TOTAL</MicroLabel>
          <div className="space-y-2 text-xs font-sans">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-serif text-lg font-semibold text-[var(--color-text-900)] pt-2 border-t border-[var(--color-cream-200)]">
              <span>Total Paid</span>
              <Price amount={order.total} size="md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
