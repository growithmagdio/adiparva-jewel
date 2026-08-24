'use client';

import * as React from 'react';
import Link from 'next/link';
import { KolamDivider } from './kolam-divider';
import { Instagram, Facebook, Youtube, Phone, Mail, Clock, MessageSquare } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0C0809] text-[var(--color-ivory)] select-none border-t border-[var(--color-temple-gold)]/20 pt-8">
      {/* Kolam Divider at Top */}
      <KolamDivider />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 pt-10 pb-16 space-y-16">
        {/* 4 Columns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-[14px]">
          {/* Column 1: Shop */}
          <div className="space-y-4 font-jost">
            <h4 className="font-marcellus text-[12px] uppercase tracking-[0.35em] text-[var(--color-temple-gold)]">
              SHOP
            </h4>
            <ul className="space-y-2.5 text-[var(--color-sandal)]/80">
              <li>
                <Link href="/collections/temple-jewellery" className="hover:text-[var(--color-gold-light)] transition-colors">
                  Necklaces (32)
                </Link>
              </li>
              <li>
                <Link href="/collections/haarams" className="hover:text-[var(--color-gold-light)] transition-colors">
                  Harams (18)
                </Link>
              </li>
              <li>
                <Link href="/collections/jhumkas" className="hover:text-[var(--color-gold-light)] transition-colors">
                  Earrings (29)
                </Link>
              </li>
              <li>
                <Link href="/collections/bangles-kada" className="hover:text-[var(--color-gold-light)] transition-colors">
                  Bangles (24)
                </Link>
              </li>
              <li>
                <Link href="/collections/maang-tikka-nath" className="hover:text-[var(--color-gold-light)] transition-colors">
                  Brooches & Nath (12)
                </Link>
              </li>
              <li>
                <Link href="/collections/kundan" className="hover:text-[var(--color-gold-light)] transition-colors">
                  Antique Sets (15)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Company */}
          <div className="space-y-4 font-jost">
            <h4 className="font-marcellus text-[12px] uppercase tracking-[0.35em] text-[var(--color-temple-gold)]">
              COMPANY
            </h4>
            <ul className="space-y-2.5 text-[var(--color-sandal)]/80">
              <li>
                <Link href="/heritage" className="hover:text-[var(--color-gold-light)] transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/journal" className="hover:text-[var(--color-gold-light)] transition-colors">
                  Blog & Journal
                </Link>
              </li>
              <li>
                <Link href="/craft" className="hover:text-[var(--color-gold-light)] transition-colors">
                  Careers & Artisans
                </Link>
              </li>
              <li>
                <Link href="/care" className="hover:text-[var(--color-gold-light)] transition-colors">
                  Sustainability & Ethics
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="space-y-4 font-jost">
            <h4 className="font-marcellus text-[12px] uppercase tracking-[0.35em] text-[var(--color-temple-gold)]">
              SUPPORT
            </h4>
            <ul className="space-y-2.5 text-[var(--color-sandal)]/80">
              <li>
                <Link href="/contact" className="hover:text-[var(--color-gold-light)] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/care" className="hover:text-[var(--color-gold-light)] transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/care" className="hover:text-[var(--color-gold-light)] transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-[var(--color-gold-light)] transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[var(--color-gold-light)] transition-colors text-[var(--color-temple-gold)] font-medium">
                  Curator Admin Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-4 font-jost text-[var(--color-sandal)]/80">
            <h4 className="font-marcellus text-[12px] uppercase tracking-[0.35em] text-[var(--color-temple-gold)]">
              ATELIER CONTACT
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[var(--color-temple-gold)] shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[var(--color-temple-gold)] shrink-0" />
                <span>support@adiparva.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[var(--color-temple-gold)] shrink-0" />
                <span>Mon–Sat 10AM–8PM IST</span>
              </div>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 border border-[var(--color-temple-gold)]/40 rounded-[2px] text-[var(--color-temple-gold)] hover:bg-[var(--color-burgundy-silk)] hover:text-[var(--color-ivory)] transition-all text-xs font-marcellus uppercase tracking-[0.2em] mt-2"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Concierge</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Payment Marks + Social Icons + Copyright */}
        <div className="pt-10 border-t border-[var(--color-temple-gold)]/20 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[var(--color-sandal)]/60 font-jost">
          {/* Payment Marks (Quiet Outlined Badges) */}
          <div className="flex items-center flex-wrap gap-2.5">
            {['VISA', 'MASTERCARD', 'UPI', 'RUPAY', 'NET BANKING', 'COD'].map((method) => (
              <span
                key={method}
                className="px-2.5 py-1 border border-[var(--color-temple-gold)]/30 rounded-[2px] font-marcellus text-[9px] uppercase tracking-[0.2em] text-[var(--color-sandal)]/80"
              >
                {method}
              </span>
            ))}
          </div>

          {/* Social Icons in Gold Stroke */}
          <div className="flex items-center space-x-5 text-[var(--color-temple-gold)]">
            <a href="#" className="hover:text-[var(--color-gold-light)] transition-colors" aria-label="Instagram">
              <Instagram className="w-4 h-4 stroke-[1.5]" />
            </a>
            <a href="#" className="hover:text-[var(--color-gold-light)] transition-colors" aria-label="Facebook">
              <Facebook className="w-4 h-4 stroke-[1.5]" />
            </a>
            <a href="#" className="hover:text-[var(--color-gold-light)] transition-colors" aria-label="YouTube">
              <Youtube className="w-4 h-4 stroke-[1.5]" />
            </a>
          </div>

          {/* Copyright Notice */}
          <div className="text-center md:text-right font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-sandal)]/70">
            © 2026 ADI PARVA. HANDCRAFTED WITH HERITAGE.
          </div>
        </div>
      </div>
    </footer>
  );
}
