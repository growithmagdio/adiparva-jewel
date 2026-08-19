'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { ProductCard } from '@/components/storefront/product-card';
import { Button } from '@/components/primitives/button';
import { getProducts, getCategories } from '@/lib/data/queries';
import { Product, Category } from '@/lib/data/types';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';

export default function CollectionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false);
  const [visibleCount, setVisibleCount] = React.useState(12);

  // Filter params from URL
  const selectedCategory = searchParams.get('category') || 'all';
  const selectedMetal = searchParams.get('metal') || 'all';
  const selectedStone = searchParams.get('stone') || 'all';
  const selectedOccasion = searchParams.get('occasion') || 'all';
  const priceRange = searchParams.get('price') || 'all';
  const sortBy = searchParams.get('sort') || 'latest';

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [cats, prods] = await Promise.all([
        getCategories(),
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
      const match = p.baseMetal?.toLowerCase().includes(selectedMetal) ||
        p.plating?.toLowerCase().includes(selectedMetal) ||
        p.variants.some((v) => v.metal.toLowerCase().includes(selectedMetal));
      if (!match) return false;
    }
    if (selectedStone !== 'all') {
      const match = p.stones?.some((s) => s.toLowerCase().includes(selectedStone)) ||
        p.specs.some((sp) => sp.value.toLowerCase().includes(selectedStone));
      if (!match) return false;
    }
    if (selectedOccasion !== 'all') {
      const match = p.occasion?.some((o) => o.toLowerCase().includes(selectedOccasion));
      if (!match) return false;
    }
    if (priceRange !== 'all') {
      if (priceRange === 'under-20k' && p.price >= 20000) return false;
      if (priceRange === '20k-50k' && (p.price < 20000 || p.price > 50000)) return false;
      if (priceRange === 'above-50k' && p.price <= 50000) return false;
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
    selectedOccasion !== 'all',
    priceRange !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[var(--color-ivory)] text-[var(--color-ink)] flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12 space-y-12">
        {/* Breadcrumb */}
        <div className="font-karla text-[12px] text-[var(--color-ink)]/60 flex items-center gap-2">
          <Link href="/" className="hover:text-[var(--color-gold)] transition-colors">Home</Link>
          <span className="text-[var(--color-hairline)]">/</span>
          <span className="text-[var(--color-ink)] font-medium">Collections</span>
        </div>

        {/* Page Head */}
        <div className="space-y-2 border-b border-[var(--color-hairline)] pb-8">
          <span className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
            {filteredProducts.length} pieces available
          </span>
          <h1 className="font-bodoni text-[36px] sm:text-[44px] text-[var(--color-ink)]">
            Shop all
          </h1>
          <p className="font-karla text-[16px] text-[var(--color-ink)]/70 max-w-[62ch]">
            Browse our complete vault of antique-finished South Indian temple jewellery, Kundan foil work, uncut Polki diamonds, and grand bridal ensembles.
          </p>
        </div>

        {/* Applied Filter Chips & Sort Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Active Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {selectedCategory !== 'all' && (
              <button
                onClick={() => updateParam('category', 'all')}
                className="font-marcellus text-[11px] uppercase tracking-[0.18em] px-3 py-1 bg-[var(--color-bone)] border border-[var(--color-hairline)] text-[var(--color-ink)] flex items-center gap-1.5 rounded-[2px]"
              >
                <span>Category: {categories.find((c) => c.id === selectedCategory)?.name || selectedCategory}</span>
                <X className="w-3 h-3 text-[var(--color-gold)]" />
              </button>
            )}
            {selectedMetal !== 'all' && (
              <button
                onClick={() => updateParam('metal', 'all')}
                className="font-marcellus text-[11px] uppercase tracking-[0.18em] px-3 py-1 bg-[var(--color-bone)] border border-[var(--color-hairline)] text-[var(--color-ink)] flex items-center gap-1.5 rounded-[2px]"
              >
                <span>Material: {selectedMetal}</span>
                <X className="w-3 h-3 text-[var(--color-gold)]" />
              </button>
            )}
            {selectedStone !== 'all' && (
              <button
                onClick={() => updateParam('stone', 'all')}
                className="font-marcellus text-[11px] uppercase tracking-[0.18em] px-3 py-1 bg-[var(--color-bone)] border border-[var(--color-hairline)] text-[var(--color-ink)] flex items-center gap-1.5 rounded-[2px]"
              >
                <span>Stone: {selectedStone}</span>
                <X className="w-3 h-3 text-[var(--color-gold)]" />
              </button>
            )}
            {priceRange !== 'all' && (
              <button
                onClick={() => updateParam('price', 'all')}
                className="font-marcellus text-[11px] uppercase tracking-[0.18em] px-3 py-1 bg-[var(--color-bone)] border border-[var(--color-hairline)] text-[var(--color-ink)] flex items-center gap-1.5 rounded-[2px]"
              >
                <span>Price: {priceRange}</span>
                <X className="w-3 h-3 text-[var(--color-gold)]" />
              </button>
            )}

            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)] underline underline-offset-4 ml-2 hover:text-[var(--color-gold-lit)]"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Sort & Mobile Trigger */}
          <div className="flex items-center gap-4 justify-between md:justify-end">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden font-marcellus text-[11px] uppercase tracking-[0.18em] px-4 py-2 bg-[var(--color-bone)] border border-[var(--color-hairline)] text-[var(--color-ink)] flex items-center gap-2 rounded-[2px]"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--color-gold)]" />
              <span>Filters ({activeFilterCount})</span>
            </button>

            <div className="flex items-center gap-2 font-karla text-sm">
              <span className="text-[var(--color-ink)]/60">Sort:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="bg-transparent border-none text-[var(--color-ink)] font-medium outline-none cursor-pointer pr-6 appearance-none"
                >
                  <option value="latest">Latest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="best-selling">Best Selling</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--color-gold)] absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout: Sticky Left Filter + 3-Up Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Desktop Filter Sidebar (280px sticky rail) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-8 sticky top-28 divide-y divide-[var(--color-hairline)] font-karla text-sm">
            {/* Category Section */}
            <div className="space-y-3 pb-6">
              <h3 className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
                Category
              </h3>
              <ul className="space-y-2 text-[var(--color-ink)]/80">
                <li>
                  <button
                    onClick={() => updateParam('category', 'all')}
                    className={`block text-left w-full hover:text-[var(--color-gold)] transition-colors ${
                      selectedCategory === 'all' ? 'font-semibold text-[var(--color-gold)]' : ''
                    }`}
                  >
                    All Categories ({products.length})
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => updateParam('category', cat.id)}
                      className={`block text-left w-full hover:text-[var(--color-gold)] transition-colors ${
                        selectedCategory === cat.id ? 'font-semibold text-[var(--color-gold)]' : ''
                      }`}
                    >
                      {cat.name} ({cat.pieceCount})
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Section */}
            <div className="pt-6 space-y-3 pb-6">
              <h3 className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
                Price Range
              </h3>
              <ul className="space-y-2 text-[var(--color-ink)]/80">
                {[
                  { label: 'All Prices', value: 'all' },
                  { label: 'Under ₹20,000', value: 'under-20k' },
                  { label: '₹20,000 – ₹50,000', value: '20k-50k' },
                  { label: 'Above ₹50,000', value: 'above-50k' },
                ].map((p) => (
                  <li key={p.value}>
                    <button
                      onClick={() => updateParam('price', p.value)}
                      className={`block text-left w-full hover:text-[var(--color-gold)] transition-colors ${
                        priceRange === p.value ? 'font-semibold text-[var(--color-gold)]' : ''
                      }`}
                    >
                      {p.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Material Section */}
            <div className="pt-6 space-y-3 pb-6">
              <h3 className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
                Material
              </h3>
              <ul className="space-y-2 text-[var(--color-ink)]/80">
                {['all', '22K Gold', 'Gold-plated', 'Antique Gold', 'Silver'].map((m) => (
                  <li key={m}>
                    <button
                      onClick={() => updateParam('metal', m)}
                      className={`block text-left w-full hover:text-[var(--color-gold)] transition-colors ${
                        selectedMetal === m ? 'font-semibold text-[var(--color-gold)]' : ''
                      }`}
                    >
                      {m === 'all' ? 'All Materials' : m}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stone Section */}
            <div className="pt-6 space-y-3 pb-6">
              <h3 className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
                Stone Type
              </h3>
              <ul className="space-y-2 text-[var(--color-ink)]/80">
                {['all', 'Kemp', 'Pearl', 'Ruby', 'Emerald', 'Polki'].map((st) => (
                  <li key={st}>
                    <button
                      onClick={() => updateParam('stone', st)}
                      className={`block text-left w-full hover:text-[var(--color-gold)] transition-colors ${
                        selectedStone === st ? 'font-semibold text-[var(--color-gold)]' : ''
                      }`}
                    >
                      {st === 'all' ? 'All Stones' : st}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Product Grid Area (3-up desktop with 32px column gap / 56px row gap) */}
          <div className="lg:col-span-9 space-y-12">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-[32px] gap-y-[56px]">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[4/5] bg-[var(--color-bone)] animate-pulse" />
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              /* Empty State */
              <div className="py-20 text-center space-y-6 max-w-md mx-auto">
                <h3 className="font-bodoni text-2xl text-[var(--color-ink)]">
                  No pieces match these filters.
                </h3>
                <p className="font-karla text-sm text-[var(--color-ink)]/70">
                  Try adjusting your metal, stone, or price selections to discover available pieces from our archive.
                </p>
                <Button variant="ghost" onClick={clearAllFilters}>
                  Clear all filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-[32px] gap-y-[56px]">
                  {displayedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination / Load More */}
                {displayedProducts.length < sortedProducts.length && (
                  <div className="pt-8 text-center space-y-4">
                    <p className="font-karla text-xs text-[var(--color-ink)]/60">
                      Showing {displayedProducts.length} of {sortedProducts.length} pieces
                    </p>
                    <Button
                      variant="ghost"
                      onClick={() => setVisibleCount((prev) => prev + 12)}
                    >
                      Load more pieces
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Sheet Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-end lg:hidden">
          <div className="w-full max-w-xs bg-[var(--color-ivory)] h-full p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--color-hairline)] pb-4">
                <h3 className="font-marcellus text-xs uppercase tracking-[0.18em] text-[var(--color-gold)]">
                  Filter Collection
                </h3>
                <button onClick={() => setMobileFilterOpen(false)}>
                  <X className="w-5 h-5 text-[var(--color-ink)]" />
                </button>
              </div>

              {/* Mobile Filter Options */}
              <div className="space-y-6 font-karla text-sm">
                <div>
                  <h4 className="font-medium text-[var(--color-ink)] mb-2">Category</h4>
                  <select
                    value={selectedCategory}
                    onChange={(e) => updateParam('category', e.target.value)}
                    className="w-full p-2 bg-[var(--color-bone)] border border-[var(--color-hairline)] rounded-[2px]"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <h4 className="font-medium text-[var(--color-ink)] mb-2">Price</h4>
                  <select
                    value={priceRange}
                    onChange={(e) => updateParam('price', e.target.value)}
                    className="w-full p-2 bg-[var(--color-bone)] border border-[var(--color-hairline)] rounded-[2px]"
                  >
                    <option value="all">All Prices</option>
                    <option value="under-20k">Under ₹20,000</option>
                    <option value="20k-50k">₹20,000 – ₹50,000</option>
                    <option value="above-50k">Above ₹50,000</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--color-hairline)] space-y-2">
              <Button
                variant="gold"
                className="w-full"
                onClick={() => setMobileFilterOpen(false)}
              >
                Apply Filters ({filteredProducts.length})
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={clearAllFilters}
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
