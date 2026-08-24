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
    <div className="min-h-screen bg-[var(--color-vault-black)] text-[var(--color-ivory)] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12 space-y-12">
        {/* Breadcrumb */}
        <div className="font-marcellus text-[11px] uppercase tracking-[0.2em] text-[var(--color-sandal)]/60 flex items-center gap-2">
          <Link href="/" className="hover:text-[var(--color-gold-light)] transition-colors">Home</Link>
          <span className="text-[var(--color-temple-gold)]/40">/</span>
          <Link href="/collections" className="hover:text-[var(--color-gold-light)] transition-colors">Collections</Link>
          <span className="text-[var(--color-temple-gold)]/40">/</span>
          <span className="text-[var(--color-temple-gold)]">{category?.name || activeSlug}</span>
        </div>

        {/* Category Header */}
        <div className="space-y-3 border-b border-[var(--color-temple-gold)]/20 pb-8">
          <span className="font-marcellus text-[11px] uppercase tracking-[0.35em] text-[var(--color-temple-gold)]">
            {products.length} ARCHIVE PLATES AVAILABLE
          </span>
          <h1 className="font-serif text-[36px] sm:text-[52px] font-light text-[var(--color-ivory)]">
            {category?.name || 'Collection'}
          </h1>
          <p className="font-jost text-[16px] text-[var(--color-sandal)]/80 max-w-[68ch] leading-relaxed font-light">
            {category?.description || 'Browse our complete repository of temple gold and antique heirlooms.'}
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center justify-between font-jost text-sm border-b border-[var(--color-temple-gold)]/10 pb-4">
          <span className="text-[var(--color-sandal)]/70 font-light">Showing {sortedProducts.length} pieces</span>

          <div className="flex items-center gap-3">
            <span className="font-marcellus text-xs uppercase tracking-[0.18em] text-[var(--color-temple-gold)]">Sort:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/30 text-[var(--color-ivory)] font-jost text-xs px-3 py-1.5 rounded-[2px] outline-none cursor-pointer pr-8 appearance-none focus:border-[var(--color-temple-gold)]"
              >
                <option value="latest" className="bg-[var(--color-vault-black)] text-[var(--color-ivory)]">Recently Added</option>
                <option value="best-selling" className="bg-[var(--color-vault-black)] text-[var(--color-ivory)]">Curated / Popular</option>
                <option value="price-asc" className="bg-[var(--color-vault-black)] text-[var(--color-ivory)]">Price: Low to High</option>
                <option value="price-desc" className="bg-[var(--color-vault-black)] text-[var(--color-ivory)]">Price: High to Low</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--color-temple-gold)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[var(--color-sanctum)] rounded-[4px] animate-pulse border border-[var(--color-temple-gold)]/10" />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 p-8 rounded-[4px] space-y-4">
            <h3 className="font-serif text-2xl text-[var(--color-ivory)]">No pieces found in this category</h3>
            <p className="font-jost text-sm text-[var(--color-sandal)]/70">Check back soon for new additions to this repository.</p>
            <Link
              href="/collections"
              className="h-10 px-6 border border-[var(--color-temple-gold)] text-[var(--color-temple-gold)] font-marcellus text-[11px] uppercase tracking-[0.2em] inline-flex items-center justify-center rounded-[2px]"
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
