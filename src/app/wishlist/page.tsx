'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { ProductCard } from '@/components/storefront/product-card';
import { BicameralHeading, MicroLabel, Button, EmptyState, ProductCardSkeleton } from '@/components/primitives';
import { getProducts } from '@/lib/data/queries';
import { Product } from '@/lib/data/types';

export default function WishlistPage() {
  const [wishlistProducts, setWishlistProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadWishlist() {
      setLoading(true);
      const all = await getProducts({ status: 'live' });
      // Sample initial wishlisted pieces (Masterpiece tagged pieces)
      setWishlistProducts(all.slice(0, 3));
      setLoading(false);
    }
    loadWishlist();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-cream-100)] text-[var(--color-text-700)] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-10 space-y-10">
        <div className="border-b border-[var(--color-cream-200)] pb-6">
          <MicroLabel className="text-[var(--color-gold-600)]">SAVED REPOSITORY</MicroLabel>
          <BicameralHeading italicPart="Saved" romanPart="Heirlooms" size="xl" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : wishlistProducts.length === 0 ? (
          <EmptyState
            title="Your wishlist is empty"
            description="Explore our heritage collections to save pieces for future reservation."
            actionLabel="Explore collection"
            onAction={() => (window.location.href = '/collections')}
          />
        ) : (
          <div className="space-y-6">
            <p className="text-xs font-sans text-[var(--color-text-500)]">
              You have {wishlistProducts.length} saved pieces in your private repository.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlistProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
