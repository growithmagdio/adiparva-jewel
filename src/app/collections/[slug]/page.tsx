'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { ProductCard } from '@/components/storefront/product-card';
import { getProducts, getCategories } from '@/lib/data/queries';
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
  };

  const activeSlug = slugMap[rawSlug] || rawSlug;

  const [category, setCategory] = React.useState<Category | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sortBy, setSortBy] = React.useState<string>('latest');

  React.useEffect(() => {
    async function loadCategoryData() {
      setLoading(true);
      const [allCats, allProds] = await Promise.all([
        getCategories(),
        getProducts({ status: 'live' }),
      ]);

      const foundCat = allCats.find((c) => c.slug === activeSlug);
      setCategory(foundCat || null);

      let filtered = allProds;
      if (foundCat) {
        filtered = allProds.filter((p) => p.categoryId === foundCat.id);
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
    <div className="min-h-screen bg-[var(--color-ivory)] text-[var(--color-ink)] flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12 space-y-12">
        {/* Breadcrumb */}
        <div className="font-karla text-[12px] text-[var(--color-ink)]/60 flex items-center gap-2">
          <Link href="/" className="hover:text-[var(--color-gold)] transition-colors">Home</Link>
          <span className="text-[var(--color-hairline)]">/</span>
          <Link href="/collections" className="hover:text-[var(--color-gold)] transition-colors">Collections</Link>
          <span className="text-[var(--color-hairline)]">/</span>
          <span className="text-[var(--color-ink)] font-medium">{category?.name || activeSlug}</span>
        </div>

        {/* Category Header */}
        <div className="space-y-2 border-b border-[var(--color-hairline)] pb-8">
          <span className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
            {products.length} pieces available
          </span>
          <h1 className="font-bodoni text-[36px] sm:text-[44px] text-[var(--color-ink)]">
            {category?.name || 'Collection'}
          </h1>
          <p className="font-karla text-[16px] text-[var(--color-ink)]/70 max-w-[62ch]">
            {category?.description || 'Browse our complete repository of temple gold and antique heirlooms.'}
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center justify-between font-karla text-sm">
          <span className="text-[var(--color-ink)]/60">Showing {sortedProducts.length} pieces</span>

          <div className="flex items-center gap-2">
            <span className="text-[var(--color-ink)]/60">Sort:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
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

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-[32px] gap-y-[56px]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-[var(--color-bone)] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-[32px] gap-y-[56px]">
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
