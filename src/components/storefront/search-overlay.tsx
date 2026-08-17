'use client';

import * as React from 'react';
import Link from 'next/link';
import { Search, X, ArrowRight, Tag } from 'lucide-react';
import { MicroLabel, Price } from '@/components/primitives';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { getProducts } from '@/lib/data/queries';
import { Product } from '@/lib/data/types';

export interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = React.useState('');
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      const all = await getProducts({ status: 'live' });
      setProducts(all);
    }
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const popularSearches = ['Temple Necklace', 'Polki Jhumka', 'Kundan Choker', 'Kasu Mala', 'Meenakari Bangles'];

  const filteredProducts = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.shortDescription.toLowerCase().includes(query.toLowerCase()) ||
          p.artisanCluster.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--color-surface)]/98 backdrop-blur-md animate-in fade-in duration-200 select-none">
      {/* Top Header Bar */}
      <div className="max-w-[1440px] w-full mx-auto px-6 sm:px-8 h-[108px] flex items-center justify-between border-b border-[var(--color-cream-200)]">
        <Link href="/" onClick={onClose} className="flex flex-col">
          <span className="font-serif text-2xl font-medium tracking-[0.06em] text-[var(--color-text-900)]">
            ADI PARVA
          </span>
          <MicroLabel className="text-[var(--color-gold-600)] text-[9px] tracking-[0.2em]">
            SEARCH REPOSITORY
          </MicroLabel>
        </Link>

        <button
          onClick={onClose}
          className="p-2 text-[var(--color-text-700)] hover:text-[var(--color-text-900)] rounded-full hover:bg-[var(--color-cream-100)] transition-colors cursor-pointer"
          aria-label="Close search"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Search Input Area */}
      <div className="max-w-4xl w-full mx-auto px-6 pt-12 pb-6 space-y-8 flex-1 overflow-y-auto">
        <div className="relative flex items-center border-b-2 border-[var(--color-gold-600)] pb-4">
          <Search className="w-8 h-8 text-[var(--color-gold-600)] shrink-0 mr-4" />
          <input
            type="text"
            autoFocus
            placeholder="Search temple gold, Kundan, Polki heirlooms..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full font-serif text-2xl sm:text-4xl text-[var(--color-text-900)] placeholder-[var(--color-text-400)] bg-transparent outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[var(--color-text-400)] hover:text-[var(--color-text-900)]"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Popular Searches */}
        {!query && (
          <div className="space-y-4 pt-4">
            <MicroLabel className="text-[var(--color-gold-600)]">POPULAR SEARCHES</MicroLabel>
            <div className="flex flex-wrap gap-2.5">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-4 py-2 bg-[var(--color-cream-100)] hover:bg-[var(--color-gold-100)] hover:text-[var(--color-gold-700)] text-xs font-sans font-medium text-[var(--color-text-700)] rounded-[var(--radius-pill)] border border-[var(--color-cream-200)] transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Tag className="w-3 h-3 text-[var(--color-gold-600)]" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results Grid */}
        {query && (
          <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between border-b border-[var(--color-cream-200)] pb-2">
              <MicroLabel className="text-[var(--color-gold-600)]">
                MATCHING PIECES ({filteredProducts.length})
              </MicroLabel>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <p className="font-serif text-xl text-[var(--color-text-900)]">No heritage pieces match your query</p>
                <p className="text-xs text-[var(--color-text-500)]">Try searching for &quot;Temple&quot;, &quot;Kundan&quot;, or &quot;Jhumka&quot;</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/piece/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center space-x-4 p-3 bg-[var(--color-cream-50)] hover:bg-[var(--color-cream-100)] border border-[var(--color-cream-200)] rounded-[var(--radius-card)] transition-colors group"
                  >
                    <div className="w-16 h-16 relative bg-[var(--color-cream-200)] rounded-[var(--radius-card)] overflow-hidden shrink-0">
                      <ImageWithFallback src={product.images[0]} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-serif text-sm font-medium text-[var(--color-text-900)] group-hover:text-[var(--color-gold-600)] transition-colors truncate">
                        {product.name}
                      </h5>
                      <p className="text-[11px] text-[var(--color-text-500)] truncate mt-0.5">
                        {product.artisanCluster}
                      </p>
                      <Price amount={product.price} size="sm" className="font-sans font-semibold mt-1" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
