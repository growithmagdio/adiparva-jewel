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
import { AlertTriangle } from 'lucide-react';

export default function WishlistPage() {
  const wishlistProductIds = useWishlistStore((state) => state.wishlistProductIds);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [removedAlert, setRemovedAlert] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const all = await getProducts({ status: 'live' });
      const saved = all.filter((p) => wishlistProductIds.includes(p.id));

      if (wishlistProductIds.length > saved.length) {
        // Clean up stale wishlist IDs
        const liveIds = new Set(saved.map((s) => s.id));
        wishlistProductIds.forEach((id) => {
          if (!liveIds.has(id)) {
            toggleWishlist(id);
          }
        });
        setRemovedAlert(true);
      }

      setProducts(saved);
      setLoading(false);
    }
    loadData();
  }, [wishlistProductIds]);

  return (
    <div className="min-h-screen bg-[#FAF5EC] text-[#765E55] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12 space-y-12">
        {/* Breadcrumb */}
        <div className="font-marcellus text-[11px] uppercase tracking-[0.2em] text-[#765E55]/80 flex items-center gap-2">
          <Link href="/" className="hover:text-[#B68A3A] transition-colors">Home</Link>
          <span className="text-[#B68A3A]/40">/</span>
          <span className="text-[#5B1018] font-medium">Saved Heirlooms</span>
        </div>

        {/* Page Head */}
        <div className="space-y-3 border-b border-[#E7D7C0] pb-8">
          <span className="font-marcellus text-[11px] uppercase tracking-[0.35em] text-[#B68A3A] font-semibold">
            SAVED REPOSITORY
          </span>
          <h1 className="font-serif text-[36px] sm:text-[48px] font-normal text-[#5B1018]">
            Saved <em className="italic font-normal text-[#B68A3A]">Heirlooms</em> ({products.length})
          </h1>
        </div>

        {removedAlert && (
          <div className="p-4 bg-[#FDF7EF] text-[#B68A3A] border border-[#E7D7C0] rounded flex items-center justify-between font-sans text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#B68A3A]" />
              <span className="text-[#5B1018]">This item is no longer available and has been removed from your saved heirlooms.</span>
            </div>
            <button onClick={() => setRemovedAlert(false)} className="underline ml-4 cursor-pointer font-semibold text-[#5B1018]">
              Dismiss
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[#F2E7D7]/50 rounded-[4px] animate-pulse border border-[#E7D7C0]" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#E7D7C0] p-8 rounded-[4px] space-y-4 shadow-sm">
            <KolamDivider />
            <h2 className="font-serif text-2xl text-[#5B1018]">Your wishlist repository is empty</h2>
            <p className="font-jost text-sm text-[#765E55]">Click the heart icon on any piece to save it to your personal repository.</p>
            <Link
              href="/collections"
              className="h-10 px-6 bg-[#5B1018] text-[#FAF5EC] hover:bg-[#3B090D] font-marcellus text-[11px] uppercase tracking-[0.2em] inline-flex items-center justify-center rounded-[2px] transition-colors"
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
