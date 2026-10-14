'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { ProductCard } from '@/components/storefront/product-card';
import { KolamDivider } from '@/components/storefront/kolam-divider';
import { getProducts, getCategories } from '@/lib/data/queries';
import { getInitialSeedData } from '@/lib/data/store';
import { Product, Category } from '@/lib/data/types';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';

function CollectionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = React.useState<Category[]>(() => {
    const store = getInitialSeedData();
    return store.categories.filter((c) => c.isActive !== false);
  });
  const [products, setProducts] = React.useState<Product[]>(() => {
    const store = getInitialSeedData();
    return store.products.filter((p) => p.status === 'live');
  });
  const [loading, setLoading] = React.useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false);
  const [visibleCount, setVisibleCount] = React.useState(12);

  // Filter params from URL
  const selectedCategory = searchParams.get('category') || 'all';
  const selectedMetal = searchParams.get('metal') || 'all';
  const selectedStone = searchParams.get('stone') || 'all';
  const priceRange = searchParams.get('price') || 'all';
  const sortBy = searchParams.get('sort') || 'latest';

  React.useEffect(() => {
    async function loadData() {
      const [cats, prods] = await Promise.all([
        getCategories({ activeOnly: true }),
        getProducts({ status: 'live' }),
      ]);
      setCategories(cats);
      setProducts(prods);
      setLoading(false);
    }
    loadData();
  }, []);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all' || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/collections?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/collections');
  };

  // Filter logic
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
    if (selectedMetal !== 'all') {
      const match =
        p.baseMetal?.toLowerCase().includes(selectedMetal.toLowerCase()) ||
        p.plating?.toLowerCase().includes(selectedMetal.toLowerCase()) ||
        p.variants.some((v) => v.metal.toLowerCase().includes(selectedMetal.toLowerCase()));
      if (!match) return false;
    }
    if (selectedStone !== 'all') {
      const match =
        p.stones?.some((s) => s.toLowerCase().includes(selectedStone.toLowerCase())) ||
        p.specs.some((sp) => sp.value.toLowerCase().includes(selectedStone.toLowerCase()));
      if (!match) return false;
    }
    if (priceRange !== 'all') {
      if (priceRange === 'under-2k' && p.price >= 2000) return false;
      if (priceRange === '2k-5k' && (p.price < 2000 || p.price > 5000)) return false;
      if (priceRange === '5k-10k' && (p.price < 5000 || p.price > 10000)) return false;
      if (priceRange === 'above-10k' && p.price <= 10000) return false;
    }
    return true;
  });

  // Sort logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'best-selling') return b.reviewCount - a.reviewCount;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const displayedProducts = sortedProducts.slice(0, visibleCount);
  const activeFilterCount = [
    selectedCategory !== 'all',
    selectedMetal !== 'all',
    selectedStone !== 'all',
    priceRange !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#FAF5EC] text-[#765E55] flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        {/* Collection Header Banner */}
        <section className="bg-[#F2E7D7] border-b border-[#E7D7C0] py-12 px-6 sm:px-8">
          <div className="max-w-[1440px] mx-auto space-y-3 text-center sm:text-left">
            {/* Breadcrumbs */}
            <div className="font-sans text-[11px] uppercase tracking-[0.22em] text-[#B68A3A] font-semibold">
              <Link href="/" className="hover:text-[#5B1018] transition-colors">HOME</Link>
              <span className="mx-2 text-[#765E55]/50">/</span>
              <span>SHOP COLLECTION</span>
            </div>

            <h1 className="font-serif text-[38px] sm:text-[52px] font-normal text-[#5B1018]">
              The <span className="italic text-[#B68A3A] font-light">Heritage Collection</span>
            </h1>
            <p className="text-[15px] sm:text-[16px] text-[#765E55] max-w-[60ch] leading-relaxed">
              Explore handcrafted temple gold, Kundan, Polki diamonds, and antique bridal heirlooms sculpted by master artisans.
            </p>
          </div>
        </section>

        <section className="max-w-[1440px] mx-auto px-6 sm:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left Filter Rail */}
            <aside className="hidden lg:block w-[280px] shrink-0 space-y-8 bg-[#F2E7D7] p-6 border border-[#E7D7C0] rounded-[4px] h-fit sticky top-28">
              <div className="flex items-center justify-between border-b border-[#E7D7C0] pb-4">
                <h3 className="font-sans text-[12px] uppercase tracking-[0.25em] text-[#5B1018] font-semibold">
                  FILTER PIECES
                </h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="font-sans text-[10px] uppercase tracking-[0.16em] text-[#76252C] hover:underline font-semibold cursor-pointer"
                  >
                    CLEAR ALL ({activeFilterCount})
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <h4 className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#5B1018] font-semibold">
                  CATEGORIES
                </h4>
                <div className="space-y-2 font-sans text-sm text-[#765E55]">
                  <button
                    onClick={() => updateParam('category', 'all')}
                    className={`block w-full text-left transition-colors cursor-pointer ${
                      selectedCategory === 'all' ? 'text-[#5B1018] font-bold' : 'hover:text-[#5B1018]'
                    }`}
                  >
                    All Categories ({products.length})
                  </button>
                  {categories.map((cat) => {
                    const count = products.filter((p) => p.categoryId === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => updateParam('category', cat.id)}
                        className={`block w-full text-left transition-colors cursor-pointer ${
                          selectedCategory === cat.id ? 'text-[#5B1018] font-bold' : 'hover:text-[#5B1018]'
                        }`}
                      >
                        {cat.name} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Ranges */}
              <div className="space-y-3 border-t border-[#E7D7C0] pt-6">
                <h4 className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#5B1018] font-semibold">
                  PRICE RANGE
                </h4>
                <div className="space-y-2 font-sans text-sm text-[#765E55]">
                  {[
                    { label: 'All Prices', val: 'all' },
                    { label: 'Below ₹2,000', val: 'under-2k' },
                    { label: '₹2,000 – ₹5,000', val: '2k-5k' },
                    { label: '₹5,000 – ₹10,000', val: '5k-10k' },
                    { label: 'Above ₹10,000', val: 'above-10k' },
                  ].map((pr) => (
                    <label key={pr.val} className="flex items-center gap-3 cursor-pointer hover:text-[#5B1018]">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={priceRange === pr.val}
                        onChange={() => updateParam('price', pr.val)}
                        className="accent-[#5B1018]"
                      />
                      <span>{pr.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Materials */}
              <div className="space-y-3 border-t border-[#E7D7C0] pt-6">
                <h4 className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#5B1018] font-semibold">
                  MATERIAL & FINISH
                </h4>
                <div className="space-y-2 font-sans text-sm text-[#765E55]">
                  {[
                    { label: 'All Finishes', val: 'all' },
                    { label: '22K Antique Gold', val: '22k gold' },
                    { label: 'Gold-plated Silver', val: 'silver' },
                    { label: 'Antique Gold Finish', val: 'antique' },
                  ].map((m) => (
                    <label key={m.val} className="flex items-center gap-3 cursor-pointer hover:text-[#5B1018]">
                      <input
                        type="radio"
                        name="metalFinish"
                        checked={selectedMetal === m.val}
                        onChange={() => updateParam('metal', m.val)}
                        className="accent-[#5B1018]"
                      />
                      <span>{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            {/* Right Product Grid Area */}
            <div className="flex-1 space-y-6">
              {/* Header Controls Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F2E7D7] p-4 border border-[#E7D7C0] rounded-[4px]">
                <div className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#765E55] font-medium">
                  SHOWING {displayedProducts.length} OF {sortedProducts.length} PIECES
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setMobileFilterOpen(true)}
                    className="lg:hidden h-9 px-4 border border-[#B68A3A] text-[#5B1018] font-sans text-[11px] uppercase tracking-[0.16em] font-semibold flex items-center gap-2 rounded-[2px] cursor-pointer"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>FILTERS ({activeFilterCount})</span>
                  </button>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-[11px] uppercase tracking-[0.16em] text-[#765E55] hidden sm:inline font-medium">
                      SORT BY:
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => updateParam('sort', e.target.value)}
                      className="bg-[#FAF5EC] border border-[#E7D7C0] text-[#5B1018] font-sans text-xs px-3 py-1.5 rounded-[2px] outline-none focus:border-[#B68A3A]"
                    >
                      <option value="latest">Latest Arrivals</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="best-selling">Rating & Popularity</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Product Grid */}
              {displayedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 space-y-4 bg-[#F2E7D7] border border-[#E7D7C0] rounded-[4px]">
                  <KolamDivider />
                  <p className="font-serif text-2xl text-[#5B1018]">No pieces match your selected filters.</p>
                  <p className="font-sans text-sm text-[#765E55]">Adjust your price range or category filter.</p>
                  <button
                    onClick={clearAllFilters}
                    className="h-10 px-6 bg-[#5B1018] text-[#FAF5EC] font-sans text-[11px] uppercase tracking-[0.2em] font-semibold rounded-[2px] hover:bg-[#3B090D] cursor-pointer"
                  >
                    CLEAR ALL FILTERS
                  </button>
                </div>
              )}

              {/* Numbered Pagination / Load More */}
              {displayedProducts.length < sortedProducts.length && (
                <div className="pt-8 text-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    className="h-[48px] px-9 bg-[#5B1018] text-[#FAF5EC] font-sans text-xs uppercase tracking-[0.2em] font-semibold rounded-[2px] shadow-sm hover:bg-[#3B090D] transition-colors cursor-pointer"
                  >
                    LOAD MORE PIECES ({sortedProducts.length - displayedProducts.length} REMAINING)
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Mobile Filter Sheet */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex justify-end">
            <div className="w-full max-w-[320px] bg-[var(--color-sanctum)] h-full p-6 space-y-6 overflow-y-auto border-l border-[var(--color-temple-gold)]/30">
              <div className="flex items-center justify-between border-b border-[var(--color-temple-gold)]/20 pb-4">
                <h3 className="font-marcellus text-sm uppercase tracking-[0.25em] text-[var(--color-temple-gold)]">
                  FILTERS
                </h3>
                <button onClick={() => setMobileFilterOpen(false)} className="text-[var(--color-ivory)]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Filter Options */}
              <div className="space-y-4 font-jost text-sm text-[var(--color-ivory)]">
                <div>
                  <h4 className="font-marcellus text-xs uppercase tracking-wider text-[var(--color-temple-gold)] mb-2">
                    CATEGORIES
                  </h4>
                  <button
                    onClick={() => { updateParam('category', 'all'); setMobileFilterOpen(false); }}
                    className="block w-full text-left py-1 text-sm text-[var(--color-sandal)]"
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { updateParam('category', c.id); setMobileFilterOpen(false); }}
                      className="block w-full text-left py-1 text-sm text-[var(--color-sandal)]"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#FBF7EE]" />}>
      <CollectionsContent />
    </React.Suspense>
  );
}
