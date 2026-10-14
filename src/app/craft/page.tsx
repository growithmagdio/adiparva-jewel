'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { GopuramArch } from '@/components/storefront/gopuram-arch';
import { KolamDivider } from '@/components/storefront/kolam-divider';

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
    <div className="min-h-screen bg-[#FAF5EC] text-[#765E55] flex flex-col font-sans">
      <Header />

      <main className="flex-1 space-y-20 sm:space-y-28 pb-24">
        {/* Header */}
        <section className="max-w-[1440px] mx-auto px-6 sm:px-8 pt-16 space-y-4 text-center max-w-3xl">
          <KolamDivider />
          <span className="font-marcellus text-[11px] uppercase tracking-[0.35em] text-[#B68A3A] font-semibold">
            HERITAGE MÉTIER
          </span>
          <h1 className="font-serif text-[36px] sm:text-[52px] font-normal text-[#5B1018] leading-tight">
            The Stages of <em className="italic font-normal text-[#B68A3A]">Making</em>
          </h1>
          <p className="font-jost text-[16px] text-[#765E55] leading-[1.65]">
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
                className="bg-white border border-[#E7D7C0] p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center rounded-[4px] shadow-xs"
              >
                {/* Content Side */}
                <div className={`lg:col-span-6 space-y-4 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-3xl font-normal text-[#B68A3A]">
                      {stage.number}
                    </span>
                    <span className="font-marcellus text-[10px] uppercase tracking-[0.25em] text-[#5B1018] font-semibold">
                      {stage.subtitle}
                    </span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl text-[#5B1018] font-normal">
                    {stage.title}
                  </h2>

                  <p className="font-jost text-sm text-[#765E55] leading-relaxed">
                    {stage.description}
                  </p>

                  <div className="pt-2 font-marcellus text-[10px] uppercase tracking-[0.2em] text-[#B68A3A] font-semibold">
                    {stage.hours}
                  </div>
                </div>

                {/* Image Side */}
                <div className={`lg:col-span-6 flex justify-center ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                  <div className="w-full max-w-[420px]">
                    <GopuramArch
                      src={stage.image}
                      alt={stage.title}
                      aspect="portrait"
                      sizes="450px"
                      className="shadow-sm border border-[#E7D7C0]"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </main>

      <Footer />
    </div>
  );
}
