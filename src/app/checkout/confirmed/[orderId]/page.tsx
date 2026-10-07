'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { GopuramArch } from '@/components/storefront/gopuram-arch';
import { KolamDivider } from '@/components/storefront/kolam-divider';
import { getOrderById } from '@/lib/data/queries';
import { Order } from '@/lib/data/types';
import { MessageSquare, Check, ArrowRight, RefreshCw, AlertCircle, MapPin, CreditCard } from 'lucide-react';

import { getSiteConfig } from '@/lib/config/site-config';

export default function OrderConfirmedPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params?.orderId as string) || '';
  const siteConfig = getSiteConfig();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-vault-black)] text-[var(--color-ivory)] flex flex-col font-sans">
        <Header />
        <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-20 text-center space-y-4">
          <div className="h-10 w-48 bg-[var(--color-sanctum)] animate-pulse mx-auto rounded" />
          <div className="h-16 w-96 bg-[var(--color-sanctum)] animate-pulse mx-auto rounded" />
        </main>
        <Footer />
      </div>
    );
  }

  // Handle Payment Failed State
  if (!order || order.status === 'cancelled') {
    return (
      <div className="min-h-screen bg-[var(--color-vault-black)] text-[var(--color-ivory)] flex flex-col font-sans select-none">
        <Header />
        <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-20 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#B3261E]/20 border border-[#B3261E] flex items-center justify-center text-[#B3261E]">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl text-[var(--color-ivory)] font-light">
              Payment failed, try again
            </h1>
            <p className="font-jost text-sm text-[var(--color-sandal)]/80 max-w-md">
              We could not confirm payment authorization for order reservation #{orderId}. Your delivery address and item selection have been saved.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => router.push('/checkout')}
              className="h-12 px-8 bg-[var(--color-temple-gold)] text-[var(--color-vault-black)] font-marcellus text-xs uppercase tracking-[0.2em] font-semibold flex items-center gap-2 rounded-[2px] shadow-lg cursor-pointer hover:bg-[var(--color-gold-light)] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>RETRY PAYMENT</span>
            </button>
            <Link
              href="/collections"
              className="h-12 px-8 border border-[var(--color-temple-gold)]/40 text-[var(--color-sandal)] font-marcellus text-xs uppercase tracking-[0.2em] flex items-center justify-center rounded-[2px]"
            >
              RETURN TO SHOP
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const firstItem = order.items[0];

  const handleWhatsAppSendOrderDetails = () => {
    if (!order || !siteConfig.isWhatsAppEnabled) return;
    const itemsList = order.items
      .map((it) => `• ${it.name} (${it.code || 'AP-JEWEL'}) x${it.qty} - ₹${(it.unitPrice * it.qty).toLocaleString('en-IN')}`)
      .join('\n');

    const message = `*Adi Parva Order Details Deed*\n\n*Order ID:* #${order.id}\n*Customer:* ${order.customerName}\n*Phone:* ${order.shippingAddress?.phone || 'N/A'}\n*Total Paid:* ₹${order.total.toLocaleString('en-IN')}\n*Payment Method:* ${order.paymentMethod}\n\n*Items Reserved:*\n${itemsList}\n\n*Delivery Address:*\n${order.shippingAddress?.line1}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.pincode}\n\nKindly send bench dispatch photography and tracking updates.`;

    window.open(`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[var(--color-vault-black)] text-[var(--color-ivory)] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12 sm:py-16 space-y-12 sm:space-y-16">
        {/* Order Placed Heading Block */}
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <KolamDivider />

          <span className="font-marcellus text-[11px] uppercase tracking-[0.35em] text-[var(--color-temple-gold)] font-medium">
            RESERVATION DEED #{order.id}
          </span>

          <h1 className="font-serif text-[40px] sm:text-[60px] font-light text-[var(--color-ivory)] leading-none">
            Order <em className="italic text-gold-gradient font-normal">Confirmed</em>.
          </h1>

          <p className="font-jost text-[15px] sm:text-[16px] text-[var(--color-sandal)]/80 leading-relaxed font-light">
            Your heirlooms have been registered with the atelier vault. A formal certificate deed and dispatch tracking link have been issued for{' '}
            <span className="text-[var(--color-ivory)] font-normal">{order.customerEmail || order.customerName}</span>.
          </p>
        </div>

        {/* Hero Gopuram Arch Image of First Item */}
        {firstItem && (
          <div className="max-w-xs sm:max-w-md mx-auto">
            <GopuramArch
              src={firstItem.image}
              alt={firstItem.name}
              aspect="portrait"
              sizes="420px"
              className="shadow-2xl border border-[var(--color-temple-gold)]/30"
            />
          </div>
        )}

        {/* WhatsApp Send Details Box */}
        {siteConfig.isWhatsAppEnabled && (
          <div className="max-w-xl mx-auto bg-[var(--color-sanctum)] border border-[#25D366]/40 p-6 rounded-[4px] space-y-4 shadow-xl text-center">
            <div className="flex items-center justify-center gap-3">
              <MessageSquare className="w-5 h-5 text-[#25D366]" />
              <h3 className="font-serif text-lg font-light text-[var(--color-ivory)]">Send Order Details on WhatsApp</h3>
            </div>
            <p className="font-jost text-xs text-[var(--color-sandal)]/80 font-light">
              Click below to instantly send your complete order confirmation deed to the atelier on WhatsApp.
            </p>
            <button
              onClick={handleWhatsAppSendOrderDetails}
              className="px-6 py-3 rounded-[2px] font-marcellus text-xs uppercase tracking-[0.2em] bg-[#25D366] text-black font-semibold hover:bg-[#1EBE5D] transition-all cursor-pointer inline-flex items-center gap-2 shadow-lg"
            >
              <MessageSquare className="w-4 h-4 fill-current text-black" />
              <span>SEND ORDER DETAILS ON WHATSAPP</span>
            </button>
          </div>
        )}

        {/* Itemized Order Deed & Summary Table */}
        <div className="max-w-3xl mx-auto bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 p-6 sm:p-8 rounded-[4px] space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-[var(--color-temple-gold)]/20 pb-4">
            <h3 className="font-marcellus text-[12px] uppercase tracking-[0.3em] text-[var(--color-temple-gold)]">
              RESERVATION SUMMARY
            </h3>
            <span className="font-marcellus text-xs text-emerald-400 uppercase tracking-wider border border-emerald-500/30 px-2.5 py-0.5 rounded-[2px]">
              {order.paymentStatus === 'paid' ? 'PAID & CONFIRMED' : 'COD PENDING'}
            </span>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-4 font-jost text-sm border-b border-[var(--color-temple-gold)]/10 pb-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-14 aspect-[3/4] bg-[var(--color-vault-black)] rounded-[2px] overflow-hidden border border-[var(--color-temple-gold)]/30 shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div>
                    <div className="font-marcellus text-[9px] uppercase tracking-wider text-[var(--color-temple-gold)] font-medium">
                      CODE: {item.code || `AP-ITEM-${i + 1}`}
                    </div>
                    <h4 className="font-serif text-lg text-[var(--color-ivory)] font-light">{item.name}</h4>
                    <p className="text-xs text-[var(--color-sandal)]/70">
                      Variant: {item.variantLabel || 'Standard'} | Qty: {item.qty}
                    </p>
                  </div>
                </div>
                <div className="font-sans text-base text-[var(--color-ivory)] tabular-nums">
                  ₹{(item.unitPrice * item.qty).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Address & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 font-jost text-xs text-[var(--color-sandal)]">
            <div className="space-y-1">
              <div className="font-marcellus text-[10px] uppercase tracking-wider text-[var(--color-temple-gold)] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>DELIVERY DESTINATION</span>
              </div>
              <p className="text-[var(--color-ivory)] font-medium">{order.customerName}</p>
              <p>{order.shippingAddress?.line1}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
              <p>Ph: {order.shippingAddress?.phone || order.customerPhone || 'N/A'}</p>
            </div>

            <div className="space-y-1">
              <div className="font-marcellus text-[10px] uppercase tracking-wider text-[var(--color-temple-gold)] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>PAYMENT METHOD</span>
              </div>
              <p className="text-[var(--color-ivory)] font-medium">{order.paymentMethod}</p>
              {order.razorpayPaymentId && (
                <p className="font-mono text-[10px] text-[var(--color-sandal)]/60">Payment ID: {order.razorpayPaymentId}</p>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-[var(--color-temple-gold)]/20 pt-4 flex justify-between items-center font-serif text-2xl text-[var(--color-ivory)]">
            <span>Total Deed Amount</span>
            <span className="font-sans font-normal tabular-nums text-[var(--color-gold-light)]">
              ₹{order.total.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Action Button: Continue Shopping */}
        <div className="text-center">
          <Link
            href="/collections"
            className="h-12 px-8 border border-[var(--color-temple-gold)] text-[var(--color-temple-gold)] font-marcellus text-[11px] uppercase tracking-[0.25em] inline-flex items-center gap-2 rounded-[2px] hover:bg-[var(--color-burgundy-silk)] hover:text-[var(--color-ivory)] transition-all"
          >
            <span>CONTINUE SHOPPING</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
