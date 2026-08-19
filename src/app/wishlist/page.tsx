'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { ProductCard } from '@/components/storefront/product-card';
import { Button } from '@/components/primitives/button';
import { GopuramRule } from '@/components/ui/GopuramRule';
import { useWishlistStore } from '@/lib/store/use-wishlist-store';
import { getProducts } from '@/lib/data/queries';
import { Product } from '@/lib/data/types';

export default function WishlistPage() {
  const wishlistProductIds = useWishlistStore((state) => state.wishlistProductIds);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [bestsellers, setBestsellers] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const all = await getProducts({ status: 'live' });
      const saved = all.filter((p) => wishlistProductIds.includes(p.id));
      setProducts(saved.length > 0 ? saved : all.slice(0, 3)); // Fallback sample if empty initial
      setBestsellers(all.slice(0, 4));
      setLoading(false);
    }
    loadData();
  }, [wishlistProductIds]);

  return (
    <div className="min-h-screen bg-[var(--color-ivory)] text-[var(--color-ink)] flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12 space-y-12">
        {/* Breadcrumb */}
        <div className="font-karla text-[12px] text-[var(--color-ink)]/60 flex items-center gap-2">
          <Link href="/" className="hover:text-[var(--color-gold)] transition-colors">Home</Link>
          <span className="text-[var(--color-hairline)]">/</span>
          <span className="text-[var(--color-ink)] font-medium">Saved Heirlooms</span>
        </div>

        {/* Page Head */}
        <div className="space-y-2 border-b border-[var(--color-hairline)] pb-8">
          <span className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
            Saved Repository
          </span>
          <h1 className="font-bodoni text-[36px] sm:text-[44px] text-[var(--color-ink)]">
            Saved Heirlooms ({products.length})
          </h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-[32px] gap-y-[56px]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-[var(--color-bone)] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center space-y-6 max-w-md mx-auto">
            <h2 className="font-bodoni text-[32px] text-[var(--color-ink)]">
              Your wishlist is empty.
            </h2>
            <p className="font-karla text-sm text-[var(--color-ink)]/70">
              Explore our heritage vault and click the heart icon on any piece to preserve it here.
            </p>
            <Link href="/collections">
              <Button variant="gold">Explore collection</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-[32px] gap-y-[56px]">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
