'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { BicameralHeading, MicroLabel, Button } from '@/components/primitives';
import { ArrowRight, Hammer, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function CraftPage() {
  const stages = [
    {
      number: '01',
      title: 'Wax Modeling & Temple Geometry',
      subtitle: 'STAGE ONE',
      description: 'Master sthapatis carve intricate beeswax prototypes using traditional bamboo needles. Every swan motif, lotus bud, and kasu coin is sculpted to match ancient temple iconography.',
      image: '/images/craft/stage-1-wax-model.jpg',
      hours: '30 BENCH HOURS',
    },
    {
      number: '02',
      title: 'Nakashi Repoussé & Engraving',
      subtitle: 'STAGE TWO',
      description: 'Solid 22K gold bullion is beaten into thin sheets, backed with natural tree resin pitch, and hand-chiseled with tiny steel punches to raise 3D deity motifs.',
      image: '/images/craft/stage-2-nakashi.jpg',
      hours: '65 BENCH HOURS',
    },
    {
      number: '03',
      title: 'Jadau Stone Setting',
      subtitle: 'STAGE THREE',
      description: 'Uncut Polki diamonds, Burmese rubies, and Colombian emeralds are seated into pure gold foil (kundan) pockets, burnished with agate tools without chemical adhesives.',
      image: '/images/craft/stage-3-jadau.jpg',
      hours: '45 BENCH HOURS',
    },
    {
      number: '04',
      title: 'Meenakari Enamelling',
      subtitle: 'STAGE FOUR',
      description: 'Mineral glass powders are hand-painted into back-side gold grooves and fired at 800°C to create vibrant ruby red and peacock green reverse enamel details.',
      image: '/images/craft/stage-4-meenakari.jpg',
      hours: '25 BENCH HOURS',
    },
    {
      number: '05',
      title: 'Antique Polish & Pearl Stringing',
      subtitle: 'STAGE FIVE',
      description: 'Pieces undergo organic antique patination to highlight deep engraving channels, followed by hand-knotted Basra pearl stringing by hereditary artisans.',
      image: '/images/craft/stage-5-polish.jpg',
      hours: '20 BENCH HOURS',
    },
    {
      number: '06',
      title: 'BIS 916 Hallmarking & Certification',
      subtitle: 'STAGE SIX',
      description: 'Every completed parure is non-destructively assayed, stamped with official Bureau of Indian Standards 916 hallmarks, and sealed in an armored transit deed case.',
      image: '/images/craft/stage-6-hallmark.jpg',
      hours: 'FINAL ASSAY',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-cream-100)] text-[var(--color-text-700)] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 space-y-20 sm:space-y-28 pb-24">
        {/* Header */}
        <section className="max-w-[1440px] mx-auto px-6 sm:px-8 pt-12 space-y-4 text-center max-w-3xl">
          <MicroLabel className="text-[var(--color-gold-600)]">HERITAGE METIER</MicroLabel>
          <BicameralHeading italicPart="The Art" romanPart="of Craftsmanship" size="xl" align="center" />
          <p className="font-sans text-base sm:text-lg text-[var(--color-text-700)] leading-relaxed">
            Walk through the six bench stages required to create a single Adi Parva temple gold or Kundan heirloom. Over 200 hours of hereditary hand labor per parure.
          </p>
        </section>

        {/* 6 Stage Timeline */}
        <section className="max-w-[1440px] mx-auto px-6 sm:px-8 space-y-16">
          {stages.map((stage, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div
                key={stage.number}
                className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] rounded-[var(--radius-card)] p-8 sm:p-12 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
              >
                {/* Content Side */}
                <div className={`lg:col-span-6 space-y-5 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-[var(--color-ink-900)] text-[var(--color-gold-400)] font-serif text-lg font-semibold flex items-center justify-center">
                      {stage.number}
                    </span>
                    <MicroLabel className="text-[var(--color-gold-600)]">{stage.subtitle}</MicroLabel>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[var(--color-text-900)]">
                    {stage.title}
                  </h3>

                  <p className="font-sans text-sm sm:text-base text-[var(--color-text-700)] leading-relaxed">
                    {stage.description}
                  </p>

                  <div className="pt-2 flex items-center gap-2 text-xs font-sans font-semibold text-[var(--color-gold-600)] uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-ok-fg)]" />
                    <span>{stage.hours}</span>
                  </div>
                </div>

                {/* Image Side */}
                <div className={`lg:col-span-6 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                  <div className="relative aspect-[16/10] rounded-[var(--radius-card)] overflow-hidden border border-[var(--color-cream-300)] shadow-md">
                    <ImageWithFallback
                      src={stage.image}
                      alt={stage.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* CTA Footer Band */}
        <section className="max-w-[1440px] mx-auto px-6 sm:px-8">
          <div className="bg-[var(--color-ink-900)] text-white rounded-[var(--radius-card)] p-12 text-center space-y-6 border border-[var(--color-gold-700)]/40">
            <MicroLabel className="text-[var(--color-gold-500)]">EXPLORE THE COLLECTION</MicroLabel>
            <h2 className="font-serif text-3xl sm:text-4xl text-white">Experience Handcrafted Temple Gold</h2>
            <div className="pt-2 flex justify-center">
              <Link href="/collections">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  VIEW LIVE REPOSITORY
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
