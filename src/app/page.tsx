'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Truck,
  Sparkles,
  Headphones,
  Award,
  Clock,
  Compass,
} from 'lucide-react';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { ProductCard } from '@/components/storefront/product-card';
import { GopuramArch } from '@/components/storefront/gopuram-arch';
import { KolamDivider } from '@/components/storefront/kolam-divider';
import { getProducts } from '@/lib/data/queries';
import { getInitialSeedData } from '@/lib/data/store';
import { Product } from '@/lib/data/types';

import { CornerFiligree } from '@/components/brand/corner-filigree';

function TempleGopuramIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M12 2v2M8 4h8l-1 4H9L8 4zM6 8h12l-1 4H7L6 8zM4 12h16l-1 5H5l-1-5zM3 17h18v4H3v-4z" />
      <path d="M10 21v-3h4v3" />
      <circle cx="12" cy="2" r="0.8" fill="currentColor" />
    </svg>
  );
}

function DiamondIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M6 3h12l4 7-10 11L2 10l4-7z" />
      <path d="M2 10h20M12 21L8 10l4-7 4 7-4 11" />
    </svg>
  );
}

function LotusIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M12 21c0-4.5 3.5-8 8-8-1.5 5.5-4.5 8-8 8z" />
      <path d="M12 21c0-4.5-3.5-8-8-8 1.5 5.5 4.5 8 8 8z" />
      <path d="M12 21c-2-6 0-14 0-14s2 8 0 14z" />
      <path d="M12 11c2.5-3 6-4 6-4s-1 4.5-3.5 6.5" />
      <path d="M12 11c-2.5-3-6-4-6-4s1 4.5 3.5 6.5" />
    </svg>
  );
}

export default function HomePage() {
  const [products, setProducts] = React.useState<Product[]>(() => {
    const store = getInitialSeedData();
    return store.products.filter((p) => p.status === 'live');
  });
  const [activeTab, setActiveTab] = React.useState<'all' | 'masterpiece' | 'new' | 'temple'>('all');
  const [newsletterEmail, setNewsletterEmail] = React.useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      const all = await getProducts({ status: 'live' });
      setProducts(all);
    }
    loadData();
  }, []);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;
    setNewsletterSubmitted(true);
  };

  // Six Core Collections exactly matching the reference screenshot
  const collections6 = [
    {
      name: 'Necklaces',
      slug: 'temple-jewellery',
      image: '/images/categories/necklaces-ref.jpg',
    },
    {
      name: 'Earrings',
      slug: 'jhumkas',
      image: '/images/categories/earrings-ref.jpg',
    },
    {
      name: 'Bangles',
      slug: 'bangles-kada',
      image: '/images/categories/bangles-ref.jpg',
    },
    {
      name: 'Vaddanams (Hip Belts)',
      slug: 'oddiyanam',
      image: '/images/categories/vaddanams-ref.jpg',
    },
    {
      name: 'Bridal Jewellery',
      slug: 'bridal-sets',
      image: '/images/categories/bridal-ref.jpg',
    },
    {
      name: 'Accessories',
      slug: 'maang-tikka-nath',
      image: '/images/categories/accessories-ref.jpg',
    },
  ];

  // Filter products based on active tab
  const filteredProducts = React.useMemo(() => {
    if (activeTab === 'masterpiece') {
      return products.filter((p) => p.collectionTag === 'Masterpiece').slice(0, 8);
    }
    if (activeTab === 'new') {
      return products.filter((p) => p.collectionTag === 'New arrival').slice(0, 8);
    }
    if (activeTab === 'temple') {
      return products.filter((p) => p.categoryId === 'cat-temple' || p.categoryId === 'temple-jewellery').slice(0, 8);
    }
    return products.slice(0, 8);
  }, [products, activeTab]);

  return (
    <div className="min-h-screen bg-[#FAF5EC] text-[#765E55] flex flex-col font-sans selection:bg-[#5B1018] selection:text-[#FAF5EC]">
      <Header />

      <main className="flex-1">
        {/* 1. CINEMATIC HOMEPAGE HERO (South Indian Temple Architecture + Vibrant Bridal Model) */}
        <section className="relative w-full min-h-[580px] sm:min-h-[640px] lg:min-h-[680px] xl:min-h-[720px] bg-[#2E070B] text-[#FAF5EC] overflow-hidden flex items-center border-b border-[#B68A3A]/25 select-none">
          {/* Full-width Cinematic Photography with South Indian Bride */}
          <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden">
            <Image
              src="/images/hero/hero-temple-bride.jpg"
              alt="South Indian Bride in Antique Temple Jewellery and Silk Saree"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[75%_center] sm:object-[70%_center] lg:object-[68%_center] xl:object-[65%_center]"
            />

            {/* 
              Targeted Burgundy Gradient Overlay:
              Concentrated ONLY on the left behind the text (0% to ~45%),
              feathering out smoothly to 0% opacity on the right so the bridal model,
              gold necklace, earrings, silk saree, and temple details remain 100% bright, warm, and sharp.
            */}
            {/* Desktop: Horizontal gradient from left */}
            <div className="absolute inset-0 hidden lg:block bg-gradient-to-r from-[#3B090D]/95 via-[#3B090D]/80 via-40% via-[#3B090D]/25 via-55% to-transparent to-65%" />

            {/* Tablet & Mobile: Balanced gradient protecting text while keeping model visible */}
            <div className="absolute inset-0 lg:hidden bg-gradient-to-t from-[#3B090D]/95 via-[#3B090D]/75 via-50% to-[#3B090D]/20" />
            <div className="absolute inset-0 lg:hidden bg-gradient-to-r from-[#3B090D]/85 via-[#3B090D]/50 to-transparent" />
          </div>

          {/* Warm Golden Ambient Glow behind Text */}
          <div className="absolute top-1/3 left-10 w-[480px] h-[480px] bg-[#B68A3A]/12 rounded-full blur-[110px] pointer-events-none" />

          {/* Ornamental Antique Gold Corner Filigrees (Top-Left & Bottom-Left) */}
          <CornerFiligree position="top-left" className="top-3 left-3 sm:top-5 sm:left-5 md:top-6 md:left-6" />
          <CornerFiligree position="bottom-left" className="bottom-3 left-3 sm:bottom-5 sm:left-5 md:bottom-6 md:left-6" />

          {/* Main Left-Aligned Hero Content */}
          <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-14 sm:py-20 lg:py-24 w-full relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[620px] space-y-6 sm:space-y-7 text-left"
            >
              {/* Eyebrow Micro-label */}
              <div className="inline-flex items-center gap-2.5 text-[#D7B56D] text-[11px] sm:text-[12px] font-sans tracking-[0.24em] uppercase font-semibold">
                <span className="text-[#B68A3A] text-xs">❖</span>
                <span>TIMELESS CRAFT. LIVING HERITAGE.</span>
                <span className="text-[#B68A3A] text-xs">❖</span>
              </div>

              {/* Major Editorial Headline (Two Lines: 'Temple of' in Ivory, 'Tradition' in Antique Gold) */}
              <h1 className="font-serif leading-[1.04] tracking-tight">
                <span className="block text-[48px] sm:text-[66px] lg:text-[84px] text-[#FAF5EC] font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                  Temple of
                </span>
                <span className="block text-[54px] sm:text-[74px] lg:text-[94px] font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#F7DA96] via-[#E5B869] to-[#B68A3A] drop-shadow-[0_4px_16px_rgba(182,138,58,0.35)] -mt-1 sm:-mt-2">
                  Tradition
                </span>
              </h1>

              {/* Supporting Text */}
              <p className="text-[15px] sm:text-[17px] text-[#FAF5EC]/90 leading-relaxed font-sans max-w-[46ch] drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                Discover handcrafted temple jewellery inspired by generations of artistry.
              </p>

              {/* Action Buttons (Solid Maroon + Transparent Gold Border) */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-5 pt-2">
                <Link
                  href="/collections"
                  className="h-[48px] sm:h-[52px] px-7 sm:px-8 bg-[#5B1018] text-[#FAF5EC] font-sans text-xs sm:text-[12.5px] uppercase tracking-[0.2em] font-semibold rounded-[2px] hover:bg-[#76252C] hover:border-[#D7B56D] transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg border border-[#76252C] group cursor-pointer hover:shadow-xl"
                >
                  <span>SHOP COLLECTION</span>
                  <span className="text-[#FAF5EC] group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <Link
                  href="/heritage"
                  className="h-[48px] sm:h-[52px] px-7 sm:px-8 border border-[#B68A3A] bg-[#3B090D]/40 backdrop-blur-xs text-[#FAF5EC] font-sans text-xs sm:text-[12.5px] uppercase tracking-[0.2em] font-semibold rounded-[2px] hover:bg-[#5B1018] hover:border-[#D7B56D] transition-all duration-300 flex items-center justify-center gap-2.5 group cursor-pointer hover:shadow-md"
                >
                  <span>EXPLORE OUR STORY</span>
                  <span className="text-[#D7B56D] group-hover:text-[#FAF5EC] group-hover:translate-x-1 transition-all">→</span>
                </Link>
              </div>

              {/* Three Verified Highlights with Thin Dividers */}
              <div className="pt-6 sm:pt-8 flex flex-wrap items-center gap-5 sm:gap-7 text-xs font-sans text-[#FAF5EC]">
                <div className="flex items-center gap-2.5">
                  <TempleGopuramIcon className="w-5 h-5 text-[#D7B56D] shrink-0" />
                  <span className="text-[10.5px] sm:text-[11px] font-semibold tracking-[0.16em] uppercase">
                    AUTHENTIC TEMPLE DESIGNS
                  </span>
                </div>
                <div className="h-6 w-[1px] bg-[#E7D7C0]/30 hidden sm:block" />
                <div className="flex items-center gap-2.5">
                  <DiamondIcon className="w-4 h-4 text-[#D7B56D] shrink-0" />
                  <span className="text-[10.5px] sm:text-[11px] font-semibold tracking-[0.16em] uppercase">
                    HANDCRAFTED BY ARTISANS
                  </span>
                </div>
                <div className="h-6 w-[1px] bg-[#E7D7C0]/30 hidden sm:block" />
                <div className="flex items-center gap-2.5">
                  <LotusIcon className="w-5 h-5 text-[#D7B56D] shrink-0" />
                  <span className="text-[10.5px] sm:text-[11px] font-semibold tracking-[0.16em] uppercase">
                    A LEGACY SINCE 1985
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2. SHOP BY COLLECTION (Directly below hero - Matching Reference Design) */}
        <section className="bg-[#FAF5EC] py-14 sm:py-16 lg:py-20 border-b border-[#E7D7C0]">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-8 space-y-10 sm:space-y-12">
            {/* Flanked Section Header */}
            <div className="text-center space-y-2.5">
              <div className="flex items-center justify-center gap-3 sm:gap-5 max-w-[560px] mx-auto select-none">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#B68A3A]" />
                <span className="text-[#B68A3A] text-sm">❖</span>
                <h2 className="font-serif text-[32px] sm:text-[40px] lg:text-[44px] font-normal text-[#5B1018] tracking-tight whitespace-nowrap">
                  Shop by Collection
                </h2>
                <span className="text-[#B68A3A] text-sm">❖</span>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#B68A3A]" />
              </div>
              <p className="text-[11px] sm:text-[12px] uppercase tracking-[0.26em] text-[#B68A3A] font-semibold font-sans">
                TRADITIONAL DESIGNS FOR EVERY OCCASION
              </p>
            </div>

            {/* 6-Across Responsive Grid: 6 on desktop, 3 on tablet, 2 on mobile */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5">
              {collections6.map((col) => (
                <Link
                  key={col.slug}
                  href={`/collections/${col.slug}`}
                  className="group flex flex-col bg-[#FFFFFF] border border-[#E7D7C0] rounded-[6px] overflow-hidden transition-all duration-300 hover:border-[#B68A3A] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(28,15,7,0.1)] cursor-pointer"
                >
                  {/* Top Image with clean rounded presentation */}
                  <div className="relative aspect-[4/3] w-full bg-[#F2E7D7] overflow-hidden">
                    <Image
                      src={col.image}
                      alt={col.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>

                  {/* Clean Bottom Label Bar */}
                  <div className="p-3 sm:p-3.5 flex items-center justify-between bg-[#FFFFFF] border-t border-[#E7D7C0]/60">
                    <span className="font-serif text-[14px] sm:text-[15px] lg:text-[15.5px] text-[#5B1018] group-hover:text-[#B68A3A] transition-colors font-medium truncate">
                      {col.name}
                    </span>
                    <span className="text-[#B68A3A] group-hover:text-[#5B1018] group-hover:translate-x-1 transition-all text-sm font-semibold shrink-0 ml-1">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 3. FEATURED PRODUCTS (CURATED FOR YOU) */}
        <section className="bg-[#F2E7D7]/50 py-20 border-b border-[#E7D7C0]">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-8 space-y-10">
            {/* Header + Tabs */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E7D7C0] pb-6">
              <div className="space-y-2">
                <div className="text-[11px] uppercase tracking-[0.28em] text-[#B68A3A] font-semibold">
                  HANDPICKED MASTERPIECES
                </div>
                <h2 className="font-serif text-[34px] sm:text-[44px] font-normal text-[#5B1018]">
                  CURATED FOR YOU
                </h2>
                <p className="text-[15px] text-[#765E55]">
                  Discover timeless pieces for every celebration.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: 'All Pieces' },
                  { id: 'masterpiece', label: 'Masterpieces' },
                  { id: 'new', label: 'New Arrivals' },
                  { id: 'temple', label: 'Temple Gold' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`h-9 px-4 rounded-[2px] text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-[#5B1018] text-[#FAF5EC] shadow-xs'
                        : 'bg-[#FAF5EC] text-[#5B1018] border border-[#E7D7C0] hover:border-[#B68A3A]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center pt-6">
              <Link
                href="/collections"
                className="h-12 px-8 inline-flex items-center justify-center gap-2 border border-[#B68A3A] text-[#5B1018] bg-[#FAF5EC] hover:bg-[#5B1018] hover:text-[#FAF5EC] font-sans text-xs uppercase tracking-[0.2em] font-semibold rounded-[2px] transition-all shadow-xs"
              >
                <span>VIEW COMPLETE TREASURY</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* 4. WHY CHOOSE ADIPARVA? (CUSTOMER TRUST SECTION) */}
        <section className="bg-[#FAF5EC] py-20 border-b border-[#E7D7C0]">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-8 space-y-12">
            <div className="text-center space-y-3">
              <KolamDivider />
              <div className="text-[11px] uppercase tracking-[0.3em] text-[#B68A3A] font-semibold">
                THE ADIPARVA ASSURANCE
              </div>
              <h2 className="font-serif text-[34px] sm:text-[44px] font-normal text-[#5B1018]">
                Why Choose Adiparva?
              </h2>
              <p className="text-[15px] text-[#765E55] max-w-[48ch] mx-auto font-sans">
                Every piece is an authentic temple artifact, created with uncompromised integrity.
              </p>
            </div>

            {/* 5 Verified Trust Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                {
                  icon: Sparkles,
                  title: 'Thoughtfully Crafted',
                  desc: 'Hereditary sthapati artisans sculpt each piece using ancient repoussé nakashi.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Secure Payments',
                  desc: '100% encrypted checkout with UPI, Cards, Net Banking, and COD.',
                },
                {
                  icon: Award,
                  title: 'Quality You Can Trust',
                  desc: '100% BIS hallmarked gold and certified authentic gemstones with certificates.',
                },
                {
                  icon: Headphones,
                  title: 'Dedicated Support',
                  desc: 'Personal WhatsApp concierge and expert styling guidance for your special day.',
                },
                {
                  icon: Truck,
                  title: 'Reliable Shipping',
                  desc: 'Insured, tamper-evident door-to-door express delivery across India.',
                },
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 bg-[#F2E7D7] border border-[#E7D7C0] rounded-[4px] space-y-3.5 text-center flex flex-col items-center justify-start hover:border-[#B68A3A] transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#FAF5EC] border border-[#B68A3A]/40 flex items-center justify-center text-[#B68A3A]">
                      <IconComponent className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <h3 className="font-serif text-[17px] text-[#5B1018] font-medium leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[13px] text-[#765E55] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. BRIDAL EDIT (Full-Width Rich Panel) */}
        <section className="relative bg-[#5B1018] text-[#FAF5EC] py-24 border-b border-[#B68A3A]/40 overflow-hidden">
          {/* Subtle Golden Pattern Background Overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D7B56D_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          <div className="max-w-[1440px] mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-block px-3 py-1 bg-[#3B090D] border border-[#B68A3A]/40 text-[11px] uppercase tracking-[0.28em] text-[#D7B56D] font-semibold rounded-full">
                FOR SACRED CELEBRATIONS
              </div>
              <h2 className="font-serif text-[38px] sm:text-[56px] font-normal leading-tight text-[#FAF5EC]">
                THE BRIDAL EDIT
              </h2>
              <p className="text-[16px] sm:text-[17px] text-[#FAF5EC]/90 leading-relaxed max-w-[50ch] mx-auto lg:mx-0 font-sans">
                Celebrate your special moments with jewellery inspired by timeless tradition. Grand tiered harams, temple chokers, and waist vaddanams passed down through generations.
              </p>
              <div className="pt-2">
                <Link
                  href="/collections/bridal-sets"
                  className="h-[52px] px-9 bg-[#FAF5EC] text-[#5B1018] font-sans text-xs uppercase tracking-[0.22em] font-semibold inline-flex items-center justify-center rounded-[2px] shadow-lg hover:bg-[#F2E7D7] transition-all cursor-pointer"
                >
                  SHOP BRIDAL COLLECTION
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div className="w-full max-w-[460px]">
                <GopuramArch
                  src="/images/hero/hero-kundan-bridal.jpg"
                  alt="Bridal Jewellery Ensemble Model"
                  aspect="portrait"
                  sizes="480px"
                  className="shadow-2xl border border-[#B68A3A]/60"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 6. BRAND STORY SECTION (Our Story & Heritage) */}
        <section className="relative bg-[#FAF5EC] py-24 border-b border-[#E7D7C0] overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Left Craft Image */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-[420px]">
                <GopuramArch
                  src="/images/craft/stage-2-nakashi.jpg"
                  alt="Antique Lakshmi Pendant Craftsmanship"
                  aspect="portrait"
                  sizes="450px"
                  className="shadow-xl border border-[#E7D7C0]"
                />
              </div>
            </div>

            {/* Right Story Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <KolamDivider className="lg:mx-0" />
              <div className="text-[11px] uppercase tracking-[0.28em] text-[#B68A3A] font-semibold">
                OUR STORY
              </div>
              <h2 className="font-serif text-[36px] sm:text-[48px] font-normal leading-tight text-[#5B1018]">
                Crafted from Culture. Designed for <span className="italic text-[#B68A3A]">Queens</span>.
              </h2>
              <div className="space-y-4 text-[15px] sm:text-[16px] text-[#765E55] leading-relaxed max-w-[58ch] font-sans">
                <p>
                  Named after the first book of the Mahabharata, Adi Parva is born from the sacred temple towns of South India. We partner directly with hereditary sthapati artisan guilds who have preserved hand-repoussé (nakashi) techniques for centuries.
                </p>
                <p>
                  Every ornament is rubbed with natural terracotta paste to give it the distinctive antique reddish patina of museum-held treasury artifacts. We keep pieces, we do not merely sell them.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/heritage"
                  className="h-[48px] px-8 border border-[#B68A3A] text-[#5B1018] bg-[#F2E7D7] font-sans text-xs uppercase tracking-[0.2em] inline-flex items-center justify-center hover:bg-[#5B1018] hover:text-[#FAF5EC] transition-all rounded-[2px] font-semibold shadow-xs"
                >
                  EXPLORE OUR STORY
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 7. PATRON TESTIMONIALS */}
        <section className="bg-[#F2E7D7]/40 py-20 border-b border-[#E7D7C0]">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-8 space-y-12">
            <div className="text-center space-y-3">
              <KolamDivider />
              <div className="text-[11px] uppercase tracking-[0.3em] text-[#B68A3A] font-semibold">
                WORDS OF PATRONAGE
              </div>
              <h2 className="font-serif text-[34px] sm:text-[44px] font-normal text-[#5B1018]">
                Cherished by Families
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote:
                    'The Maharani Temple Necklace feels like wearing a sanctified heirloom. The weight, the unheated rubies, and the reddish patina exceed luxury museum grade.',
                  name: 'Priya Sharma',
                  city: 'Chennai',
                },
                {
                  quote:
                    'Adi Parva’s Kundan setting is extraordinary. Every stone rests snugly in pure gold leaf without any cloudiness. My daughter’s bridal set was the highlight of our wedding.',
                  name: 'Dr. Meera Nair',
                  city: 'Coimbatore',
                },
                {
                  quote:
                    'Ordered the Royal Peacock Jhumkas for Navaratri. The seed pearl clusters dance gracefully with every turn. Arrived in a velvet-lined rosewood box.',
                  name: 'Ananya Sundaram',
                  city: 'Madurai',
                },
              ].map((t, idx) => (
                <div
                  key={idx}
                  className="bg-[#FAF5EC] p-8 border border-[#E7D7C0] rounded-[4px] space-y-6 relative flex flex-col justify-between shadow-xs hover:border-[#B68A3A] transition-colors"
                >
                  <div className="space-y-4">
                    <span className="font-serif text-[44px] leading-none text-[#B68A3A] block">
                      “
                    </span>
                    <p className="text-[15px] italic text-[#5B1018] leading-relaxed">
                      {t.quote}
                    </p>
                  </div>
                  <div className="space-y-1 border-t border-[#E7D7C0] pt-4">
                    <div className="flex text-[12px] text-[#B68A3A] tracking-widest">
                      ★★★★★
                    </div>
                    <div className="font-sans text-[13px] uppercase tracking-[0.16em] text-[#5B1018] font-bold">
                      {t.name}
                    </div>
                    <div className="text-[12px] text-[#765E55]">
                      {t.city}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. NEWSLETTER SIGNUP */}
        <section className="bg-[#FAF5EC] py-20 border-b border-[#E7D7C0] text-center">
          <div className="max-w-[640px] mx-auto px-6 space-y-5">
            <KolamDivider />
            <h2 className="font-serif text-[34px] sm:text-[42px] font-normal text-[#5B1018]">
              Join the Royal Register
            </h2>
            <p className="text-[15px] text-[#765E55] leading-relaxed">
              Receive private invitations to new archive collections, bridal previews, and confidential seasonal dispatches.
            </p>

            {newsletterSubmitted ? (
              <p className="text-[13px] uppercase tracking-[0.2em] text-[#B68A3A] pt-4 font-semibold">
                ✦ YOU ARE SUBSCRIBED TO THE ADIPARVA REGISTER ✦
              </p>
            ) : (
              <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row items-center gap-3 pt-4 max-w-[480px] mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full bg-[#FAF5EC] border-b border-[#B68A3A] focus:border-[#5B1018] text-[15px] text-[#5B1018] placeholder-[#765E55]/60 py-3 outline-none transition-colors font-sans"
                  required
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto h-[46px] px-8 bg-[#5B1018] text-[#FAF5EC] font-sans text-xs uppercase tracking-[0.2em] font-semibold shrink-0 rounded-[2px] shadow-sm hover:bg-[#3B090D] cursor-pointer"
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
