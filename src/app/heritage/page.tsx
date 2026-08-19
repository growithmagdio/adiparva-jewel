'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { GopuramRule } from '@/components/ui/GopuramRule';
import { KolamLattice } from '@/components/ui/KolamLattice';
import { Button } from '@/components/primitives/button';

export default function HeritagePage() {
  return (
    <div className="min-h-screen bg-[var(--color-ivory)] text-[var(--color-ink)] flex flex-col font-sans">
      <Header />

      <main className="flex-1 space-y-24 pb-24">
        {/* Section 1: Hero */}
        <section className="max-w-[1440px] mx-auto px-6 sm:px-8 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
                The House Story
              </span>
              <h1 className="font-bodoni text-[44px] sm:text-[64px] text-[var(--color-ink)] leading-none">
                Custodians of Temple Gold
              </h1>
              <p className="font-karla text-[16px] sm:text-[18px] text-[var(--color-ink)]/75 max-w-xl leading-[1.65]">
                Founded to preserve South India&apos;s sacred gopuram jewellery traditions, Adi Parva exists to keep and honor heirloom gold for generations to come.
              </p>
              <div className="pt-2">
                <Link href="/collections">
                  <Button variant="gold">
                    Explore the collection
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 relative aspect-[4/5] bg-[var(--color-vault)] overflow-hidden">
              <Image
                src="/images/categories/temple-jewellery.jpg"
                alt="House of Adi Parva Temple Gold"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover opacity-90"
              />
            </div>
          </div>
        </section>

        <GopuramRule size="md" />

        {/* Section 2: Sacred Origins */}
        <section className="max-w-[1440px] mx-auto px-6 sm:px-8">
          <div className="space-y-12">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <span className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
                Sacred Origins
              </span>
              <h2 className="font-bodoni text-[36px] sm:text-[44px] text-[var(--color-ink)]">
                Born in the Sthapati Guilds
              </h2>
              <p className="font-bodoni italic text-xl text-[var(--color-ink)]/90 leading-relaxed">
                "Before jewellery was personal ornamentation, it was sacred temple geometry created exclusively for deity idols in Thanjavur and Nagercoil."
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center pt-6 font-karla text-[16px] text-[var(--color-ink)]/80 leading-[1.65]">
              <div className="space-y-4">
                <p>
                  For centuries, hereditary sthapati artisans dedicated their bench craft to temple treasuries. Every kasu coin, peacock motif, and lotus petal was hand-engraved with mathematical precision using repoussé techniques passed down through secret family deeds.
                </p>
                <p>
                  Adi Parva was established to ensure these royal and sacred techniques remain living bench traditions rather than museum relics. We commission master sthapati families directly, maintaining traditional wax carving and unrefined 22K gold alloy standards.
                </p>
              </div>

              <div className="relative aspect-[4/3] bg-[var(--color-vault)] overflow-hidden">
                <Image
                  src="/images/craft/stage-1.jpg"
                  alt="Sthapati Guild Workshop"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Dark Editorial Band */}
        <section className="relative w-full bg-[var(--color-vault)] text-[var(--color-ivory)] py-24 px-6 text-center overflow-hidden">
          <KolamLattice />
          <div className="relative z-10 max-w-4xl mx-auto space-y-6">
            <span className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
              The Parva Deed
            </span>
            <p className="font-bodoni italic font-normal text-2xl sm:text-4xl text-[var(--color-ivory)] leading-relaxed">
              "We do not manufacture seasonal fashion. We keep and record heirloom pieces meant to be passed down through centuries."
            </p>
            <div className="pt-4 flex justify-center gap-8 font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold-lit)]">
              <span>BIS 916 Hallmarked</span>
              <span>•</span>
              <span>Atelier Provenance Deed</span>
            </div>
          </div>
        </section>

        {/* Section 4: Preservation Mission */}
        <section className="max-w-[1440px] mx-auto px-6 sm:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 relative aspect-[4/3] bg-[var(--color-vault)] overflow-hidden">
              <Image
                src="/images/categories/kundan.jpg"
                alt="Endangered Jewellery Arts"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            <div className="lg:col-span-6 space-y-6">
              <span className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
                Preservation Mission
              </span>
              <h2 className="font-bodoni text-[36px] sm:text-[44px] text-[var(--color-ink)]">
                Preserving Endangered Arts
              </h2>
              <p className="font-karla text-[16px] text-[var(--color-ink)]/80 leading-[1.65]">
                Modern mass production has threatened traditional bench setting, nakashi repoussé, and organic meenakari enamelling. Adi Parva supports over seventy artisan families across Nagercoil, Madurai, and Jaipur, providing fair custodial wages and preserving traditional bench tools.
              </p>
              <div className="pt-2">
                <Link href="/craft">
                  <Button variant="ghost">
                    Explore craftsmanship stages
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
