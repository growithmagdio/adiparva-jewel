'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Truck, Banknote, RotateCcw, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { ProductCard } from '@/components/storefront/product-card';
import { getProducts } from '@/lib/data/queries';
import { Product } from '@/lib/data/types';

export default function HomePage() {
  const [newArrivals, setNewArrivals] = React.useState<Product[]>([]);
  const [bestsellers, setBestsellers] = React.useState<Product[]>([]);
  const [newsletterEmail, setNewsletterEmail] = React.useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    async function loadData() {
      const all = await getProducts({ status: 'live' });
      setNewArrivals(all.slice(0, 4));
      setBestsellers(all.slice(4, 9));
    }
    loadData();
  }, []);

  const scrollBestsellers = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;
    setNewsletterSubmitted(true);
  };

  const categories6 = [
    { name: 'NECKLACE', slug: 'temple-jewellery', image: '/images/categories/temple-jewellery.jpg' },
    { name: 'BANGLES', slug: 'bangles-kada', image: '/images/categories/bangles-kada.jpg' },
    { name: 'EARRINGS', slug: 'jhumkas', image: '/images/categories/jhumkas.jpg' },
    { name: 'HARAM', slug: 'haarams', image: '/images/categories/haarams.jpg' },
    { name: 'BROOCHES', slug: 'maang-tikka-nath', image: '/images/categories/maang-tikka-nath.jpg' },
    { name: 'ANTIQUE SETS', slug: 'kundan', image: '/images/categories/kundan.jpg' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-cream-50)] text-[var(--color-text-900)] flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        {/* 1. HERO SECTION — Deep Espresso & Royal Gold Backdrop */}
        <section className="relative w-full bg-[#120A05] text-[#FDF7EF] py-16 lg:py-24 overflow-hidden border-b border-[#D4AF37]/25">
          {/* Ambient Glows */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-[#B8761F]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Background Filigree Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />

          <div className="max-w-[1440px] mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
            {/* Left Column Text */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 space-y-7 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D4AF37]/40 bg-[#1C0F07]/80 text-[#D4AF37] font-sans text-[10px] uppercase tracking-[0.22em] font-semibold shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
                <span>EST. IN THE TEMPLE TOWNS OF TAMIL NADU</span>
              </div>

              <h1 className="font-serif text-[44px] sm:text-[62px] lg:text-[72px] leading-[1.04] tracking-tight text-[#FDF7EF]">
                <span className="italic font-normal block text-[#E6D5BF]">Temple of</span>
                <span className="text-gold-gradient font-medium block">Tradition</span>
              </h1>

              <p className="font-sans text-[16px] sm:text-[18px] text-[#E6D5BF]/85 max-w-[52ch] mx-auto lg:mx-0 leading-relaxed">
                Custodians of heirloom South Indian temple gold, Kundan, and royal Polki pieces handcrafted by master sthapati artisans using centuries-old repoussé traditions.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-3">
                <Link
                  href="/collections"
                  className="h-[52px] px-9 bg-foil-gold text-[#120A05] font-sans text-[12px] uppercase tracking-[0.18em] font-bold rounded-xs hover:brightness-110 transition-all flex items-center justify-center shadow-royal-gold"
                >
                  SHOP COLLECTION
                </Link>
                <Link
                  href="/heritage"
                  className="h-[52px] px-8 border border-[#D4AF37]/50 text-[#FDF7EF] font-sans text-[12px] uppercase tracking-[0.18em] font-medium rounded-xs hover:bg-[#D4AF37]/15 hover:border-[#D4AF37] transition-all flex items-center justify-center backdrop-blur-xs"
                >
                  EXPLORE STORY
                </Link>
              </div>
            </motion.div>

            {/* Right Column Image with Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 relative aspect-[4/3] sm:aspect-[16/11] rounded-card overflow-hidden p-2 border-gold-glow bg-[#1C0F07]"
            >
              <div className="relative w-full h-full rounded-xs overflow-hidden">
                <Image
                  src="/images/hero/hero-temple-necklace.jpg"
                  alt="Model wearing Adi Parva Temple Gold Jewellery"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-top hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120A05]/60 via-transparent to-transparent" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2. TRUST BADGES STRIP */}
        <section className="bg-[var(--color-cream-100)] border-b border-[var(--color-cream-200)] py-7">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex items-center justify-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[var(--color-gold-100)] border border-[var(--color-gold-500)]/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[var(--color-gold-600)]" />
              </div>
              <div className="text-left">
                <span className="font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-900)] block">SECURE PAYMENT</span>
                <span className="font-sans text-[11px] text-[var(--color-text-500)] block">100% Secure & Safe</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[var(--color-gold-100)] border border-[var(--color-gold-500)]/30 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-[var(--color-gold-600)]" />
              </div>
              <div className="text-left">
                <span className="font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-900)] block">FREE SHIPPING</span>
                <span className="font-sans text-[11px] text-[var(--color-text-500)] block">Above ₹1999</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[var(--color-gold-100)] border border-[var(--color-gold-500)]/30 flex items-center justify-center shrink-0">
                <Banknote className="w-5 h-5 text-[var(--color-gold-600)]" />
              </div>
              <div className="text-left">
                <span className="font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-900)] block">COD AVAILABLE</span>
                <span className="font-sans text-[11px] text-[var(--color-text-500)] block">Cash on Delivery</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[var(--color-gold-100)] border border-[var(--color-gold-500)]/30 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5 text-[var(--color-gold-600)]" />
              </div>
              <div className="text-left">
                <span className="font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-900)] block">EASY RETURNS</span>
                <span className="font-sans text-[11px] text-[var(--color-text-500)] block">7 Days Return Policy</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SHOP BY CATEGORY — Royal Double Gold Rings */}
        <section className="py-20 max-w-[1440px] mx-auto px-6 sm:px-8">
          <div className="text-center my-6 space-y-3">
            <span className="font-sans text-[11px] uppercase tracking-[0.22em] font-semibold text-[var(--color-gold-700)] block">
              ✦ ROYAL CLASSIFICATIONS ✦
            </span>
            <h2 className="font-serif text-[32px] sm:text-[40px] text-[var(--color-text-900)] font-medium tracking-tight">
              SHOP BY CATEGORY
            </h2>
            <div className="w-28 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-gold-500)] to-transparent mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 pt-8">
            {categories6.map((cat) => (
              <Link
                key={cat.slug}
                href={`/collections/${cat.slug}`}
                className="group flex flex-col items-center space-y-4"
              >
                {/* Double Gold Filigree Ring Frame */}
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full relative p-1 bg-gradient-to-b from-[#D4AF37] via-[#B8761F] to-[#8A6224] shadow-md group-hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-500">
                  <div className="w-full h-full rounded-full relative overflow-hidden bg-[var(--color-cream-100)] border border-[var(--color-cream-50)]">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="150px"
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                </div>
                <span className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-900)] group-hover:text-[var(--color-gold-600)] transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. NEW ARRIVALS */}
        <section className="py-20 bg-[var(--color-cream-100)] border-y border-[var(--color-cream-200)]">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-8">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                <span className="font-sans text-[11px] uppercase tracking-[0.2em] font-semibold text-[var(--color-gold-700)] block">
                  ✦ NEWLY VAULTED ✦
                </span>
                <h2 className="font-serif text-[30px] sm:text-[40px] text-[var(--color-text-900)] font-medium tracking-tight">
                  NEW ARRIVALS
                </h2>
              </div>
              <Link
                href="/collections"
                className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-gold-700)] hover:text-[var(--color-gold-600)] underline underline-offset-4"
              >
                VIEW ALL
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} showRating />
              ))}
            </div>
          </div>
        </section>

        {/* 5. OUR HERITAGE BANNER */}
        <section className="py-24 bg-[var(--color-cream-50)] overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Image in Gold Frame */}
            <div className="lg:col-span-6 relative aspect-[4/3] rounded-card overflow-hidden p-2 border border-[#D4AF37]/40 bg-[#FAF0E4] shadow-xl">
              <div className="relative w-full h-full rounded-xs overflow-hidden">
                <Image
                  src="/images/journal/anatomy-temple-necklace.jpg"
                  alt="Crafted from Culture flatlay"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

            {/* Right Copy */}
            <div className="lg:col-span-6 space-y-7">
              <span className="font-sans text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-gold-700)] block">
                ✦ OUR ATELIER HERITAGE ✦
              </span>
              <h2 className="font-serif text-[36px] sm:text-[48px] text-[var(--color-text-900)] leading-tight font-medium">
                Crafted from Culture. <br />
                <span className="font-italic font-normal">Designed for Queens.</span>
              </h2>
              <p className="font-sans text-[15px] sm:text-[17px] text-[var(--color-text-700)] leading-relaxed">
                Adi Parva brings ancient artistry into modern elegance. Every piece tells a story of timeless beauty, tradition and royalty forged by master artisans in historical temple guilds.
              </p>
              <div className="pt-2">
                <Link
                  href="/heritage"
                  className="inline-flex h-[48px] px-8 bg-foil-gold text-[#120A05] font-sans text-[11px] font-bold uppercase tracking-[0.18em] rounded-xs hover:brightness-110 transition-all items-center justify-center shadow-md"
                >
                  READ OUR JOURNEY
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 6. BESTSELLERS */}
        <section className="py-20 bg-[var(--color-cream-100)] border-y border-[var(--color-cream-200)]">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="font-sans text-[11px] uppercase tracking-[0.2em] font-semibold text-[var(--color-gold-700)] block">
                  ✦ MOST RESERVED ✦
                </span>
                <h2 className="font-serif text-[30px] sm:text-[40px] text-[var(--color-text-900)] font-medium tracking-tight">
                  BESTSELLERS
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollBestsellers('left')}
                    className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-cream-300)] flex items-center justify-center text-[var(--color-text-700)] hover:border-[var(--color-gold-600)] hover:text-[var(--color-gold-600)] transition-all cursor-pointer shadow-xs"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => scrollBestsellers('right')}
                    className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-cream-300)] flex items-center justify-center text-[var(--color-text-700)] hover:border-[var(--color-gold-600)] hover:text-[var(--color-gold-600)] transition-all cursor-pointer shadow-xs"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-none pb-4 snap-x snap-mandatory"
            >
              {bestsellers.map((product) => (
                <div key={product.id} className="snap-start shrink-0 w-[270px] sm:w-[300px]">
                  <ProductCard product={product} showRating />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. BRIDAL COLLECTION BANNER — Deep Espresso & Gold Sheen */}
        <section className="relative w-full bg-[#120A05] text-[#FDF7EF] py-24 overflow-hidden border-y border-[#D4AF37]/30">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <span className="font-sans text-[11px] font-bold uppercase tracking-[0.22em] text-[#D4AF37] block">
                ✦ FOR WEDDINGS WRITTEN IN GOLD ✦
              </span>
              <h2 className="font-serif text-[42px] sm:text-[56px] text-[#FDF7EF] font-medium leading-tight">
                Bridal Collection
              </h2>
              <p className="font-sans text-[16px] sm:text-[18px] text-[#E6D5BF]/85 max-w-[48ch] mx-auto lg:mx-0 leading-relaxed">
                Exquisite jewellery for your most precious moments. Complete ceremonial ensembles of harams, chokers, matha patti, and waist belts.
              </p>
              <div className="pt-4">
                <Link
                  href="/collections/bridal-sets"
                  className="inline-flex h-[52px] px-9 bg-foil-gold text-[#120A05] font-sans text-[12px] font-bold uppercase tracking-[0.18em] rounded-xs hover:brightness-110 transition-all items-center justify-center shadow-royal-gold"
                >
                  EXPLORE BRIDAL SETS
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5 relative aspect-[4/3] rounded-card overflow-hidden p-2 border-gold-glow bg-[#1C0F07]">
              <div className="relative w-full h-full rounded-xs overflow-hidden">
                <Image
                  src="/images/categories/bridal-sets.jpg"
                  alt="Bridal Jewellery Set"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 8. NEWSLETTER */}
        <section className="py-24 bg-[var(--color-cream-50)]">
          <div className="max-w-[540px] mx-auto px-6 text-center space-y-6">
            <div className="w-12 h-12 rounded-full bg-[var(--color-gold-100)] border border-[var(--color-gold-500)]/40 flex items-center justify-center mx-auto text-[var(--color-gold-600)]">
              ✦
            </div>
            <h2 className="font-serif text-[32px] sm:text-[40px] text-[var(--color-text-900)] font-medium">
              JOIN THE ROYAL CIRCLE
            </h2>
            <p className="font-sans text-[14px] sm:text-[15px] text-[var(--color-text-500)] leading-relaxed">
              Receive quiet dispatches on antique stone acquisitions, craft heritage notes, and private collection unveilings.
            </p>

            {newsletterSubmitted ? (
              <p className="font-sans text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--color-gold-700)] pt-4">
                You're subscribed to the Royal Circle.
              </p>
            ) : (
              <form onSubmit={handleNewsletter} className="flex gap-2 max-w-[440px] mx-auto pt-3">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 bg-[var(--color-cream-100)] border border-[var(--color-cream-300)] focus:border-[var(--color-gold-600)] text-sm text-[var(--color-text-900)] placeholder-[var(--color-text-400)] px-4 py-3.5 outline-none rounded-xs font-sans"
                />
                <button
                  type="submit"
                  className="h-[48px] px-7 bg-[var(--color-gold-600)] text-white font-sans text-[11px] font-bold uppercase tracking-[0.18em] rounded-xs hover:bg-[var(--color-gold-700)] transition-colors cursor-pointer shadow-xs"
                >
                  SUBSCRIBE
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
