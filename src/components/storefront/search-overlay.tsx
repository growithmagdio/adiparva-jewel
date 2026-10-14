'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X } from 'lucide-react';
import { getProducts } from '@/lib/data/queries';
import { Product } from '@/lib/data/types';
import { LogoLockup } from '@/components/brand/logo-lockup';

export interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = React.useState('');
  const [products, setProducts] = React.useState<Product[]>([]);

  React.useEffect(() => {
    async function load() {
      const all = await getProducts({ status: 'live' });
      setProducts(all);
    }
    if (isOpen) {
      load();
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredProducts = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.shortDescription.toLowerCase().includes(query.toLowerCase()) ||
          p.artisanCluster?.toLowerCase().includes(query.toLowerCase()) ||
          p.categoryId.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const popularSearches = ['Temple Jewellery', 'Kundan', 'Peacock Jhumka', 'Kasu Haaram', 'Vaddanam', 'Oddiyanam', 'Bridal Sets'];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#FAF5EC]/98 backdrop-blur-md text-[#765E55] select-none animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="max-w-[1440px] w-full mx-auto px-6 sm:px-8 h-[96px] flex items-center justify-between border-b border-[#E7D7C0]">
        <LogoLockup size="sm" />

        <button
          onClick={onClose}
          className="p-2 text-[#5B1018] hover:text-[#3B090D] rounded-full transition-colors cursor-pointer"
          aria-label="Close search"
        >
          <X className="w-6 h-6 stroke-[1.8]" />
        </button>
      </div>

      {/* Main Search Input Area */}
      <div className="max-w-4xl w-full mx-auto px-6 pt-12 pb-6 space-y-8 flex-1 overflow-y-auto">
        <div className="relative flex items-center border-b border-[#B68A3A] pb-4">
          <Search className="w-7 h-7 text-[#B68A3A] shrink-0 mr-4 stroke-[1.8]" />
          <input
            type="text"
            autoFocus
            placeholder="Search temple gold, Kundan, Polki, bridal jewellery..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full font-serif font-light text-2xl sm:text-4xl text-[#5B1018] placeholder-[#765E55]/40 bg-transparent outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#765E55] hover:text-[#5B1018] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Popular Searches */}
        {!query && (
          <div className="space-y-4 pt-4">
            <div className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#B68A3A] font-semibold">
              POPULAR SEARCHES
            </div>
            <div className="flex flex-wrap gap-2.5 font-sans text-sm">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-4 py-2 bg-[#F2E7D7] border border-[#E7D7C0] text-[#5B1018] hover:border-[#B68A3A] rounded-[2px] transition-all cursor-pointer font-medium text-xs tracking-wider uppercase"
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
            <div className="font-sans text-[11px] uppercase tracking-[0.22em] text-[#B68A3A] font-semibold">
              FOUND {filteredProducts.length} MATCHING PIECES
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
                      className="group flex gap-4 p-3 bg-[#F2E7D7] border border-[#E7D7C0] rounded-[4px] hover:border-[#B68A3A] transition-all"
                    >
                      <div className="relative w-16 aspect-[3/4] bg-[#3B090D] rounded-[2px] overflow-hidden border border-[#B68A3A]/40 shrink-0">
                        <Image src={p.images[0]} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="flex-1 space-y-1 my-auto">
                        <div className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#B68A3A] font-semibold">
                          {plateNo}
                        </div>
                        <h4 className="font-serif text-base text-[#5B1018] group-hover:text-[#B68A3A] line-clamp-1">
                          {p.name}
                        </h4>
                        <div className="font-sans text-xs text-[#5B1018] font-semibold tabular-nums">
                          ₹{p.price.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 space-y-2 text-[#765E55] font-sans">
                <p className="font-serif text-xl text-[#5B1018]">No pieces match "{query}"</p>
                <p className="text-xs">Try searching for terms like "Temple", "Jhumka", or "Haram".</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
