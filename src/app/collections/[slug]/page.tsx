'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { ProductCard } from '@/components/storefront/product-card';
import { getProducts, getCategories } from '@/lib/data/queries';
import { getInitialSeedData } from '@/lib/data/store';
import { Product, Category } from '@/lib/data/types';
import { ChevronDown } from 'lucide-react';

export default function CategoryPage() {
  const params = useParams();
  const rawSlug = (params?.slug as string) || 'all';

  const slugMap: Record<string, string> = {
    temple: 'temple-jewellery',
    'temple-jewellery': 'temple-jewellery',
    kundan: 'kundan',
    polki: 'polki',
    heritage: 'bridal-sets',
    bridal: 'bridal-sets',
    'bridal-sets': 'bridal-sets',
    earrings: 'jhumkas',
    jhumkas: 'jhumkas',
    bangles: 'bangles-kada',
    'bangles-kada': 'bangles-kada',
    vaddanams: 'oddiyanam',
    oddiyanam: 'oddiyanam',
    accessories: 'maang-tikka-nath',
    'maang-tikka-nath': 'maang-tikka-nath',
  };

  const activeSlug = slugMap[rawSlug] || rawSlug;

  const [category, setCategory] = React.useState<Category | null>(() => {
    const store = getInitialSeedData();
    return store.categories.find((c) => c.slug === activeSlug) || null;
  });
  const [products, setProducts] = React.useState<Product[]>(() => {
    const store = getInitialSeedData();
    const foundCat = store.categories.find((c) => c.slug === activeSlug);
    if (foundCat) {
      return store.products.filter(
        (p) => (p.categoryId === foundCat.id || p.categoryId === foundCat.slug) && p.status === 'live'
      );
    }
    return store.products.filter((p) => p.status === 'live');
  });
  const [loading, setLoading] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<string>('latest');

  React.useEffect(() => {
    async function loadCategoryData() {
      const [allCats, allProds] = await Promise.all([
        getCategories(),
        getProducts({ status: 'live' }),
      ]);

      const foundCat = allCats.find((c) => c.slug === activeSlug);
      setCategory(foundCat || null);

      let filtered = allProds;
      if (foundCat) {
        filtered = allProds.filter((p) => p.categoryId === foundCat.id || p.categoryId === foundCat.slug);
      }

      setProducts(filtered);
      setLoading(false);
    }
    loadCategoryData();
  }, [activeSlug]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'best-selling') return b.reviewCount - a.reviewCount;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-[#FAF5EC] text-[#765E55] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12 space-y-10">
        {/* Breadcrumb */}
        <div className="font-sans text-[11px] uppercase tracking-[0.22em] text-[#765E55]/70 flex items-center gap-2">
          <Link href="/" className="hover:text-[#5B1018] transition-colors">Home</Link>
          <span className="text-[#B68A3A]/40">/</span>
          <Link href="/collections" className="hover:text-[#5B1018] transition-colors">Collections</Link>
          <span className="text-[#B68A3A]/40">/</span>
          <span className="text-[#B68A3A] font-semibold">{category?.name || activeSlug}</span>
        </div>

        {/* Category Header */}
        <div className="space-y-3 border-b border-[#E7D7C0] pb-8">
          <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#B68A3A] font-semibold">
            {products.length} PIECES AVAILABLE
          </span>
          <h1 className="font-serif text-[36px] sm:text-[50px] font-normal text-[#5B1018]">
            {category?.name || 'Collection'}
          </h1>
          <p className="font-sans text-[15px] sm:text-[16px] text-[#765E55] max-w-[68ch] leading-relaxed">
            {category?.description || 'Browse our complete collection of handcrafted South Indian temple gold and antique heirlooms.'}
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center justify-between font-sans text-sm border-b border-[#E7D7C0] pb-4">
          <span className="text-[#765E55] font-medium">Showing {sortedProducts.length} pieces</span>

          <div className="flex items-center gap-3">
            <span className="font-sans text-xs uppercase tracking-[0.18em] text-[#5B1018] font-semibold">Sort:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#F2E7D7] border border-[#E7D7C0] text-[#5B1018] font-sans text-xs px-3 py-1.5 rounded-[2px] outline-none cursor-pointer pr-8 appearance-none focus:border-[#B68A3A]"
              >
                <option value="latest">Recently Added</option>
                <option value="best-selling">Curated / Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#B68A3A] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[#F2E7D7] rounded-[4px] animate-pulse border border-[#E7D7C0]" />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 bg-[#F2E7D7] border border-[#E7D7C0] p-8 rounded-[4px] space-y-4">
            <h3 className="font-serif text-2xl text-[#5B1018]">No pieces found in this collection</h3>
            <p className="font-sans text-sm text-[#765E55]">Check back soon for new additions to this collection.</p>
            <Link
              href="/collections"
              className="h-10 px-6 bg-[#5B1018] text-[#FAF5EC] font-sans text-[11px] uppercase tracking-[0.2em] inline-flex items-center justify-center rounded-[2px] font-semibold hover:bg-[#3B090D] transition-colors"
            >
              BROWSE ALL COLLECTIONS
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
