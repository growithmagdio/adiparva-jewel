'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, ArrowRight } from 'lucide-react';
import { getProducts } from '@/lib/data/queries';
import { Product } from '@/lib/data/types';

export interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = React.useState('');
  const [products, setProducts] = React.useState<Product[]>([]);

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

  const popularSearches = ['Temple Necklace', 'Peacock Jhumka', 'Kundan Choker', 'Kasu Haram', 'Meenakari Bangles'];

  const filteredProducts = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.shortDescription.toLowerCase().includes(query.toLowerCase()) ||
          p.artisanCluster.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--color-vault-black)]/98 backdrop-blur-md text-[var(--color-ivory)] select-none animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="max-w-[1440px] w-full mx-auto px-6 sm:px-8 h-[96px] flex items-center justify-between border-b border-[var(--color-temple-gold)]/20">
        <Link href="/" onClick={onClose} className="flex flex-col">
          <span className="font-marcellus text-2xl tracking-[0.14em] text-[var(--color-ivory)]">
            ADI PARVA
          </span>
          <span className="font-marcellus text-[9px] uppercase tracking-[0.35em] text-[var(--color-temple-gold)]">
            ARCHIVE SEARCH REPOSITORY
          </span>
        </Link>

        <button
          onClick={onClose}
          className="p-2 text-[var(--color-ivory)] hover:text-[var(--color-gold-light)] rounded-full transition-colors cursor-pointer"
          aria-label="Close search"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Search Input Area */}
      <div className="max-w-4xl w-full mx-auto px-6 pt-12 pb-6 space-y-8 flex-1 overflow-y-auto">
        <div className="relative flex items-center border-b border-[var(--color-temple-gold)] pb-4">
          <Search className="w-7 h-7 text-[var(--color-temple-gold)] shrink-0 mr-4 stroke-[1.5]" />
          <input
            type="text"
            autoFocus
            placeholder="Search temple gold, Kundan, Polki heirlooms..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full font-serif font-light text-2xl sm:text-4xl text-[var(--color-ivory)] placeholder-[var(--color-sandal)]/40 bg-transparent outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[var(--color-sandal)] hover:text-[var(--color-ivory)]"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Popular Searches */}
        {!query && (
          <div className="space-y-4 pt-4">
            <div className="font-marcellus text-[11px] uppercase tracking-[0.3em] text-[var(--color-temple-gold)]">
              POPULAR REPOSITORY SEARCHES
            </div>
            <div className="flex flex-wrap gap-2.5 font-jost text-sm">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-4 py-2 bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 text-[var(--color-sandal)] hover:text-[var(--color-gold-light)] hover:border-[var(--color-temple-gold)]/50 rounded-[2px] transition-all cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {query.trim() && (
          <div className="space-y-4 pt-4">
            <div className="font-marcellus text-[11px] uppercase tracking-[0.25em] text-[var(--color-temple-gold)]">
              FOUND {filteredProducts.length} MATCHING ARCHIVE PLATES
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((p) => {
                  const plateNo = `PLATE AP-${String(Math.abs(p.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 800 + 100).padStart(4, '0')}`;
                  return (
                    <Link
                      key={p.id}
                      href={`/piece/${p.slug}`}
                      onClick={onClose}
                      className="group flex gap-4 p-3 bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 rounded-[4px] hover:border-[var(--color-temple-gold)]/60 transition-all"
                    >
                      <div className="relative w-16 aspect-[3/4] bg-[var(--color-vault-black)] rounded-[2px] overflow-hidden border border-[var(--color-temple-gold)]/30 shrink-0">
                        <Image src={p.images[0]} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="flex-1 space-y-1 my-auto">
                        <div className="font-marcellus text-[9px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)]">
                          {plateNo}
                        </div>
                        <h4 className="font-serif text-base text-[var(--color-ivory)] group-hover:text-[var(--color-gold-light)] line-clamp-1">
                          {p.name}
                        </h4>
                        <div className="font-sans text-xs text-[var(--color-ivory)] tabular-nums">
                          ₹{p.price.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 space-y-2 text-[var(--color-sandal)]/70 font-jost">
                <p className="font-serif text-xl text-[var(--color-ivory)]">No archive plates match "{query}"</p>
                <p className="text-xs font-light">Try searching for terms like "Temple", "Jhumka", or "Haram".</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
