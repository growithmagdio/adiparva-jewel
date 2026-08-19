'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { GopuramRule } from '@/components/ui/GopuramRule';
import { Button } from '@/components/primitives/button';

export default function CraftPage() {
  const stages = [
    {
      number: '01',
      title: 'Wax Modeling & Temple Geometry',
      subtitle: 'STAGE ONE',
      description: 'Master sthapatis carve intricate beeswax prototypes using traditional bamboo needles. Every swan motif, lotus bud, and kasu coin is sculpted to match ancient temple iconography.',
      image: '/images/craft/stage-1.jpg',
      hours: '30 BENCH HOURS',
    },
    {
      number: '02',
      title: 'Nakashi Repoussé & Engraving',
      subtitle: 'STAGE TWO',
      description: 'Solid 22K gold bullion is beaten into thin sheets, backed with natural tree resin pitch, and hand-chiseled with tiny steel punches to raise 3D deity motifs.',
      image: '/images/craft/stage-1.jpg',
      hours: '65 BENCH HOURS',
    },
    {
      number: '03',
      title: 'Jadau Stone Setting',
      subtitle: 'STAGE THREE',
      description: 'Uncut Polki diamonds, Burmese rubies, and Colombian emeralds are seated into pure gold foil (kundan) pockets, burnished with agate tools without chemical adhesives.',
      image: '/images/categories/kundan.jpg',
      hours: '45 BENCH HOURS',
    },
    {
      number: '04',
      title: 'Meenakari Enamelling',
      subtitle: 'STAGE FOUR',
      description: 'Mineral glass powders are hand-painted into back-side gold grooves and fired at 800°C to create vibrant ruby red and peacock green reverse enamel details.',
      image: '/images/categories/meenakari.jpg',
      hours: '25 BENCH HOURS',
    },
    {
      number: '05',
      title: 'Antique Polish & Pearl Stringing',
      subtitle: 'STAGE FIVE',
      description: 'Pieces undergo organic antique patination to highlight deep engraving channels, followed by hand-knotted Basra pearl stringing by hereditary artisans.',
      image: '/images/categories/temple-jewellery.jpg',
      hours: '20 BENCH HOURS',
    },
    {
      number: '06',
      title: 'BIS 916 Hallmarking & Certification',
      subtitle: 'STAGE SIX',
      description: 'Every completed parure is non-destructively assayed, stamped with official Bureau of Indian Standards 916 hallmarks, and sealed in an armored transit deed case.',
      image: '/images/categories/bridal-sets.jpg',
      hours: 'FINAL ASSAY',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-ivory)] text-[var(--color-ink)] flex flex-col font-sans">
      <Header />

      <main className="flex-1 space-y-20 sm:space-y-28 pb-24">
        {/* Header */}
        <section className="max-w-[1440px] mx-auto px-6 sm:px-8 pt-16 space-y-4 text-center max-w-3xl">
          <GopuramRule size="sm" />
          <span className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
            Heritage Métier
          </span>
          <h1 className="font-bodoni text-[36px] sm:text-[52px] text-[var(--color-ink)] leading-tight">
            The Stages of Making
          </h1>
          <p className="font-karla text-[16px] text-[var(--color-ink)]/75 leading-[1.65]">
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
                className="bg-[var(--color-ivory)] border border-[var(--color-hairline)] p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center rounded-[2px]"
              >
                {/* Content Side */}
                <div className={`lg:col-span-6 space-y-4 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div className="flex items-center gap-3">
                    <span className="font-bodoni text-2xl font-bold text-[var(--color-gold)]">
                      {stage.number}
                    </span>
                    <span className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)]">
                      {stage.subtitle}
                    </span>
                  </div>

                  <h3 className="font-bodoni text-2xl sm:text-3xl text-[var(--color-ink)]">
                    {stage.title}
                  </h3>

                  <p className="font-karla text-[15px] text-[var(--color-ink)]/80 leading-[1.65]">
                    {stage.description}
                  </p>

                  <div className="pt-2 font-marcellus text-[10px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
                    ✓ {stage.hours}
                  </div>
                </div>

                {/* Image Side */}
                <div className={`lg:col-span-6 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                  <div className="relative aspect-[16/10] bg-[var(--color-vault)] overflow-hidden">
                    <Image
                      src={stage.image}
                      alt={stage.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover opacity-90"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* CTA Footer Band */}
        <section className="max-w-[1440px] mx-auto px-6 sm:px-8">
          <div className="bg-[var(--color-vault)] text-[var(--color-ivory)] p-12 text-center space-y-6 border border-[var(--color-hairline)]/30 rounded-[2px]">
            <span className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
              Explore the Collection
            </span>
            <h2 className="font-bodoni text-3xl sm:text-4xl text-[var(--color-ivory)]">
              Experience Handcrafted Temple Gold
            </h2>
            <div className="pt-2 flex justify-center">
              <Link href="/collections">
                <Button variant="gold">
                  View Live Vault
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
