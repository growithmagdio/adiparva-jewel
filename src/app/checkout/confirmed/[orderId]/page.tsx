'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { GopuramArch } from '@/components/storefront/gopuram-arch';
import { KolamDivider } from '@/components/storefront/kolam-divider';
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
    <div className="min-h-screen bg-[var(--color-vault-black)] text-[var(--color-ivory)] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-16 space-y-16">
        {/* Order Placed Heading Block */}
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <KolamDivider />

          <span className="font-marcellus text-[11px] uppercase tracking-[0.35em] text-[var(--color-temple-gold)]">
            RESERVATION DEED #{order?.id || orderId}
          </span>

          <h1 className="font-serif text-[44px] sm:text-[64px] font-light text-[var(--color-ivory)] leading-none">
            Order <em className="italic text-gold-gradient font-normal">Confirmed</em>.
          </h1>

          <p className="font-jost text-[16px] text-[var(--color-sandal)]/80 leading-relaxed font-light">
            Your heirlooms have been registered with the atelier vault. A formal certificate deed and dispatch tracking link have been sent to{' '}
            <span className="text-[var(--color-ivory)] font-normal">{order?.customerEmail || 'your email'}</span>.
          </p>
        </div>

        {/* Hero Arch Image of First Item */}
        {firstItem && (
          <div className="max-w-md mx-auto">
            <GopuramArch
              src={firstItem.image}
              alt={firstItem.name}
              aspect="portrait"
              sizes="420px"
              className="shadow-2xl"
            />
          </div>
        )}

        {/* WhatsApp Opt-in Box */}
        <div className="max-w-xl mx-auto bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/30 p-6 rounded-[4px] space-y-4 shadow-xl text-center">
          <div className="flex items-center justify-center gap-3">
            <MessageSquare className="w-5 h-5 text-[#25D366]" />
            <h3 className="font-serif text-lg font-light text-[var(--color-ivory)]">Atelier Dispatch Updates via WhatsApp</h3>
          </div>
          <p className="font-jost text-xs text-[var(--color-sandal)]/80 font-light">
            Receive real-time bench photography and dispatch tracking directly on WhatsApp.
          </p>
          <button
            onClick={() => setWhatsappOpted(!whatsappOpted)}
            className={`px-6 py-2.5 rounded-[2px] font-marcellus text-xs uppercase tracking-[0.2em] border transition-all cursor-pointer inline-flex items-center gap-2 ${
              whatsappOpted
                ? 'bg-[#25D366]/20 border-[#25D366] text-[#25D366]'
                : 'border-[var(--color-temple-gold)] text-[var(--color-temple-gold)] hover:bg-[var(--color-burgundy-silk)] hover:text-[var(--color-ivory)]'
            }`}
          >
            {whatsappOpted ? (
              <>
                <Check className="w-4 h-4" />
                <span>OPTED IN FOR DISPATCH UPDATES</span>
              </>
            ) : (
              <span>ENABLE WHATSAPP NOTIFICATIONS</span>
            )}
          </button>
        </div>

        {/* Summary Table */}
        {order && (
          <div className="max-w-3xl mx-auto bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 p-8 rounded-[4px] space-y-6 shadow-xl">
            <h3 className="font-marcellus text-[12px] uppercase tracking-[0.3em] text-[var(--color-temple-gold)] border-b border-[var(--color-temple-gold)]/20 pb-4">
              RESERVATION SUMMARY
            </h3>

            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 font-jost text-sm border-b border-[var(--color-temple-gold)]/10 pb-4">
                  <div>
                    <h4 className="font-serif text-lg text-[var(--color-ivory)] font-light">{item.name}</h4>
                    <p className="text-xs text-[var(--color-sandal)]/70">Qty: {item.qty}</p>
                  </div>
                  <div className="font-sans text-base text-[var(--color-ivory)] tabular-nums">
                    ₹{(item.unitPrice * item.qty).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 font-serif text-2xl text-[var(--color-ivory)]">
              <span>Total Deed Amount</span>
              <span className="font-sans font-normal tabular-nums">₹{order.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="text-center">
          <Link
            href="/collections"
            className="h-12 px-8 border border-[var(--color-temple-gold)] text-[var(--color-temple-gold)] font-marcellus text-[11px] uppercase tracking-[0.25em] inline-flex items-center gap-2 rounded-[2px] hover:bg-[var(--color-burgundy-silk)] hover:text-[var(--color-ivory)] transition-colors"
          >
            <span>EXPLORE MORE HEIRLOOMS</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
