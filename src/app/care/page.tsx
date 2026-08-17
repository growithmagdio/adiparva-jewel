'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { BicameralHeading, MicroLabel, Button } from '@/components/primitives';
import { ShieldCheck, Sparkles, RefreshCw, Award, ArrowRight } from 'lucide-react';

export default function CarePage() {
  return (
    <div className="min-h-screen bg-[var(--color-cream-100)] text-[var(--color-text-700)] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-10 space-y-16">
        {/* Header */}
        <div className="border-b border-[var(--color-cream-200)] pb-8 space-y-3">
          <MicroLabel className="text-[var(--color-gold-600)]">CUSTODIAL CARE</MicroLabel>
          <BicameralHeading italicPart="Jewellery Care" romanPart="& Certification" size="xl" />
          <p className="font-sans text-sm text-[var(--color-text-500)] max-w-2xl leading-relaxed">
            Guidelines for preserving 22K temple gold, Kundan stone settings, and organic enamelwork across generations.
          </p>
        </div>

        {/* 4 Care Guidelines Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-8 rounded-[var(--radius-card)] space-y-3">
            <ShieldCheck className="w-6 h-6 text-[var(--color-gold-600)]" />
            <h3 className="font-serif text-2xl font-medium text-[var(--color-text-900)]">22K Temple Gold Maintenance</h3>
            <p className="text-xs font-sans text-[var(--color-text-500)] leading-relaxed">
              Clean gently using a soft lint-free flannel cloth. Avoid exposure to perfumes, hairsprays, or chemical solvents which may alter the organic antique repoussé patina.
            </p>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-8 rounded-[var(--radius-card)] space-y-3">
            <Sparkles className="w-6 h-6 text-[var(--color-gold-600)]" />
            <h3 className="font-serif text-2xl font-medium text-[var(--color-text-900)]">Kundan & Polki Protection</h3>
            <p className="text-xs font-sans text-[var(--color-text-500)] leading-relaxed">
              Kundan foil settings must be kept dry and away from humidity. Never submerge in ultrasonic cleaners or soap water as moisture can tarnish pure gold foil pockets.
            </p>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-8 rounded-[var(--radius-card)] space-y-3">
            <RefreshCw className="w-6 h-6 text-[var(--color-gold-600)]" />
            <h3 className="font-serif text-2xl font-medium text-[var(--color-text-900)]">Storage & Vault Packaging</h3>
            <p className="text-xs font-sans text-[var(--color-text-500)] leading-relaxed">
              Store each heirloom individually in the velvet-lined mahogany box provided. Keep pieces separate to prevent gemstone scratches.
            </p>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-8 rounded-[var(--radius-card)] space-y-3">
            <Award className="w-6 h-6 text-[var(--color-gold-600)]" />
            <h3 className="font-serif text-2xl font-medium text-[var(--color-text-900)]">Lifetime Polish & Inspection</h3>
            <p className="text-xs font-sans text-[var(--color-text-500)] leading-relaxed">
              Adi Parva offers complimentary annual inspection, re-stringing, and antique refinishing at any of our flagship ateliers.
            </p>
          </div>
        </div>

        {/* BIS Certification Explanation */}
        <div className="bg-[var(--color-ink-900)] text-white rounded-[var(--radius-card)] p-8 sm:p-12 space-y-6 border border-[var(--color-gold-700)]/40">
          <MicroLabel className="text-[var(--color-gold-500)]">GOVERNMENT ASSAY GUARANTEE</MicroLabel>
          <h2 className="font-serif text-3xl font-medium text-white">BIS 916 Hallmarking Certificate</h2>
          <p className="font-sans text-sm text-[var(--color-cream-300)] leading-relaxed max-w-3xl">
            Every piece departing our vault bears official Bureau of Indian Standards hallmarking laser stamps: the BIS logo, 22K916 purity mark, assay center mark, and Adi Parva atelier sponsor mark. Every reservation is delivered with an official paper provenance deed card.
          </p>
          <div className="pt-2">
            <Link href="/collections">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                DISCOVER THE COLLECTION
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
