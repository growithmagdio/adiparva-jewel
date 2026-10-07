'use client';

import * as React from 'react';
import Link from 'next/link';
import { KolamDivider } from './kolam-divider';
import { Instagram, Facebook, Youtube, Phone, Mail, Clock, MessageSquare } from 'lucide-react';

import { getSiteConfig } from '@/lib/config/site-config';
import { LogoLockup } from '@/components/brand/logo-lockup';

export function Footer() {
  const siteConfig = getSiteConfig();

  return (
    <footer className="bg-[#F4EEDF] text-[#2A1E17] select-none border-t border-[#E2D6BC] pt-8">
      {/* Kolam Divider at Top */}
      <KolamDivider />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 pt-10 pb-16 space-y-12">
        {/* Brand Lockup */}
        <div className="flex justify-center md:justify-start pb-4 border-b border-[#E2D6BC]/60">
          <LogoLockup />
        </div>
        {/* 4 Columns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-[14px]">
          {/* Column 1: Shop */}
          <div className="space-y-4 font-jost">
            <h4 className="font-marcellus text-[12px] uppercase tracking-[0.35em] text-[#8A6A1F]">
              SHOP
            </h4>
            <ul className="space-y-2.5 text-[#6B5B4E]">
              <li>
                <Link href="/collections/temple-jewellery" className="hover:text-[#5C1A1B] transition-colors">
                  Necklaces (32)
                </Link>
              </li>
              <li>
                <Link href="/collections/haarams" className="hover:text-[#5C1A1B] transition-colors">
                  Harams (18)
                </Link>
              </li>
              <li>
                <Link href="/collections/jhumkas" className="hover:text-[#5C1A1B] transition-colors">
                  Earrings (29)
                </Link>
              </li>
              <li>
                <Link href="/collections/bangles-kada" className="hover:text-[#5C1A1B] transition-colors">
                  Bangles (24)
                </Link>
              </li>
              <li>
                <Link href="/collections/maang-tikka-nath" className="hover:text-[#5C1A1B] transition-colors">
                  Brooches & Nath (12)
                </Link>
              </li>
              <li>
                <Link href="/collections/kundan" className="hover:text-[#5C1A1B] transition-colors">
                  Antique Sets (15)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Company */}
          <div className="space-y-4 font-jost">
            <h4 className="font-marcellus text-[12px] uppercase tracking-[0.35em] text-[#8A6A1F]">
              COMPANY
            </h4>
            <ul className="space-y-2.5 text-[#6B5B4E]">
              <li>
                <Link href="/heritage" className="hover:text-[#5C1A1B] transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/journal" className="hover:text-[#5C1A1B] transition-colors">
                  Blog & Journal
                </Link>
              </li>
              <li>
                <Link href="/craft" className="hover:text-[#5C1A1B] transition-colors">
                  Careers & Artisans
                </Link>
              </li>
              <li>
                <Link href="/care" className="hover:text-[#5C1A1B] transition-colors">
                  Sustainability & Ethics
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="space-y-4 font-jost">
            <h4 className="font-marcellus text-[12px] uppercase tracking-[0.35em] text-[#8A6A1F]">
              SUPPORT
            </h4>
            <ul className="space-y-2.5 text-[#6B5B4E]">
              <li>
                <Link href="/contact" className="hover:text-[#5C1A1B] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/care" className="hover:text-[#5C1A1B] transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/care" className="hover:text-[#5C1A1B] transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-[#5C1A1B] transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#5C1A1B] transition-colors text-[#8A6A1F] font-medium">
                  Curator Admin Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-4 font-jost text-[#6B5B4E]">
            <h4 className="font-marcellus text-[12px] uppercase tracking-[0.35em] text-[#8A6A1F]">
              ATELIER CONTACT
            </h4>
            <div className="space-y-2.5">
              {siteConfig.displayPhone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#8A6A1F] shrink-0" />
                  <span>{siteConfig.displayPhone}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#8A6A1F] shrink-0" />
                <span>{siteConfig.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#8A6A1F] shrink-0" />
                <span>Mon–Sat 10AM–8PM IST</span>
              </div>
              {siteConfig.isWhatsAppEnabled && (
                <a
                  href={`https://wa.me/${siteConfig.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#8A6A1F] rounded-[2px] text-[#5C1A1B] bg-[#FBF7EE] hover:bg-[#5C1A1B] hover:text-[#FBF7EE] transition-all text-xs font-marcellus uppercase tracking-[0.2em] mt-2 font-medium"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Concierge</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Payment Marks + Social Icons + Copyright */}
        <div className="pt-10 border-t border-[#E2D6BC] flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#6B5B4E] font-jost">
          {/* Payment Marks (Quiet Outlined Badges) */}
          <div className="flex items-center flex-wrap gap-2.5">
            {['VISA', 'MASTERCARD', 'UPI', 'RUPAY', 'NET BANKING', 'COD'].map((method) => (
              <span
                key={method}
                className="px-2.5 py-1 border border-[#E2D6BC] bg-[#FBF7EE] rounded-[2px] font-marcellus text-[9px] uppercase tracking-[0.2em] text-[#2A1E17]"
              >
                {method}
              </span>
            ))}
          </div>

          {/* Social Icons in Gold Stroke */}
          <div className="flex items-center space-x-5 text-[#8A6A1F]">
            <a href="#" className="hover:text-[#5C1A1B] transition-colors" aria-label="Instagram">
              <Instagram className="w-4 h-4 stroke-[1.5]" />
            </a>
            <a href="#" className="hover:text-[#5C1A1B] transition-colors" aria-label="Facebook">
              <Facebook className="w-4 h-4 stroke-[1.5]" />
            </a>
            <a href="#" className="hover:text-[#5C1A1B] transition-colors" aria-label="YouTube">
              <Youtube className="w-4 h-4 stroke-[1.5]" />
            </a>
          </div>

          {/* Copyright Notice */}
          <div className="text-center md:text-right font-marcellus text-[11px] uppercase tracking-[0.18em] text-[#6B5B4E]">
            © 2026 ADI PARVA. HANDCRAFTED WITH HERITAGE.
          </div>
        </div>
      </div>
    </footer>
  );
}
