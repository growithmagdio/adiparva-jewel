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
      <div className="min-h-screen bg-[#2E070B] text-[#FAF5EC] flex flex-col font-sans">
        <Header />
        <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-20 text-center space-y-4">
          <div className="h-10 w-48 bg-[#3B090D] animate-pulse mx-auto rounded" />
          <div className="h-16 w-96 bg-[#3B090D] animate-pulse mx-auto rounded" />
        </main>
        <Footer />
      </div>
    );
  }

  // Handle Payment Failed State
  if (!order || order.status === 'cancelled') {
    return (
      <div className="min-h-screen bg-[#2E070B] text-[#FAF5EC] flex flex-col font-sans select-none">
        <Header />
        <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-20 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#3B090D] border border-[#FF6B6B] flex items-center justify-center text-[#FF6B6B]">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl text-[#FAF5EC] font-normal">
              Order Reservation Unsuccessful
            </h1>
            <p className="text-sm text-[#FAF5EC]/85 max-w-md mx-auto">
              We could not verify payment authorization for order #{orderId}. Your delivery address and cart selection remain safely intact.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => router.push('/checkout')}
              className="h-12 px-8 bg-[#5B1018] text-[#FAF5EC] border border-[#76252C] hover:bg-[#76252C] hover:border-[#D7B56D] font-sans text-xs uppercase tracking-[0.2em] font-semibold flex items-center gap-2 rounded-[2px] shadow-md cursor-pointer transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>RETRY PAYMENT</span>
            </button>
            <Link
              href="/collections"
              className="h-12 px-8 border border-[#B68A3A] text-[#FAF5EC] bg-[#3B090D]/40 hover:bg-[#5B1018] hover:border-[#D7B56D] font-sans text-xs uppercase tracking-[0.2em] font-semibold flex items-center justify-center rounded-[2px] transition-all"
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
    <div className="min-h-screen bg-[#2E070B] text-[#FAF5EC] flex flex-col font-sans selection:bg-[#5B1018] selection:text-[#FAF5EC]">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12 sm:py-16 space-y-12">
        {/* Order Placed Heading Block */}
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <KolamDivider />

          <span className="text-[11px] uppercase tracking-[0.3em] text-[#D7B56D] font-semibold">
            ORDER IDENTIFIER #{order.id}
          </span>

          <h1 className="font-serif text-[40px] sm:text-[56px] font-normal text-[#FAF5EC] leading-tight">
            Order <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#F7DA96] via-[#E5B869] to-[#B68A3A]">Confirmed</span>!
          </h1>

          <p className="text-[15px] sm:text-[16px] text-[#FAF5EC]/90 leading-relaxed font-medium">
            Thank you, <span className="text-[#FAF5EC] font-bold">{order.customerName}</span>. Your heirloom jewellery pieces are being carefully prepared and packaged in tamper-evident presentation caskets for dispatch.
          </p>
        </div>

        {/* Hero Gopuram Arch Image of First Item */}
        {firstItem && (
          <div className="max-w-xs sm:max-w-sm mx-auto bg-[#3B090D] p-3 rounded-[4px] border border-[#B68A3A]/40 shadow-md">
            <GopuramArch
              src={firstItem.image}
              alt={firstItem.name}
              aspect="portrait"
              sizes="380px"
              className="shadow-md border border-[#B68A3A]/30"
            />
          </div>
        )}

        {/* WhatsApp Send Details Box */}
        {siteConfig.isWhatsAppEnabled && (
          <div className="max-w-xl mx-auto bg-[#3B090D] border border-[#25D366]/40 p-6 rounded-[4px] space-y-4 shadow-md text-center text-[#FAF5EC]">
            <div className="flex items-center justify-center gap-3 text-[#25D366]">
              <MessageSquare className="w-5 h-5" />
              <h3 className="font-serif text-xl font-normal text-[#FAF5EC]">Receive Updates on WhatsApp</h3>
            </div>
            <p className="text-xs text-[#FAF5EC]/85 font-medium">
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

        {/* Itemized Order Deed & Summary Table (Product Card Matching Style) */}
        <div className="max-w-3xl mx-auto bg-[#3B090D] border border-[#B68A3A]/40 p-6 sm:p-8 rounded-[4px] space-y-6 shadow-md text-[#FAF5EC]">
          <div className="flex items-center justify-between border-b border-[#B68A3A]/30 pb-4">
            <h3 className="text-[12px] uppercase tracking-[0.25em] text-[#D7B56D] font-bold">
              ORDER ITEMS & SUMMARY
            </h3>
            <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded">
              {order.paymentStatus === 'paid' ? '✓ PAID & CONFIRMED' : 'COD PLACED'}
            </span>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-4 text-sm border-b border-[#B68A3A]/20 pb-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 aspect-[3/4] bg-[#2E070B] rounded-[3px] overflow-hidden border border-[#B68A3A]/40 shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[10px] uppercase tracking-wider text-[#D7B56D] font-semibold">
                      CODE: {item.code || `AP-ITEM-${i + 1}`}
                    </div>
                    <h4 className="font-serif text-lg text-[#FAF5EC] font-normal leading-snug">{item.name}</h4>
                    <p className="text-xs text-[#FAF5EC]/80 font-medium">
                      Variant: {item.variantLabel || 'Standard'} | Qty: {item.qty}
                    </p>
                  </div>
                </div>
                <div className="font-sans text-base font-semibold text-[#FAF5EC] tabular-nums">
                  ₹{(item.unitPrice * item.qty).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Address & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-[#FAF5EC]">
            <div className="space-y-1.5 p-3 bg-[#2E070B] rounded-[4px] border border-[#B68A3A]/30">
              <div className="text-[10.5px] uppercase tracking-wider text-[#D7B56D] font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>DELIVERY DESTINATION</span>
              </div>
              <p className="text-[#FAF5EC] font-bold">{order.customerName}</p>
              <p className="text-[#FAF5EC]/85 font-medium">{order.shippingAddress?.line1}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
              <p className="text-[#FAF5EC]/85 font-medium">Ph: {order.shippingAddress?.phone || order.customerPhone || 'N/A'}</p>
            </div>

            <div className="space-y-1.5 p-3 bg-[#2E070B] rounded-[4px] border border-[#B68A3A]/30">
              <div className="text-[10.5px] uppercase tracking-wider text-[#D7B56D] font-bold flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>PAYMENT DETAILS</span>
              </div>
              <p className="text-[#FAF5EC] font-bold">{order.paymentMethod}</p>
              {order.razorpayPaymentId && (
                <p className="font-mono text-[10px] text-[#FAF5EC]/75 font-medium">Transaction: {order.razorpayPaymentId}</p>
              )}
              <p className="text-emerald-400 font-medium">Status: {order.status.toUpperCase()}</p>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-[#B68A3A]/30 pt-4 flex justify-between items-center text-[#FAF5EC]">
            <span className="font-serif text-2xl font-normal">Total Paid Amount</span>
            <span className="font-serif text-[28px] font-semibold tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-[#F7DA96] via-[#E5B869] to-[#B68A3A]">
              ₹{order.total.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Action Button: Continue Shopping */}
        <div className="text-center pt-4">
          <Link
            href="/collections"
            className="h-12 px-8 bg-[#5B1018] text-[#FAF5EC] border border-[#76252C] hover:bg-[#76252C] hover:border-[#D7B56D] font-sans text-xs uppercase tracking-[0.2em] font-semibold inline-flex items-center gap-2 rounded-[2px] shadow-lg transition-all"
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
