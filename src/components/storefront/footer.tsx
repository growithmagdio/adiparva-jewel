'use client';

import * as React from 'react';
import Link from 'next/link';
import { KolamDivider } from './kolam-divider';
import { Instagram, Facebook, Youtube, Phone, Mail, Clock, MessageSquare, ArrowRight } from 'lucide-react';
import { getSiteConfig } from '@/lib/config/site-config';
import { LogoLockup } from '@/components/brand/logo-lockup';

export function Footer() {
  const siteConfig = getSiteConfig();

  return (
    <footer className="bg-[#F2E7D7] text-[#765E55] select-none border-t border-[#E7D7C0] pt-6">
      {/* Kolam Divider at Top */}
      <KolamDivider />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 pt-6 pb-16 space-y-12">
        {/* Brand Lockup & Description */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 pb-8 border-b border-[#E7D7C0]">
          <div className="space-y-3 text-center md:text-left max-w-lg">
            <LogoLockup size="lg" />
            <p className="text-[14px] text-[#765E55] leading-relaxed font-sans pt-2">
              Living archive of handcrafted South Indian temple jewellery, pure gold repoussé nakashi, and heirloom bridal parures for timeless celebrations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/collections"
              className="h-11 px-6 bg-[#5B1018] text-[#FAF5EC] hover:bg-[#3B090D] font-sans text-xs uppercase tracking-[0.18em] font-semibold flex items-center gap-2 rounded-[2px] transition-colors shadow-xs"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 Columns Navigation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-[14px]">
          {/* Column 1: Shop */}
          <div className="space-y-4 font-sans">
            <h4 className="text-[12px] uppercase tracking-[0.25em] text-[#5B1018] font-semibold">
              COLLECTIONS
            </h4>
            <ul className="space-y-2.5 text-[#765E55]">
              <li>
                <Link href="/collections/temple-jewellery" className="hover:text-[#5B1018] transition-colors">
                  Temple Necklaces
                </Link>
              </li>
              <li>
                <Link href="/collections/jhumkas" className="hover:text-[#5B1018] transition-colors">
                  Jhumkas & Earrings
                </Link>
              </li>
              <li>
                <Link href="/collections/bangles-kada" className="hover:text-[#5B1018] transition-colors">
                  Bangles & Kada
                </Link>
              </li>
              <li>
                <Link href="/collections/oddiyanam" className="hover:text-[#5B1018] transition-colors">
                  Vaddanams (Hip Belts)
                </Link>
              </li>
              <li>
                <Link href="/collections/bridal-sets" className="hover:text-[#5B1018] transition-colors">
                  Bridal Parures
                </Link>
              </li>
              <li>
                <Link href="/collections/maang-tikka-nath" className="hover:text-[#5B1018] transition-colors">
                  Maang Tikka & Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: The House */}
          <div className="space-y-4 font-sans">
            <h4 className="text-[12px] uppercase tracking-[0.25em] text-[#5B1018] font-semibold">
              THE HOUSE
            </h4>
            <ul className="space-y-2.5 text-[#765E55]">
              <li>
                <Link href="/heritage" className="hover:text-[#5B1018] transition-colors">
                  Our Story & Heritage
                </Link>
              </li>
              <li>
                <Link href="/craft" className="hover:text-[#5B1018] transition-colors">
                  The Making Process
                </Link>
              </li>
              <li>
                <Link href="/care" className="hover:text-[#5B1018] transition-colors">
                  Jewellery Care & Certification
                </Link>
              </li>
              <li>
                <Link href="/journal" className="hover:text-[#5B1018] transition-colors">
                  Journal & Editorial
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div className="space-y-4 font-sans">
            <h4 className="text-[12px] uppercase tracking-[0.25em] text-[#5B1018] font-semibold">
              CUSTOMER CARE
            </h4>
            <ul className="space-y-2.5 text-[#765E55]">
              <li>
                <Link href="/contact" className="hover:text-[#5B1018] transition-colors">
                  Contact & Concierge
                </Link>
              </li>
              <li>
                <Link href="/care" className="hover:text-[#5B1018] transition-colors">
                  Shipping & Insurance Policy
                </Link>
              </li>
              <li>
                <Link href="/care" className="hover:text-[#5B1018] transition-colors">
                  7-Day Inspection & Returns
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-[#5B1018] transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#5B1018] transition-colors text-[#B68A3A] font-semibold">
                  Curator Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Concierge */}
          <div className="space-y-4 font-sans text-[#765E55]">
            <h4 className="text-[12px] uppercase tracking-[0.25em] text-[#5B1018] font-semibold">
              ATELIER CONCIERGE
            </h4>
            <div className="space-y-2.5">
              {siteConfig.displayPhone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#B68A3A] shrink-0" />
                  <span>{siteConfig.displayPhone}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#B68A3A] shrink-0" />
                <span>{siteConfig.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#B68A3A] shrink-0" />
                <span>Mon–Sat 10AM–8PM IST</span>
              </div>
              {siteConfig.isWhatsAppEnabled && (
                <a
                  href={`https://wa.me/${siteConfig.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 border border-[#B68A3A] rounded-[2px] text-[#5B1018] bg-[#FAF5EC] hover:bg-[#5B1018] hover:text-[#FAF5EC] transition-all text-xs font-sans uppercase tracking-[0.16em] mt-2 font-semibold shadow-2xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Concierge</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Payment Marks + Social Icons + Copyright */}
        <div className="pt-8 border-t border-[#E7D7C0] flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#765E55] font-sans">
          {/* Payment Marks (Quiet Outlined Badges) */}
          <div className="flex items-center flex-wrap gap-2">
            {['UPI', 'VISA', 'MASTERCARD', 'NET BANKING', 'RUPAY', 'COD'].map((method) => (
              <span
                key={method}
                className="px-2.5 py-1 border border-[#E7D7C0] bg-[#FAF5EC] rounded-[2px] font-sans text-[10px] uppercase tracking-[0.14em] text-[#5B1018] font-medium"
              >
                {method}
              </span>
            ))}
          </div>

          {/* Social Icons in Antique Gold */}
          <div className="flex items-center space-x-5 text-[#B68A3A]">
            <a href="#" className="hover:text-[#5B1018] transition-colors" aria-label="Instagram">
              <Instagram className="w-4 h-4 stroke-[1.8]" />
            </a>
            <a href="#" className="hover:text-[#5B1018] transition-colors" aria-label="Facebook">
              <Facebook className="w-4 h-4 stroke-[1.8]" />
            </a>
            <a href="#" className="hover:text-[#5B1018] transition-colors" aria-label="YouTube">
              <Youtube className="w-4 h-4 stroke-[1.8]" />
            </a>
          </div>

          {/* Copyright Notice */}
          <div className="text-center md:text-right font-sans text-[11px] uppercase tracking-[0.15em] text-[#765E55]">
            © 2026 ADI PARVA — THE TEMPLE OF TRADITION. ALL RIGHTS RESERVED.
          </div>
        </div>
      </div>
    </footer>
  );
}
