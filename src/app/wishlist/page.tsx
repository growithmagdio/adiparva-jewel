'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { ProductCard } from '@/components/storefront/product-card';
import { KolamDivider } from '@/components/storefront/kolam-divider';
import { useWishlistStore } from '@/lib/store/use-wishlist-store';
import { getProducts } from '@/lib/data/queries';
import { Product } from '@/lib/data/types';

export default function WishlistPage() {
  const wishlistProductIds = useWishlistStore((state) => state.wishlistProductIds);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const all = await getProducts({ status: 'live' });
      const saved = all.filter((p) => wishlistProductIds.includes(p.id));
      setProducts(saved);
      setLoading(false);
    }
    loadData();
  }, [wishlistProductIds]);

  return (
    <div className="min-h-screen bg-[var(--color-vault-black)] text-[var(--color-ivory)] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12 space-y-12">
        {/* Breadcrumb */}
        <div className="font-marcellus text-[11px] uppercase tracking-[0.2em] text-[var(--color-sandal)]/60 flex items-center gap-2">
          <Link href="/" className="hover:text-[var(--color-gold-light)] transition-colors">Home</Link>
          <span className="text-[var(--color-temple-gold)]/40">/</span>
          <span className="text-[var(--color-temple-gold)]">Saved Heirlooms</span>
        </div>

        {/* Page Head */}
        <div className="space-y-3 border-b border-[var(--color-temple-gold)]/20 pb-8">
          <span className="font-marcellus text-[11px] uppercase tracking-[0.35em] text-[var(--color-temple-gold)]">
            SAVED REPOSITORY
          </span>
          <h1 className="font-serif text-[36px] sm:text-[48px] font-light text-[var(--color-ivory)]">
            Saved <em className="italic text-gold-gradient font-normal">Heirlooms</em> ({products.length})
          </h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[var(--color-sanctum)] rounded-[4px] animate-pulse border border-[var(--color-temple-gold)]/10" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 p-8 rounded-[4px] space-y-4">
            <KolamDivider />
            <h2 className="font-serif text-2xl text-[var(--color-ivory)]">Your wishlist repository is empty</h2>
            <p className="font-jost text-sm text-[var(--color-sandal)]/70">Click the heart icon on any piece to save it to your personal repository.</p>
            <Link
              href="/collections"
              className="h-10 px-6 border border-[var(--color-temple-gold)] text-[var(--color-temple-gold)] font-marcellus text-[11px] uppercase tracking-[0.2em] inline-flex items-center justify-center rounded-[2px]"
            >
              EXPLORE THE COLLECTION
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
