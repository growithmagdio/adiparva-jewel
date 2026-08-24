'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { KolamDivider } from '@/components/storefront/kolam-divider';
import { ShieldCheck, Sparkles, RefreshCw, Award, ArrowRight } from 'lucide-react';

export default function CarePage() {
  return (
    <div className="min-h-screen bg-[var(--color-vault-black)] text-[var(--color-ivory)] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12 space-y-16">
        {/* Header */}
        <div className="border-b border-[var(--color-temple-gold)]/20 pb-8 space-y-3">
          <div className="font-marcellus text-[11px] uppercase tracking-[0.35em] text-[var(--color-temple-gold)]">
            CUSTODIAL CARE
          </div>
          <h1 className="font-serif text-[36px] sm:text-[52px] font-light text-[var(--color-ivory)]">
            Jewellery Care <em className="italic text-gold-gradient font-normal">& Certification</em>
          </h1>
          <p className="font-jost text-[16px] text-[var(--color-sandal)]/80 max-w-2xl leading-relaxed font-light">
            Guidelines for preserving 22K temple gold, Kundan stone settings, and organic enamelwork across generations.
          </p>
        </div>

        {/* 4 Care Guidelines Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 p-8 rounded-[4px] space-y-3 shadow-lg">
            <ShieldCheck className="w-6 h-6 text-[var(--color-temple-gold)] stroke-[1.5]" />
            <h3 className="font-serif text-2xl font-light text-[var(--color-ivory)]">22K Temple Gold Maintenance</h3>
            <p className="font-jost text-sm text-[var(--color-sandal)]/80 leading-relaxed font-light">
              Clean gently using a soft lint-free flannel cloth. Avoid exposure to perfumes, hairsprays, or chemical solvents which may alter the organic antique repoussé patina.
            </p>
          </div>

          <div className="bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 p-8 rounded-[4px] space-y-3 shadow-lg">
            <Sparkles className="w-6 h-6 text-[var(--color-temple-gold)] stroke-[1.5]" />
            <h3 className="font-serif text-2xl font-light text-[var(--color-ivory)]">Kundan & Polki Protection</h3>
            <p className="font-jost text-sm text-[var(--color-sandal)]/80 leading-relaxed font-light">
              Kundan foil settings must be kept dry and away from humidity. Never submerge in ultrasonic cleaners or soap water as moisture can tarnish pure gold foil pockets.
            </p>
          </div>

          <div className="bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 p-8 rounded-[4px] space-y-3 shadow-lg">
            <RefreshCw className="w-6 h-6 text-[var(--color-temple-gold)] stroke-[1.5]" />
            <h3 className="font-serif text-2xl font-light text-[var(--color-ivory)]">Storage & Vault Packaging</h3>
            <p className="font-jost text-sm text-[var(--color-sandal)]/80 leading-relaxed font-light">
              Store each heirloom individually in the velvet-lined mahogany box provided. Keep pieces separate to prevent gemstone scratches.
            </p>
          </div>

          <div className="bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 p-8 rounded-[4px] space-y-3 shadow-lg">
            <Award className="w-6 h-6 text-[var(--color-temple-gold)] stroke-[1.5]" />
            <h3 className="font-serif text-2xl font-light text-[var(--color-ivory)]">Lifetime Polish & Inspection</h3>
            <p className="font-jost text-sm text-[var(--color-sandal)]/80 leading-relaxed font-light">
              Adi Parva offers complimentary annual inspection, re-stringing, and antique refinishing at any of our flagship ateliers.
            </p>
          </div>
        </div>

        <KolamDivider />

        {/* Contact Concierge Section */}
        <div className="text-center space-y-4 py-6">
          <h3 className="font-serif text-2xl font-light text-[var(--color-ivory)]">Need Bench Maintenance?</h3>
          <p className="font-jost text-sm text-[var(--color-sandal)]/80 font-light">Speak with our master sthapati curator to arrange atelier restoration.</p>
          <Link
            href="/contact"
            className="h-10 px-6 border border-[var(--color-temple-gold)] text-[var(--color-temple-gold)] font-marcellus text-[11px] uppercase tracking-[0.2em] inline-flex items-center gap-2 rounded-[2px] hover:bg-[var(--color-burgundy-silk)] hover:text-[var(--color-ivory)] transition-colors"
          >
            <span>CONTACT ATELIER CONCIERGE</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
