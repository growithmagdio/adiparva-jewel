'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { ProductCard } from '@/components/storefront/product-card';
import { BicameralHeading, MicroLabel, ProductCardSkeleton, EmptyState } from '@/components/primitives';
import { getProducts, getCategories } from '@/lib/data/queries';
import { Product, Category } from '@/lib/data/types';
import { SlidersHorizontal } from 'lucide-react';

export default function CategoryPage() {
  const params = useParams();
  const rawSlug = (params?.slug as string) || 'all';

  // Category slug aliases
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
  const [sortBy, setSortBy] = React.useState<'curated' | 'price-asc' | 'price-desc'>('curated');

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
    return 0;
  });

  return (
    <div className="min-h-screen bg-[var(--color-cream-100)] text-[var(--color-text-700)] flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-10 space-y-12">
        {/* Category Header */}
        <div className="border-b border-[var(--color-cream-200)] pb-8 space-y-3">
          <MicroLabel className="text-[var(--color-gold-600)]">HERITAGE COLLECTION</MicroLabel>
          <BicameralHeading
            italicPart={category ? category.name.split(' ')[0] : 'The'}
            romanPart={category ? category.name.split(' ').slice(1).join(' ') || 'Collection' : 'Collection'}
            size="xl"
          />
          <p className="font-sans text-sm text-[var(--color-text-500)] max-w-2xl leading-relaxed">
            {category?.description || 'Browse our complete repository of 22K temple gold, Kundan, and Polki pieces.'}
          </p>
        </div>

        {/* Controls Bar: Sort & Filter indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-4 rounded-[var(--radius-card)]">
          <div className="flex items-center gap-2 text-xs font-sans text-[var(--color-text-500)]">
            <SlidersHorizontal className="w-4 h-4 text-[var(--color-gold-600)]" />
            <span>Showing {sortedProducts.length} pieces</span>
          </div>

          <div className="flex items-center gap-3 text-xs font-sans">
            <span className="text-[var(--color-text-500)]">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[var(--color-cream-100)] border border-[var(--color-cream-300)] rounded px-3 py-1.5 text-xs text-[var(--color-text-900)] outline-none"
            >
              <option value="curated">Curated (Default)</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <EmptyState
            title="No pieces match this collection"
            description="Explore our other heritage categories or reset filters."
            actionLabel="View all collections"
            onAction={() => (window.location.href = '/collections')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
