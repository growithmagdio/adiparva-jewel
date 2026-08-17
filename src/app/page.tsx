'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  BicameralHeading,
  MicroLabel,
  ArchFrame,
  Button,
  ProductCardSkeleton,
} from '@/components/primitives';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { ProductCard } from '@/components/storefront/product-card';
import {
  getProducts,
  getCategories,
  getJournalArticles,
  getHeroSlides,
} from '@/lib/data/queries';
import { Product, Category, JournalArticle, HeroSlide } from '@/lib/data/types';
import { ArrowRight, ChevronRight, Star, Hammer, Sparkles, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const [heroSlide, setHeroSlide] = React.useState<HeroSlide | null>(null);
  const [masterpieces, setMasterpieces] = React.useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [articles, setArticles] = React.useState<JournalArticle[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadHomeData() {
      setLoading(true);
      try {
        const [slidesData, productsData, catData, journalData] = await Promise.all([
          getHeroSlides(),
          getProducts({ status: 'live' }),
          getCategories(),
          getJournalArticles(),
        ]);

        if (slidesData && slidesData.length > 0) {
          setHeroSlide(slidesData[0]);
        }

        if (productsData) {
          setMasterpieces(productsData.filter((p) => p.collectionTag === 'Masterpiece'));
          setNewArrivals(productsData.slice(0, 8));
        }

        if (catData) {
          setCategories(catData.slice(0, 4));
        }

        if (journalData) {
          setArticles(journalData.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const signatureCategories = [
    {
      title: 'TEMPLE',
      description: 'Hand-hammered 22K gold repoussé inspired by sacred South Indian gopurams.',
      slug: 'temple-jewellery',
      image: '/images/categories/temple-jewellery.jpg',
    },
    {
      title: 'KUNDAN',
      description: 'Pure foil stone setting refined across centuries of royal North Indian workshops.',
      slug: 'kundan',
      image: '/images/categories/kundan.jpg',
    },
    {
      title: 'POLKI',
      description: 'Uncut natural diamond heirlooms set in traditional 22K gold frames.',
      slug: 'polki',
      image: '/images/categories/kundan.jpg',
    },
    {
      title: 'HERITAGE',
      description: 'Historic Kasu coin mala, Oddiyanam waist belts, and rare antique parures.',
      slug: 'bridal-sets',
      image: '/images/categories/bridal-sets.jpg',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-cream-100)] text-[var(--color-text-700)] flex flex-col font-sans">
      {/* 1. Navbar & Top Announcement Bar */}
      <Header />

      <main className="flex-1 space-y-24 sm:space-y-32 pb-20">
        {/* 2. Hero Section (48% Left / 52% Right Split Layout, Min Height calc(100vh - 108px)) */}
        <section className="min-h-[calc(100vh-108px)] flex items-center max-w-[1440px] mx-auto px-6 sm:px-8 py-8 sm:py-12">
          <div className="w-full grid grid-cols-1 lg:grid-cols-10 gap-12 lg:gap-16 items-center">
            {/* Left 48% (4.8 cols) Content */}
            <div className="lg:col-span-5 space-y-6 sm:space-y-8">
              <MicroLabel className="text-[var(--color-gold-600)] text-[11px] tracking-[0.2em]">
                {heroSlide?.eyebrow || 'EST. IN THE TRADITION OF THE SOUTH'}
              </MicroLabel>

              <div className="space-y-3">
                <BicameralHeading
                  italicPart={heroSlide?.headingItalic || 'Adi'}
                  romanPart={heroSlide?.headingRoman || 'Parva'}
                  size="xl"
                />
                <p className="font-sans text-base sm:text-lg text-[var(--color-text-700)] leading-relaxed max-w-xl">
                  {heroSlide?.body ||
                    'Custodians of South Indian temple gold, Kundan, and royal Polki heirlooms crafted by hereditary artisan guilds.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href={heroSlide?.ctaHref || '/collections'}>
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4.5 h-4.5" />}>
                    {heroSlide?.ctaLabel || 'SEE THE COLLECTION'}
                  </Button>
                </Link>

                <Link href="/heritage">
                  <Button variant="ghost" size="lg">
                    READ OUR STORY
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right 52% (5.2 cols) Hero Image (Never Empty, Full Coverage) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <ArchFrame ratio="portrait" className="w-full max-w-[480px] aspect-[4/5] shadow-2xl">
                <ImageWithFallback
                  src={heroSlide?.image || '/images/hero/hero-temple-necklace.jpg'}
                  alt="Maharani Temple Gold Necklace"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 480px"
                  className="object-cover"
                />
              </ArchFrame>
            </div>
          </div>
        </section>

        {/* 3. Signature Collections (Section 17 - 4 Large Cards) */}
        <section className="max-w-[1440px] mx-auto px-6 sm:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <MicroLabel className="text-[var(--color-gold-600)]">HERITAGE REPOSITORY</MicroLabel>
            <BicameralHeading italicPart="The Signature" romanPart="Collections" size="lg" align="center" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {signatureCategories.map((cat) => (
              <Link key={cat.title} href={`/collections/${cat.slug}`} className="group block">
                <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] hover:border-[var(--color-gold-500)] rounded-[var(--radius-card)] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full">
                  <div className="relative aspect-[4/5] bg-[var(--color-cream-100)] overflow-hidden">
                    <ImageWithFallback
                      src={cat.image}
                      alt={cat.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-5 space-y-2 flex-1 flex flex-col justify-between border-t border-[var(--color-cream-200)]">
                    <div>
                      <h4 className="font-serif font-medium text-xl text-[var(--color-text-900)] group-hover:text-[var(--color-gold-600)] transition-colors">
                        {cat.title}
                      </h4>
                      <p className="text-xs font-sans text-[var(--color-text-500)] mt-1 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>

                    <div className="pt-3 flex items-center gap-1 text-xs font-sans font-semibold uppercase tracking-wider text-[var(--color-gold-600)] group-hover:text-[var(--color-gold-700)]">
                      <span>EXPLORE</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. Featured Jewellery (Section 18 - The House Edit) */}
        <section className="max-w-[1440px] mx-auto px-6 sm:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[var(--color-cream-200)] pb-4">
            <div>
              <MicroLabel className="text-[var(--color-gold-600)] mb-1">CURATED SELECTION</MicroLabel>
              <BicameralHeading italicPart="The House" romanPart="Edit" size="lg" />
              <p className="text-xs font-sans text-[var(--color-text-500)] mt-1">
                Pieces chosen for their enduring beauty and unmistakable character.
              </p>
            </div>

            <Link
              href="/collections"
              className="inline-flex items-center gap-1 font-sans text-xs uppercase tracking-widest text-[var(--color-gold-600)] hover:text-[var(--color-gold-700)] font-semibold"
            >
              <span>View all pieces</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {masterpieces.slice(0, 4).map((piece) => (
                <ProductCard key={piece.id} product={piece} />
              ))}
            </div>
          )}
        </section>

        {/* 5. Temple Gold Editorial Banner (Section 20 - Dark Brown Full Width) */}
        <section className="w-full bg-[var(--color-ink-900)] text-[var(--color-cream-100)] py-20 px-6 select-none border-y border-[var(--color-gold-700)]/30">
          <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Banner Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <MicroLabel className="text-[var(--color-gold-500)]">TEMPLE GOLD</MicroLabel>
              <h2 className="font-serif italic font-normal text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
                &ldquo;Where devotion becomes adornment.&rdquo;
              </h2>
              <p className="font-sans text-sm sm:text-base text-[var(--color-cream-300)]/80 leading-relaxed max-w-xl">
                Every temple necklace and kasu haaram begins as a solid gold bullion bar, beaten by hand into repoussé sheets before being engraved with sacred motifs.
              </p>
              <div>
                <Link href="/collections/temple-jewellery">
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    EXPLORE TEMPLE COLLECTION
                  </Button>
                </Link>
              </div>
            </div>

            {/* Banner Right Image */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <ArchFrame ratio="square" className="w-full max-w-[420px] aspect-square shadow-2xl">
                <ImageWithFallback
                  src="/images/categories/temple-jewellery.jpg"
                  alt="Temple Gold Adornment"
                  fill
                  sizes="(max-width: 768px) 100vw, 420px"
                  className="object-cover"
                />
              </ArchFrame>
            </div>
          </div>
        </section>

        {/* 6. Heritage Story (Section 21) */}
        <section className="max-w-[1440px] mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Story Left Image */}
            <div className="lg:col-span-6">
              <ArchFrame ratio="portrait" className="w-full max-w-[460px] aspect-[4/5] mx-auto shadow-xl">
                <ImageWithFallback
                  src="/images/craft/stage-2-nakashi.jpg"
                  alt="Master Artisan Craftsmanship"
                  fill
                  sizes="(max-width: 768px) 100vw, 460px"
                  className="object-cover"
                />
              </ArchFrame>
            </div>

            {/* Story Right Content */}
            <div className="lg:col-span-6 space-y-6">
              <MicroLabel className="text-[var(--color-gold-600)]">OUR HERITAGE</MicroLabel>
              <h2 className="font-serif font-medium text-3xl sm:text-4xl text-[var(--color-text-900)] leading-tight">
                Crafted by Hands.<br />Carried Through Generations.
              </h2>
              <p className="font-sans text-sm sm:text-base text-[var(--color-text-700)] leading-relaxed">
                Founded to preserve the endangered nakashi and jadau traditions of South India, Adi Parva works directly with hereditary sthapati families in Nagercoil, Madurai, and Vadasery.
              </p>
              <div className="pt-2">
                <Link href="/heritage">
                  <Button variant="secondary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    DISCOVER OUR STORY
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Kundan + Polki Split Editorial Section (Section 22) */}
        <section className="max-w-[1440px] mx-auto px-6 sm:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Kundan Card */}
            <div className="group relative bg-[var(--color-ink-900)] text-white rounded-[var(--radius-card)] overflow-hidden p-8 sm:p-12 min-h-[380px] flex flex-col justify-end">
              <ImageWithFallback
                src="/images/categories/kundan.jpg"
                alt="Kundan Craft"
                fill
                className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="relative z-10 space-y-3">
                <MicroLabel className="text-[var(--color-gold-400)]">ROYAL REPOSITORY</MicroLabel>
                <h3 className="font-serif text-3xl font-medium text-white">KUNDAN</h3>
                <p className="font-sans text-xs text-[var(--color-cream-300)] max-w-sm">
                  Pure gold foil stone settings inlaid with rubies, emeralds, and uncut gems.
                </p>
                <Link href="/collections/kundan" className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold uppercase tracking-wider text-[var(--color-gold-400)] group-hover:text-white pt-2">
                  <span>EXPLORE KUNDAN</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Polki Card */}
            <div className="group relative bg-[var(--color-ink-900)] text-white rounded-[var(--radius-card)] overflow-hidden p-8 sm:p-12 min-h-[380px] flex flex-col justify-end">
              <ImageWithFallback
                src="/images/categories/bridal-sets.jpg"
                alt="Polki Diamonds"
                fill
                className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="relative z-10 space-y-3">
                <MicroLabel className="text-[var(--color-gold-400)]">UNCUT DIAMONDS</MicroLabel>
                <h3 className="font-serif text-3xl font-medium text-white">POLKI</h3>
                <p className="font-sans text-xs text-[var(--color-cream-300)] max-w-sm">
                  Natural uncut diamonds set in traditional 22K yellow gold mountings.
                </p>
                <Link href="/collections/polki" className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold uppercase tracking-wider text-[var(--color-gold-400)] group-hover:text-white pt-2">
                  <span>EXPLORE POLKI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Craftsmanship Section (Section 23 - 3 Columns with Gold Icons) */}
        <section className="max-w-[1440px] mx-auto px-6 sm:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <MicroLabel className="text-[var(--color-gold-600)]">HERITAGE PILLARS</MicroLabel>
            <BicameralHeading italicPart="The Art" romanPart="of Craft" size="lg" align="center" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-8 rounded-[var(--radius-card)] space-y-4 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-[var(--color-gold-100)] text-[var(--color-gold-600)] flex items-center justify-center">
                <Hammer className="w-6 h-6" />
              </div>
              <MicroLabel className="text-[var(--color-gold-600)]">GUILD TRADITION</MicroLabel>
              <h4 className="font-serif text-xl font-medium text-[var(--color-text-900)]">HEREDITARY ARTISANS</h4>
              <p className="text-xs font-sans text-[var(--color-text-500)] leading-relaxed">
                Hand-hammered repoussé and engraving executed exclusively by fifth-generation master sthapatis.
              </p>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-8 rounded-[var(--radius-card)] space-y-4 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-[var(--color-gold-100)] text-[var(--color-gold-600)] flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <MicroLabel className="text-[var(--color-gold-600)]">ANCIENT BENCHWORK</MicroLabel>
              <h4 className="font-serif text-xl font-medium text-[var(--color-text-900)]">TRADITIONAL TECHNIQUES</h4>
              <p className="text-xs font-sans text-[var(--color-text-500)] leading-relaxed">
                Wax carving, pure gold foil jadau setting, and organic meenakari enamelling without modern synthetic substitutes.
              </p>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-8 rounded-[var(--radius-card)] space-y-4 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-[var(--color-gold-100)] text-[var(--color-gold-600)] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <MicroLabel className="text-[var(--color-gold-600)]">BIS CERTIFIED</MicroLabel>
              <h4 className="font-serif text-xl font-medium text-[var(--color-text-900)]">TIMELESS DETAIL</h4>
              <p className="text-xs font-sans text-[var(--color-text-500)] leading-relaxed">
                Every piece is 22K 916 BIS hallmarked and arrives accompanied by a permanent provenance deed.
              </p>
            </div>
          </div>
        </section>

        {/* 9. New Arrivals (Section 24) */}
        <section className="max-w-[1440px] mx-auto px-6 sm:px-8 space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <MicroLabel className="text-[var(--color-gold-600)]">RECENTLY UNVEILED</MicroLabel>
            <BicameralHeading italicPart="New" romanPart="From The House" size="lg" align="center" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* 10. Testimonials (Section 25) */}
        <section className="max-w-[1440px] mx-auto px-6 sm:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <MicroLabel className="text-[var(--color-gold-600)]">PATRON VOICES</MicroLabel>
            <BicameralHeading italicPart="Worn" romanPart="With Meaning" size="lg" align="center" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-8 rounded-[var(--radius-card)] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex gap-1 text-[var(--color-gold-500)]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[var(--color-gold-500)]" />
                  ))}
                </div>
                <p className="font-serif italic text-base text-[var(--color-text-900)] leading-relaxed">
                  &ldquo;The detailing on the Maharani Temple necklace feels like something meant to be passed down for generations.&rdquo;
                </p>
              </div>
              <div className="border-t border-[var(--color-cream-200)] pt-3 text-xs font-sans">
                <span className="font-semibold text-[var(--color-text-900)] block">Priya Sharma</span>
                <span className="text-[var(--color-text-500)]">Chennai, Tamil Nadu</span>
              </div>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-8 rounded-[var(--radius-card)] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex gap-1 text-[var(--color-gold-500)]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[var(--color-gold-500)]" />
                  ))}
                </div>
                <p className="font-serif italic text-base text-[var(--color-text-900)] leading-relaxed">
                  &ldquo;The uncut Polki stones match royal heirlooms. The armored transit delivery arrived perfectly on schedule.&rdquo;
                </p>
              </div>
              <div className="border-t border-[var(--color-cream-200)] pt-3 text-xs font-sans">
                <span className="font-semibold text-[var(--color-text-900)] block">Meera Nair</span>
                <span className="text-[var(--color-text-500)]">Bengaluru, Karnataka</span>
              </div>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-8 rounded-[var(--radius-card)] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex gap-1 text-[var(--color-gold-500)]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[var(--color-gold-500)]" />
                  ))}
                </div>
                <p className="font-serif italic text-base text-[var(--color-text-900)] leading-relaxed">
                  &ldquo;Acquired the Lakshmi Kasu Haaram for my daughter&apos;s wedding. The provenance scroll is a cherished document.&rdquo;
                </p>
              </div>
              <div className="border-t border-[var(--color-cream-200)] pt-3 text-xs font-sans">
                <span className="font-semibold text-[var(--color-text-900)] block">Anil Kapoor</span>
                <span className="text-[var(--color-text-500)]">Mumbai, Maharashtra</span>
              </div>
            </div>
          </div>
        </section>

        {/* 11. Editorial Journal (Section 26) */}
        <section className="max-w-[1440px] mx-auto px-6 sm:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[var(--color-cream-200)] pb-4">
            <div>
              <MicroLabel className="text-[var(--color-gold-600)] mb-1">EDITORIAL JOURNAL</MicroLabel>
              <BicameralHeading italicPart="Craft" romanPart="Dispatches" size="lg" />
            </div>

            <Link
              href="/journal"
              className="inline-flex items-center gap-1 font-sans text-xs uppercase tracking-widest text-[var(--color-gold-600)] hover:text-[var(--color-gold-700)] font-semibold"
            >
              <span>Read all articles</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((art) => (
              <article key={art.id} className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] rounded-[var(--radius-card)] overflow-hidden shadow-xs group">
                <Link href={`/journal/${art.slug}`} className="block relative aspect-[16/9] overflow-hidden bg-[var(--color-cream-100)]">
                  <ImageWithFallback
                    src={art.heroImage || '/images/journal/anatomy-temple-necklace.jpg'}
                    alt={art.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>

                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-sans text-[var(--color-text-500)]">
                    <MicroLabel className="text-[var(--color-gold-600)]">{art.category}</MicroLabel>
                    <span>{art.readTime}</span>
                  </div>

                  <Link href={`/journal/${art.slug}`}>
                    <h4 className="font-serif text-xl font-medium text-[var(--color-text-900)] group-hover:text-[var(--color-gold-600)] transition-colors line-clamp-2">
                      {art.title}
                    </h4>
                  </Link>

                  <p className="text-xs font-sans text-[var(--color-text-500)] line-clamp-2 leading-relaxed">
                    {art.excerpt}
                  </p>

                  <div className="pt-2">
                    <Link
                      href={`/journal/${art.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-sans font-semibold uppercase tracking-wider text-[var(--color-text-900)] group-hover:text-[var(--color-gold-600)] transition-colors"
                    >
                      <span>READ ARTICLE</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* 12. Footer */}
      <Footer />
    </div>
  );
}
