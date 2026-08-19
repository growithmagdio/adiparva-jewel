'use client';

import * as React from 'react';
import Link from 'next/link';
import { GopuramRule } from '@/components/ui/GopuramRule';
import { ArrowRight, Check } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = React.useState('');
  const [subscribed, setSubscribed] = React.useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setSubscribed(true);
  };

  return (
    <footer className="bg-[var(--color-vault)] text-[var(--color-ivory)] select-none border-t border-[var(--color-hairline)]/20">
      {/* Signature Divider at top boundary */}
      <div className="pt-8">
        <GopuramRule size="lg" />
      </div>

      {/* Single Hairline Trust Strip */}
      <div className="border-y border-[var(--color-hairline)]/15 py-4 text-center font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
        <span>BIS Hallmarked 22kt Gold</span>
        <span className="mx-4 text-[var(--color-hairline)]/40">•</span>
        <span>Insured Express Transit</span>
        <span className="mx-4 text-[var(--color-hairline)]/40">•</span>
        <span>7-Day Inspection Window</span>
        <span className="mx-4 text-[var(--color-hairline)]/40">•</span>
        <span>Lifetime Atelier Polish</span>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 pt-16 pb-12 space-y-16">
        {/* 4 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Col 1: SHOP */}
          <div className="space-y-4 font-karla">
            <h4 className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
              SHOP
            </h4>
            <ul className="space-y-2.5 text-sm text-[var(--color-ivory)]/70">
              <li>
                <Link href="/collections/temple-jewellery" className="hover:text-[var(--color-gold-lit)] transition-colors">
                  Temple Jewellery
                </Link>
              </li>
              <li>
                <Link href="/collections/kundan" className="hover:text-[var(--color-gold-lit)] transition-colors">
                  Kundan & Polki
                </Link>
              </li>
              <li>
                <Link href="/collections/jadau" className="hover:text-[var(--color-gold-lit)] transition-colors">
                  Jadau Setting
                </Link>
              </li>
              <li>
                <Link href="/collections/meenakari" className="hover:text-[var(--color-gold-lit)] transition-colors">
                  Meenakari Enamels
                </Link>
              </li>
              <li>
                <Link href="/collections/bridal-sets" className="hover:text-[var(--color-gold-lit)] transition-colors">
                  Grand Bridal Sets
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: HOUSE */}
          <div className="space-y-4 font-karla">
            <h4 className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
              HOUSE
            </h4>
            <ul className="space-y-2.5 text-sm text-[var(--color-ivory)]/70">
              <li>
                <Link href="/heritage" className="hover:text-[var(--color-gold-lit)] transition-colors">
                  Provenance & History
                </Link>
              </li>
              <li>
                <Link href="/craft" className="hover:text-[var(--color-gold-lit)] transition-colors">
                  Craftsmanship Stages
                </Link>
              </li>
              <li>
                <Link href="/journal" className="hover:text-[var(--color-gold-lit)] transition-colors">
                  Editorial Journal
                </Link>
              </li>
              <li>
                <Link href="/care" className="hover:text-[var(--color-gold-lit)] transition-colors">
                  Jewellery Care & Certification
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--color-gold-lit)] transition-colors">
                  Atelier Locations
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: SUPPORT */}
          <div className="space-y-4 font-karla">
            <h4 className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
              SUPPORT
            </h4>
            <ul className="space-y-2.5 text-sm text-[var(--color-ivory)]/70">
              <li>
                <Link href="/account/orders" className="hover:text-[var(--color-gold-lit)] transition-colors">
                  Orders & Transit
                </Link>
              </li>
              <li>
                <Link href="/care" className="hover:text-[var(--color-gold-lit)] transition-colors">
                  Guarantee & Returns
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--color-gold-lit)] transition-colors">
                  WhatsApp Concierge
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[var(--color-gold-lit)] transition-colors text-[var(--color-gold)] font-medium">
                  Curator Admin Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: THE ROYAL CIRCLE (Newsletter) */}
          <div className="space-y-4 font-karla">
            <h4 className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
              THE ROYAL CIRCLE
            </h4>
            <p className="text-xs text-[var(--color-ivory)]/70 leading-relaxed">
              Private invitations to new masterpiece releases and heritage craft dispatches.
            </p>

            {subscribed ? (
              <p className="text-xs font-marcellus text-[var(--color-gold-lit)] uppercase tracking-[0.14em]">
                You are on the list.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="relative pt-2">
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-[var(--color-hairline)]/50 focus:border-[var(--color-gold)] text-sm text-[var(--color-ivory)] placeholder-[var(--color-ivory)]/40 pb-2 outline-none transition-colors pr-8 font-karla"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="absolute right-0 bottom-2 text-[var(--color-gold)] hover:text-[var(--color-gold-lit)] transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Monochrome Payment Marks & Footer Bottom */}
        <div className="pt-12 border-t border-[var(--color-hairline)]/15 flex flex-col md:flex-row items-center justify-between text-xs text-[var(--color-ivory)]/40 font-karla gap-4">
          <div className="flex items-center space-x-4">
            <span className="font-marcellus uppercase text-[10px] tracking-[0.14em]">UPI</span>
            <span>•</span>
            <span className="font-marcellus uppercase text-[10px] tracking-[0.14em]">VISA / MASTERCARD</span>
            <span>•</span>
            <span className="font-marcellus uppercase text-[10px] tracking-[0.14em]">NET BANKING</span>
            <span>•</span>
            <span className="font-marcellus uppercase text-[10px] tracking-[0.14em]">COD</span>
          </div>

          <div className="text-center md:text-right space-y-1">
            <p>GSTIN: 33AAAAA0000A1Z5 · Madurai Atelier & Headquarters</p>
            <p>© {new Date().getFullYear()} ADI PARVA HERITAGE JEWELLERY HOUSE.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
