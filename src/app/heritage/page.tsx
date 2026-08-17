'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { BicameralHeading, MicroLabel, ArchFrame, Button } from '@/components/primitives';
import { ArrowRight, ShieldCheck, Heart, Award } from 'lucide-react';

export default function HeritagePage() {
  return (
    <div className="min-h-screen bg-[var(--color-cream-100)] text-[var(--color-text-700)] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 space-y-24 sm:space-y-32 pb-24">
        {/* Section 1: Hero */}
        <section className="max-w-[1440px] mx-auto px-6 sm:px-8 pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <MicroLabel className="text-[var(--color-gold-600)]">THE HOUSE STORY</MicroLabel>
              <BicameralHeading italicPart="Custodians of" romanPart="Temple Gold" size="xl" />
              <p className="font-sans text-base sm:text-lg text-[var(--color-text-700)] leading-relaxed max-w-xl">
                Founded to preserve South India&apos;s sacred gopuram jewelry traditions, Adi Parva exists to keep and honor heirloom gold for future generations.
              </p>
              <div className="pt-2">
                <Link href="/collections">
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    EXPLORE THE REPOSITORY
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <ArchFrame ratio="portrait" className="w-full max-w-[460px] aspect-[4/5] shadow-2xl">
                <ImageWithFallback
                  src="/images/hero/hero-temple-necklace.jpg"
                  alt="House of Adi Parva"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 460px"
                  className="object-cover"
                />
              </ArchFrame>
            </div>
          </div>
        </section>

        {/* Section 2: Gopuram Origins */}
        <section className="max-w-[1440px] mx-auto px-6 sm:px-8">
          <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] rounded-[var(--radius-card)] p-8 sm:p-16 space-y-12">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <MicroLabel className="text-[var(--color-gold-600)]">SACRED ORIGINS</MicroLabel>
              <BicameralHeading italicPart="Born in the" romanPart="Sthapati Guilds" size="lg" align="center" />
              <p className="font-serif italic text-lg sm:text-xl text-[var(--color-text-900)] leading-relaxed">
                &ldquo;Before jewellery was personal adornment, it was sacred temple geometry created exclusively for deity idols in Thanjavur and Nagercoil.&rdquo;
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center pt-6">
              <div className="space-y-4 text-sm font-sans text-[var(--color-text-700)] leading-relaxed">
                <p>
                  For centuries, hereditary sthapati artisans dedicated their bench craft to temple treasuries. Every kasu coin, peacock motif, and lotus petal was hand-engraved with mathematical precision using repoussé techniques passed down through secret family deeds.
                </p>
                <p>
                  Adi Parva was established to ensure these royal and sacred techniques remain living bench traditions rather than museum relics. We commission master sthapati families directly, maintaining traditional wax carving and unrefined 22K gold alloy standards.
                </p>
              </div>

              <div className="relative aspect-[4/3] rounded-[var(--radius-card)] overflow-hidden border border-[var(--color-cream-300)]">
                <ImageWithFallback
                  src="/images/categories/temple-jewellery.jpg"
                  alt="Temple Gold Craft"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Custodial Philosophy Band */}
        <section className="w-full bg-[var(--color-ink-900)] text-[var(--color-cream-100)] py-20 px-6 text-center select-none border-y border-[var(--color-gold-700)]/30">
          <div className="max-w-4xl mx-auto space-y-6">
            <MicroLabel className="text-[var(--color-gold-500)]">THE PARVA DEED</MicroLabel>
            <p className="font-serif italic font-normal text-2xl sm:text-3xl lg:text-4xl text-white leading-relaxed">
              &ldquo;We do not manufacture seasonal fashion. We keep and record heirloom pieces meant to be passed down through centuries.&rdquo;
            </p>
            <div className="pt-2 flex justify-center gap-8 text-xs font-sans text-[var(--color-cream-300)]/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--color-gold-400)]" />
                <span>BIS 916 Hallmarked</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[var(--color-gold-400)]" />
                <span>Atelier Provenance Deed</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Preservation & Future */}
        <section className="max-w-[1440px] mx-auto px-6 sm:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <div className="relative aspect-[4/3] rounded-[var(--radius-card)] overflow-hidden border border-[var(--color-cream-300)] shadow-xl">
                <ImageWithFallback
                  src="/images/craft/stage-3-jadau.jpg"
                  alt="Jadau Stone Setting"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <MicroLabel className="text-[var(--color-gold-600)]">PRESERVATION MISSION</MicroLabel>
              <BicameralHeading italicPart="Preserving" romanPart="Endangered Arts" size="lg" />
              <p className="font-sans text-sm sm:text-base text-[var(--color-text-700)] leading-relaxed">
                Modern mass production has threatened traditional bench setting, nakashi repoussé, and organic meenakari enamelling. Adi Parva supports over seventy artisan families across Nagercoil, Madurai, and Jaipur, providing fair custodial wages and preserving traditional bench tools.
              </p>
              <div className="pt-2">
                <Link href="/craft">
                  <Button variant="secondary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    EXPLORE CRAFTSMANSHIP STAGES
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
