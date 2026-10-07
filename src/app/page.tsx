'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { ProductCard } from '@/components/storefront/product-card';
import { GopuramArch } from '@/components/storefront/gopuram-arch';
import { KolamDivider } from '@/components/storefront/kolam-divider';
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
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;
    setNewsletterSubmitted(true);
  };

  // Six Vitrines Categories
  const categories6 = [
    { name: 'NECKLACES', count: '32 Plates', slug: 'temple-jewellery', image: '/images/categories/temple-jewellery.jpg' },
    { name: 'HARAMS', count: '18 Plates', slug: 'haarams', image: '/images/categories/haarams.jpg' },
    { name: 'EARRINGS', count: '29 Plates', slug: 'jhumkas', image: '/images/categories/jhumkas.jpg' },
    { name: 'BANGLES', count: '24 Plates', slug: 'bangles-kada', image: '/images/categories/bangles-kada.jpg' },
    { name: 'BROOCHES', count: '12 Plates', slug: 'maang-tikka-nath', image: '/images/categories/maang-tikka-nath.jpg' },
    { name: 'ANTIQUE SETS', count: '15 Plates', slug: 'kundan', image: '/images/categories/kundan.jpg' },
  ];

  return (
    <div className="min-h-screen bg-[#FBF7EE] text-[#2A1E17] flex flex-col font-sans selection:bg-[#5C1A1B] selection:text-[#FBF7EE]">
      <Header />

      <main className="flex-1">
        {/* 3. HERO SECTION (100vh Split Layout) */}
        <section className="relative min-h-[calc(100vh-120px)] w-full bg-[#FBF7EE] text-[#2A1E17] overflow-hidden flex items-center border-b border-[#E2D6BC]">
          {/* Ambient Glows */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-[#B8923A]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-1/3 w-[400px] h-[400px] bg-[#5C1A1B]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Faint Gold Dust Effect */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#8A6A1F_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />

          <div className="max-w-[1440px] mx-auto px-6 sm:px-8 py-12 lg:py-0 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full relative z-10">
            {/* Left Column Over Light Negative Space */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 font-marcellus text-[11px] uppercase tracking-[0.35em] text-[#8A6A1F] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#8A6A1F] animate-pulse" />
                <span>THE TEMPLE OF TRADITION</span>
              </div>

              <h1 className="font-serif text-[48px] sm:text-[68px] lg:text-[88px] leading-[1.05] tracking-tight text-[#2A1E17]">
                Jewels of a Thousand-Year <em className="italic font-light text-[#8A6A1F]">Dynasty</em>
              </h1>

              <p className="font-jost text-[15px] sm:text-[17px] text-[#6B5B4E] max-w-[50ch] mx-auto lg:mx-0 leading-relaxed font-light">
                Handcrafted antique jewellery, made the way temple artisans always made it. Preserved in living archive vitrines for royal adornment.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 pt-4">
                <Link
                  href="/collections"
                  className="h-[52px] px-8 bg-[#5C1A1B] text-[#FBF7EE] font-marcellus text-[11px] uppercase tracking-[0.3em] font-semibold rounded-[2px] hover:bg-[#441213] transition-all flex items-center justify-center shadow-md cursor-pointer"
                >
                  ENTER THE TREASURY
                </Link>
                <Link
                  href="/collections/bridal-sets"
                  className="h-[52px] px-8 border border-[#E2D6BC] bg-[#F4EEDF] text-[#2A1E17] font-marcellus text-[11px] uppercase tracking-[0.3em] font-medium rounded-[2px] hover:border-[#8A6A1F] transition-all flex items-center justify-center"
                >
                  THE BRIDAL EDIT
                </Link>
              </div>
            </motion.div>

            {/* Right Column — Gopuram Arch Hero Vitrine */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex justify-center lg:justify-end"
            >
              <div className="w-full max-w-[440px] sm:max-w-[480px]">
                <GopuramArch
                  src="/images/hero/hero-temple-necklace.jpg"
                  alt="South Indian Temple Jewellery Model"
                  aspect="portrait"
                  priority
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="shadow-xl border border-[#E2D6BC]"
                />
              </div>
            </motion.div>
          </div>

          {/* Thin Scroll Cue Line */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none opacity-60">
            <span className="font-marcellus text-[9px] uppercase tracking-[0.3em] text-[#8A6A1F]">
              SCROLL TO DISCOVER
            </span>
            <div className="w-[1px] h-8 bg-gradient-to-b from-[#8A6A1F] to-transparent" />
          </div>
        </section>


        {/* 5. SHOP BY CATEGORY — "THE SIX VITRINES" */}
        <section className="bg-[#FBF7EE] py-20 border-b border-[#E2D6BC]">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-8 space-y-12">
            <div className="text-center space-y-3">
              <KolamDivider />
              <div className="font-marcellus text-[11px] uppercase tracking-[0.35em] text-[#8A6A1F] font-semibold">
                THE COLLECTION
              </div>
              <h2 className="font-serif text-[36px] sm:text-[48px] font-light text-[#2A1E17]">
                Shop by <em className="italic text-[#8A6A1F] font-normal">Category</em>
              </h2>
            </div>

            {/* Desktop 6-Across Grid / Mobile Snap-Scroll */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 overflow-x-auto pb-4 scrollbar-none">
              {categories6.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/collections/${cat.slug}`}
                  className="group flex flex-col items-center text-center space-y-3 shrink-0 cursor-pointer"
                >
                  <GopuramArch
                    src={cat.image}
                    alt={cat.name}
                    aspect="portrait"
                    sizes="240px"
                    className="w-full shadow-md"
                  />
                  <div className="space-y-0.5">
                    <h3 className="font-marcellus text-[12px] uppercase tracking-[0.25em] text-[#2A1E17] group-hover:text-[#8A6A1F] transition-colors font-medium">
                      {cat.name}
                    </h3>
                    <p className="font-jost text-[12px] text-[#6B5B4E]">
                      {cat.count}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 6. NEW ARRIVALS — Sanctum Ground & Archive Plates */}
        <section className="bg-[#F4EEDF] py-20 border-b border-[#E2D6BC]">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-8 space-y-12">
            <div className="flex flex-col sm:flex-row items-end justify-between gap-4 border-b border-[#E2D6BC] pb-6">
              <div>
                <div className="font-marcellus text-[11px] uppercase tracking-[0.35em] text-[#8A6A1F] font-semibold">
                  FRESH FROM THE ATELIER
                </div>
                <h2 className="font-serif text-[36px] sm:text-[48px] font-light text-[#2A1E17]">
                  New <em className="italic text-[#8A6A1F] font-normal">Arrivals</em>
                </h2>
              </div>
              <Link
                href="/collections"
                className="font-marcellus text-[11px] uppercase tracking-[0.3em] text-[#8A6A1F] hover:text-[#5C1A1B] flex items-center gap-2 transition-colors font-semibold"
              >
                <span>VIEW THE ARCHIVE</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 4-Across Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* 7. STORY SPLIT — Heritage & Tamil Watermark */}
        <section className="relative bg-[#FBF7EE] py-24 border-b border-[#E2D6BC] overflow-hidden">
          {/* Tamil Watermark Overlay "ஆதி பர்வா" */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
            <span className="font-serif text-[180px] sm:text-[260px] text-[#8A6A1F]/10 tracking-widest whitespace-nowrap">
              ஆதி பர்வா
            </span>
          </div>

          <div className="max-w-[1440px] mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Left Image inside Arch Vitrine */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-[420px]">
                <GopuramArch
                  src="/images/craft/stage-2-nakashi.jpg"
                  alt="Antique Lakshmi Pendant Craftsmanship"
                  aspect="portrait"
                  sizes="450px"
                  className="shadow-xl border border-[#E2D6BC]"
                />
              </div>
            </div>

            {/* Right Text Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <KolamDivider className="lg:mx-0" />
              <div className="font-marcellus text-[11px] uppercase tracking-[0.35em] text-[#8A6A1F] font-semibold">
                OUR HERITAGE
              </div>
              <h2 className="font-serif text-[36px] sm:text-[52px] font-light leading-tight text-[#2A1E17]">
                Crafted from Culture. Designed for <em className="italic text-[#8A6A1F] font-normal">Queens</em>.
              </h2>
              <div className="space-y-4 font-jost text-[15px] sm:text-[16px] text-[#6B5B4E] leading-relaxed font-light max-w-[58ch]">
                <p>
                  Named after the first book of the Mahabharata, Adi Parva is born from the sacred temple towns of Tamil Nadu. We work directly with sthapati artisan families who have preserved hand-repoussé (nakashi) techniques for over seven centuries.
                </p>
                <p>
                  Every piece is hand-rubbed with natural terracotta paste to give it the distinctive antique reddish patina of museum-held treasury artifacts. We keep pieces, we do not merely sell them.
                </p>
              </div>
              <div className="pt-4">
                <Link
                  href="/heritage"
                  className="h-[48px] px-8 border border-[#8A6A1F] text-[#2A1E17] bg-[#F4EEDF] font-marcellus text-[11px] uppercase tracking-[0.3em] inline-flex items-center justify-center hover:bg-[#5C1A1B] hover:text-[#FBF7EE] transition-all rounded-[2px] font-medium"
                >
                  READ OUR JOURNEY
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 8. BESTSELLERS — Horizontal Carousel */}
        <section className="bg-[#F4EEDF] py-20 border-b border-[#E2D6BC]">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-8 space-y-10">
            <div className="flex items-end justify-between border-b border-[#E2D6BC] pb-6">
              <div>
                <div className="font-marcellus text-[11px] uppercase tracking-[0.35em] text-[#8A6A1F] font-semibold">
                  MOST CHERISHED PLATES
                </div>
                <h2 className="font-serif text-[36px] sm:text-[48px] font-light text-[#2A1E17]">
                  The <em className="italic text-[#8A6A1F] font-normal">Bestsellers</em>
                </h2>
              </div>
              {/* Carousel Controls */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => scrollBestsellers('left')}
                  className="w-10 h-10 border border-[#8A6A1F] rounded-full flex items-center justify-center text-[#8A6A1F] hover:bg-[#5C1A1B] hover:text-[#FBF7EE] transition-all cursor-pointer"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollBestsellers('right')}
                  className="w-10 h-10 border border-[#8A6A1F] rounded-full flex items-center justify-center text-[#8A6A1F] hover:bg-[#5C1A1B] hover:text-[#FBF7EE] transition-all cursor-pointer"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Horizontal Scroll Track */}
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory"
            >
              {bestsellers.map((product) => (
                <div key={product.id} className="w-[280px] sm:w-[320px] shrink-0 snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. BRIDAL FEATURE — Full-Width Deep Maroon Panel */}
        <section className="relative bg-[#5C1A1B] text-[#FBF7EE] py-24 border-b border-[#B8923A]/40 overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="font-marcellus text-[11px] uppercase tracking-[0.35em] text-[#B8923A] font-semibold">
                FOR WEDDINGS WRITTEN IN GOLD
              </div>
              <h2 className="font-serif text-[40px] sm:text-[60px] font-light leading-tight text-[#FBF7EE]">
                The Bridal <em className="italic text-[#B8923A] font-normal">Collection</em>
              </h2>
              <p className="font-jost text-[16px] text-[#FBF7EE]/90 leading-relaxed max-w-[48ch] mx-auto lg:mx-0 font-light">
                Exquisite grand ensembles crafted for the most sacred and precious day of all. Tiered harams, temple chokers, and waist vaddanams passed down through generations.
              </p>
              <div className="pt-4">
                <Link
                  href="/collections/bridal-sets"
                  className="h-[52px] px-9 bg-[#FBF7EE] text-[#5C1A1B] font-marcellus text-[11px] uppercase tracking-[0.3em] font-semibold inline-flex items-center justify-center rounded-[2px] shadow-xl hover:bg-[#F4EEDF] transition-all cursor-pointer"
                >
                  EXPLORE BRIDAL SETS
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
                  className="shadow-2xl border border-[#B8923A]/60"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 10. TESTIMONIALS — Words from the Royal Circle */}
        <section className="bg-[#FBF7EE] py-20 border-b border-[#E2D6BC]">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-8 space-y-12">
            <div className="text-center space-y-3">
              <KolamDivider />
              <div className="font-marcellus text-[11px] uppercase tracking-[0.35em] text-[#8A6A1F] font-semibold">
                PATRON TESTIMONIALS
              </div>
              <h2 className="font-serif text-[36px] sm:text-[48px] font-light text-[#2A1E17]">
                Words from the <em className="italic text-[#8A6A1F] font-normal">Royal Circle</em>
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
                  className="bg-[#F4EEDF] p-8 border border-[#E2D6BC] rounded-[4px] space-y-6 relative flex flex-col justify-between shadow-sm"
                >
                  <div className="space-y-4">
                    <span className="font-serif text-[48px] leading-none text-[#8A6A1F] block">
                      “
                    </span>
                    <p className="font-jost text-[15px] italic text-[#2A1E17] leading-relaxed font-light">
                      {t.quote}
                    </p>
                  </div>
                  <div className="space-y-1 border-t border-[#E2D6BC] pt-4">
                    <div className="flex text-[11px] text-[#8A6A1F] tracking-widest">
                      ★★★★★
                    </div>
                    <div className="font-marcellus text-[12px] uppercase tracking-[0.2em] text-[#2A1E17] font-semibold">
                      {t.name}
                    </div>
                    <div className="font-jost text-[12px] text-[#6B5B4E]">
                      {t.city}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 11. NEWSLETTER — Join the Royal Circle */}
        <section className="bg-[#F4EEDF] py-20 border-b border-[#E2D6BC] text-center">
          <div className="max-w-[640px] mx-auto px-6 space-y-6">
            <KolamDivider />
            <h2 className="font-serif text-[36px] sm:text-[44px] font-light text-[#2A1E17]">
              Join the <em className="italic text-[#8A6A1F] font-normal">Royal Circle</em>
            </h2>
            <p className="font-jost text-[15px] text-[#6B5B4E] font-light leading-relaxed">
              Receive private invitations to new archive plate drops, bridal collection previews, and confidential seasonal dispatches.
            </p>

            {newsletterSubmitted ? (
              <p className="font-marcellus text-[13px] uppercase tracking-[0.25em] text-[#8A6A1F] pt-4 font-semibold">
                ✦ YOU ARE REGISTERED IN THE ROYAL REGISTER ✦
              </p>
            ) : (
              <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row items-center gap-4 pt-4 max-w-[480px] mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-[#8A6A1F] focus:border-[#5C1A1B] text-[15px] text-[#2A1E17] placeholder-[#6B5B4E]/60 py-3 outline-none transition-colors font-jost"
                  required
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto h-[46px] px-8 bg-[#5C1A1B] text-[#FBF7EE] font-marcellus text-[11px] uppercase tracking-[0.25em] font-semibold shrink-0 rounded-[2px] shadow-md hover:bg-[#441213] cursor-pointer"
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
