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
import { MessageSquare, Check, ArrowRight, RefreshCw, AlertCircle, MapPin, CreditCard, Package } from 'lucide-react';
import { getSiteConfig } from '@/lib/config/site-config';

export default function OrderConfirmedPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params?.orderId as string) || '';
  const siteConfig = getSiteConfig();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF5EC] text-[#765E55] flex flex-col font-sans">
        <Header />
        <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-20 text-center space-y-4">
          <div className="h-10 w-48 bg-[#F2E7D7] animate-pulse mx-auto rounded" />
          <div className="h-16 w-96 bg-[#F2E7D7] animate-pulse mx-auto rounded" />
        </main>
        <Footer />
      </div>
    );
  }

  // Handle Payment Failed State
  if (!order || order.status === 'cancelled') {
    return (
      <div className="min-h-screen bg-[#FAF5EC] text-[#765E55] flex flex-col font-sans select-none">
        <Header />
        <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-20 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#FBE9E7] border border-[#B3261E] flex items-center justify-center text-[#B3261E]">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl text-[#5B1018] font-normal">
              Order Reservation Unsuccessful
            </h1>
            <p className="text-sm text-[#765E55] max-w-md mx-auto">
              We could not verify payment authorization for order #{orderId}. Your delivery address and cart selection remain safely intact.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => router.push('/checkout')}
              className="h-12 px-8 bg-[#5B1018] text-[#FAF5EC] font-sans text-xs uppercase tracking-[0.2em] font-semibold flex items-center gap-2 rounded-[2px] shadow-sm cursor-pointer hover:bg-[#3B090D] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>RETRY PAYMENT</span>
            </button>
            <Link
              href="/collections"
              className="h-12 px-8 border border-[#B68A3A] text-[#5B1018] bg-[#FFFFFF] hover:bg-[#F2E7D7] font-sans text-xs uppercase tracking-[0.2em] font-semibold flex items-center justify-center rounded-[2px] transition-colors"
            >
              RETURN TO COLLECTION
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;

  const handleWhatsAppSendOrderDetails = () => {
    if (!order || !siteConfig.isWhatsAppEnabled) return;

    const itemsList = order.items
      .map((it, i) => `${i + 1}. ${it.name} (${it.variantLabel || 'Standard'}) x ${it.qty} = ₹${(it.unitPrice * it.qty).toLocaleString('en-IN')}`)
      .join('\n');

    const message = `*Adi Parva Order Confirmation*\n\n*Order ID:* #${order.id}\n*Customer:* ${order.customerName}\n*Phone:* ${order.shippingAddress?.phone || 'N/A'}\n*Total:* ₹${order.total.toLocaleString('en-IN')}\n*Payment Method:* ${order.paymentMethod}\n\n*Items Ordered:*\n${itemsList}\n\n*Delivery Address:*\n${order.shippingAddress?.line1}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.pincode}\n\nKindly send tracking updates.`;

    window.open(`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FAF5EC] text-[#765E55] flex flex-col font-sans selection:bg-[#5B1018] selection:text-[#FAF5EC]">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12 sm:py-16 space-y-12">
        {/* Order Placed Heading Block */}
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <KolamDivider />

          <span className="text-[11px] uppercase tracking-[0.3em] text-[#B68A3A] font-semibold">
            ORDER IDENTIFIER #{order.id}
          </span>

          <h1 className="font-serif text-[40px] sm:text-[56px] font-normal text-[#5B1018] leading-tight">
            Order <span className="italic text-[#B68A3A]">Confirmed</span>!
          </h1>

          <p className="text-[15px] sm:text-[16px] text-[#765E55] leading-relaxed">
            Thank you, <span className="text-[#5B1018] font-semibold">{order.customerName}</span>. Your heirloom jewellery pieces are being carefully prepared and packaged in tamper-evident presentation caskets for dispatch.
          </p>
        </div>

        {/* Hero Gopuram Arch Image of First Item */}
        {firstItem && (
          <div className="max-w-xs sm:max-w-sm mx-auto bg-[#FFFFFF] p-3 rounded-[6px] border border-[#E7D7C0] shadow-sm">
            <GopuramArch
              src={firstItem.image}
              alt={firstItem.name}
              aspect="portrait"
              sizes="380px"
              className="shadow-md border border-[#E7D7C0]"
            />
          </div>
        )}

        {/* WhatsApp Send Details Box */}
        {siteConfig.isWhatsAppEnabled && (
          <div className="max-w-xl mx-auto bg-[#FFFFFF] border border-[#25D366]/40 p-6 rounded-[6px] space-y-4 shadow-sm text-center">
            <div className="flex items-center justify-center gap-3 text-[#25D366]">
              <MessageSquare className="w-5 h-5" />
              <h3 className="font-serif text-xl font-normal text-[#5B1018]">Receive Updates on WhatsApp</h3>
            </div>
            <p className="text-xs text-[#765E55]">
              Get real-time bench dispatch photos, packing video verification, and courier tracking details via WhatsApp.
            </p>
            <button
              onClick={handleWhatsAppSendOrderDetails}
              className="px-6 py-3 rounded-[2px] font-sans text-xs uppercase tracking-[0.18em] bg-[#25D366] text-[#FFFFFF] font-semibold hover:bg-[#1EBE5D] transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm"
            >
              <MessageSquare className="w-4 h-4 fill-current text-white" />
              <span>SEND ORDER DETAILS ON WHATSAPP</span>
            </button>
          </div>
        )}

        {/* Itemized Order Deed & Summary Table */}
        <div className="max-w-3xl mx-auto bg-[#FFFFFF] border border-[#E7D7C0] p-6 sm:p-8 rounded-[6px] space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E7D7C0] pb-4">
            <h3 className="text-[12px] uppercase tracking-[0.25em] text-[#B68A3A] font-bold">
              ORDER ITEMS & SUMMARY
            </h3>
            <span className="text-xs text-emerald-800 font-semibold uppercase tracking-wider bg-emerald-50 border border-emerald-500/30 px-3 py-1 rounded">
              {order.paymentStatus === 'paid' ? '✓ PAID & CONFIRMED' : 'COD PLACED'}
            </span>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-4 text-sm border-b border-[#E7D7C0] pb-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 aspect-[3/4] bg-[#3B090D] rounded-[3px] overflow-hidden border border-[#B68A3A]/40 shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[10px] uppercase tracking-wider text-[#B68A3A] font-semibold">
                      CODE: {item.code || `AP-ITEM-${i + 1}`}
                    </div>
                    <h4 className="font-serif text-lg text-[#5B1018] font-normal leading-snug">{item.name}</h4>
                    <p className="text-xs text-[#765E55]">
                      Variant: {item.variantLabel || 'Standard'} | Qty: {item.qty}
                    </p>
                  </div>
                </div>
                <div className="font-sans text-base font-semibold text-[#5B1018] tabular-nums">
                  ₹{(item.unitPrice * item.qty).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Address & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-[#765E55]">
            <div className="space-y-1.5 p-3 bg-[#F2E7D7]/40 rounded border border-[#E7D7C0]">
              <div className="text-[10.5px] uppercase tracking-wider text-[#B68A3A] font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>DELIVERY DESTINATION</span>
              </div>
              <p className="text-[#5B1018] font-semibold">{order.customerName}</p>
              <p>{order.shippingAddress?.line1}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
              <p>Ph: {order.shippingAddress?.phone || order.customerPhone || 'N/A'}</p>
            </div>

            <div className="space-y-1.5 p-3 bg-[#F2E7D7]/40 rounded border border-[#E7D7C0]">
              <div className="text-[10.5px] uppercase tracking-wider text-[#B68A3A] font-bold flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>PAYMENT DETAILS</span>
              </div>
              <p className="text-[#5B1018] font-semibold">{order.paymentMethod}</p>
              {order.razorpayPaymentId && (
                <p className="font-mono text-[10px] text-[#765E55]">Transaction: {order.razorpayPaymentId}</p>
              )}
              <p className="text-emerald-700 font-medium">Status: {order.status.toUpperCase()}</p>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-[#E7D7C0] pt-4 flex justify-between items-center text-[#5B1018]">
            <span className="font-serif text-2xl font-normal">Total Paid Amount</span>
            <span className="font-serif text-[28px] font-semibold tabular-nums text-[#5B1018]">
              ₹{order.total.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Action Button: Continue Shopping */}
        <div className="text-center pt-4">
          <Link
            href="/collections"
            className="h-12 px-8 bg-[#5B1018] text-[#FAF5EC] hover:bg-[#3B090D] font-sans text-xs uppercase tracking-[0.2em] font-semibold inline-flex items-center gap-2 rounded-[2px] shadow-sm transition-all"
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
