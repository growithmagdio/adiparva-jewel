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
    <div className="min-h-screen bg-[var(--color-vault-black)] text-[var(--color-ivory)] flex flex-col font-sans">
      <Header />

      <main className="flex-1 space-y-24 pb-24">
        {/* Section 1: Hero Quote over Workshop Image */}
        <section className="relative min-h-[70vh] bg-[var(--color-sanctum)] border-b border-[var(--color-temple-gold)]/20 flex items-center justify-center text-center p-8 overflow-hidden">
          {/* Background Workshop Image Overlay */}
          <div className="absolute inset-0 z-0 opacity-25">
            <Image
              src="/images/craft/stage-2-nakashi.jpg"
              alt="Atelier Workshop"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-vault-black)] via-transparent to-[var(--color-vault-black)]" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto space-y-6">
            <KolamDivider />
            <div className="font-marcellus text-[11px] uppercase tracking-[0.35em] text-[var(--color-temple-gold)]">
              OUR PROVENANCE
            </div>
            <h1 className="font-serif text-[40px] sm:text-[64px] font-light italic leading-tight text-[var(--color-ivory)]">
              “Before gold was personal adornment, it was sacred temple geometry created for royal sanctums in Tamil Nadu.”
            </h1>
            <div className="font-marcellus text-[12px] uppercase tracking-[0.25em] text-[var(--color-gold-light)]">
              — THE HOUSE OF ADI PARVA
            </div>
          </div>
        </section>

        {/* Section 2: Alternating Image/Text Row 1 */}
        <section className="max-w-[1440px] mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="font-marcellus text-[11px] uppercase tracking-[0.35em] text-[var(--color-temple-gold)]">
                SACRED ORIGINS
              </div>
              <h2 className="font-serif text-[36px] sm:text-[48px] font-light text-[var(--color-ivory)]">
                Born in the Sthapati <em className="italic text-gold-gradient font-normal">Guilds</em>
              </h2>
              <div className="space-y-4 font-jost text-[15px] sm:text-[16px] text-[var(--color-sandal)]/90 leading-relaxed font-light">
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
                  className="shadow-2xl border border-[var(--color-temple-gold)]/30"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Gold Hairline Timeline */}
        <section className="bg-[var(--color-sanctum)] py-20 border-y border-[var(--color-temple-gold)]/20">
          <div className="max-w-[1200px] mx-auto px-6 sm:px-8 space-y-12 text-center">
            <KolamDivider />
            <h2 className="font-serif text-[36px] sm:text-[44px] font-light text-[var(--color-ivory)]">
              Timeline of the <em className="italic text-gold-gradient font-normal">House</em>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-6 relative">
              {[
                { year: '1010 AD', title: 'Chola Royal Patronage', desc: 'Sthapati artisans carve deity plaques for the Brihadeeswarar Temple sanctum.' },
                { year: '1840 AD', title: 'Nagercoil Cluster', desc: 'Craftsmen consolidate in Vadasery, creating signature kemp stone settings.' },
                { year: '1982 AD', title: 'The Parva Deed', desc: 'The house archives sacred mold drawings and establishes custodial guidelines.' },
                { year: '2026 AD', title: 'Living Vitrine Archive', desc: 'Adi Parva launches direct-to-patron living archives across India.' },
              ].map((t, idx) => (
                <div key={idx} className="space-y-3 relative p-6 bg-[var(--color-vault-black)] border border-[var(--color-temple-gold)]/20 rounded-[4px]">
                  <div className="font-serif text-[32px] text-[var(--color-temple-gold)] font-light">{t.year}</div>
                  <h3 className="font-marcellus text-[12px] uppercase tracking-[0.2em] text-[var(--color-ivory)]">{t.title}</h3>
                  <p className="font-jost text-xs text-[var(--color-sandal)]/70 font-light">{t.desc}</p>
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
