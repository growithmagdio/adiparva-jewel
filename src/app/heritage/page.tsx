'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { GopuramArch } from '@/components/storefront/gopuram-arch';
import { KolamDivider } from '@/components/storefront/kolam-divider';

export default function HeritagePage() {
  return (
    <div className="min-h-screen bg-[#FAF5EC] text-[#765E55] flex flex-col font-sans">
      <Header />

      <main className="flex-1 space-y-24 pb-24">
        {/* Section 1: Hero Quote over Workshop Image */}
        <section className="relative min-h-[60vh] bg-[#F2E7D7]/40 border-b border-[#E7D7C0] flex items-center justify-center text-center p-8 overflow-hidden">
          {/* Background Workshop Image Overlay */}
          <div className="absolute inset-0 z-0 opacity-15">
            <Image
              src="/images/craft/stage-2-nakashi.jpg"
              alt="Atelier Workshop"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FAF5EC] via-transparent to-[#FAF5EC]" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto space-y-6">
            <KolamDivider />
            <div className="font-marcellus text-[11px] uppercase tracking-[0.35em] text-[#B68A3A] font-semibold">
              OUR PROVENANCE
            </div>
            <h1 className="font-serif text-[38px] sm:text-[56px] font-normal italic leading-tight text-[#5B1018]">
              “Before gold was personal adornment, it was sacred temple geometry created for royal sanctums in Tamil Nadu.”
            </h1>
            <div className="font-marcellus text-[12px] uppercase tracking-[0.25em] text-[#B68A3A] font-semibold">
              — THE HOUSE OF ADI PARVA
            </div>
          </div>
        </section>

        {/* Section 2: Alternating Image/Text Row 1 */}
        <section className="max-w-[1440px] mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="font-marcellus text-[11px] uppercase tracking-[0.35em] text-[#B68A3A] font-semibold">
                SACRED ORIGINS
              </div>
              <h2 className="font-serif text-[36px] sm:text-[48px] font-normal text-[#5B1018]">
                Born in the Sthapati <em className="italic font-normal text-[#B68A3A]">Guilds</em>
              </h2>
              <div className="space-y-4 font-jost text-[15px] sm:text-[16px] text-[#765E55] leading-relaxed">
                <p>
                  For centuries, hereditary sthapati artisans dedicated their bench craft to temple treasuries. Every kasu coin, peacock motif, and lotus petal was hand-engraved with mathematical precision using repoussé techniques passed down through secret family deeds.
                </p>
                <p>
                  Adi Parva was established to ensure these royal and sacred techniques remain living bench traditions rather than museum relics. We commission master sthapati families directly, maintaining traditional wax carving and unrefined 22K gold alloy standards.
                </p>
              </div>
            </div>

            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-[440px]">
                <GopuramArch
                  src="/images/categories/temple-jewellery.jpg"
                  alt="Sthapati Guild Heritage"
                  aspect="portrait"
                  sizes="450px"
                  className="shadow-sm border border-[#E7D7C0]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Gold Hairline Timeline */}
        <section className="bg-white py-20 border-y border-[#E7D7C0]">
          <div className="max-w-[1200px] mx-auto px-6 sm:px-8 space-y-12 text-center">
            <KolamDivider />
            <h2 className="font-serif text-[36px] sm:text-[44px] font-normal text-[#5B1018]">
              Timeline of the <em className="italic font-normal text-[#B68A3A]">House</em>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-6 relative">
              {[
                { year: '1010 AD', title: 'Chola Royal Patronage', desc: 'Sthapati artisans carve deity plaques for the Brihadeeswarar Temple sanctum.' },
                { year: '1840 AD', title: 'Nagercoil Cluster', desc: 'Craftsmen consolidate in Vadasery, creating signature kemp stone settings.' },
                { year: '1982 AD', title: 'The Parva Deed', desc: 'The house archives sacred mold drawings and establishes custodial guidelines.' },
                { year: '2026 AD', title: 'Living Vitrine Archive', desc: 'Adi Parva launches direct-to-patron living archives across India.' },
              ].map((t, idx) => (
                <div key={idx} className="space-y-3 relative p-6 bg-[#FAF5EC] border border-[#E7D7C0] rounded-[4px] shadow-xs">
                  <div className="font-serif text-[32px] text-[#5B1018] font-normal">{t.year}</div>
                  <h3 className="font-marcellus text-[12px] uppercase tracking-[0.2em] text-[#5B1018] font-semibold">{t.title}</h3>
                  <p className="font-jost text-xs text-[#765E55]">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
