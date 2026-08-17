'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Heart, ShoppingBag, Menu, X, ArrowRight } from 'lucide-react';
import { MicroLabel } from '@/components/primitives';
import { CartSheet } from './cart-sheet';
import { SearchOverlay } from './search-overlay';
import { useCartStore } from '@/lib/store/use-cart-store';
import { useWishlistStore } from '@/lib/store/use-wishlist-store';
import { clsx } from 'clsx';

export function Header() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const cartItems = useCartStore((state) => state.items);
  const toggleCart = useCartStore((state) => state.toggleCart);

  const wishlistProductIds = useWishlistStore((state) => state.wishlistProductIds);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const formattedCount = totalCartCount < 10 ? `0${totalCartCount}` : `${totalCartCount}`;

  const navLinks = [
    { label: 'COLLECTION', href: '/collections' },
    { label: 'TEMPLE', href: '/collections/temple-jewellery' },
    { label: 'KUNDAN', href: '/collections/kundan' },
    { label: 'POLKI', href: '/collections/polki' },
    { label: 'HERITAGE', href: '/heritage' },
    { label: 'CRAFT', href: '/craft' },
    { label: 'JOURNAL', href: '/journal' },
    { label: 'CONTACT', href: '/contact' },
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[var(--color-ink-900)] text-[var(--color-cream-100)] text-[11px] font-sans font-medium h-[44px] px-4 text-center tracking-[0.14em] uppercase border-b border-[var(--color-gold-700)]/30 flex items-center justify-between max-w-[1440px] mx-auto select-none">
        <div className="hidden md:block w-24" aria-hidden="true" />
        <div className="flex-1 flex items-center justify-center gap-2">
          <span>COMPLIMENTARY ARMORED TRANSIT & BIS HALLMARK CERTIFICATION ON ALL RESERVATIONS</span>
        </div>
        <div className="text-right">
          <Link href="/care" className="text-[var(--color-gold-400)] font-semibold underline hover:text-white transition-colors uppercase tracking-wider">
            LEARN MORE
          </Link>
        </div>
      </div>

      {/* Main Sticky Navbar (108px Desktop Height) */}
      <header className="sticky top-0 z-40 bg-[var(--color-cream-100)]/98 backdrop-blur-md border-b border-[var(--color-cream-200)] transition-all select-none">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 h-[108px] flex items-center justify-between">
          {/* Mobile Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2 text-[var(--color-text-900)] hover:text-[var(--color-gold-600)] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Left Brand Identity */}
          <Link href="/" className="flex flex-col group shrink-0">
            <span className="font-serif text-2xl sm:text-3xl font-medium tracking-[0.08em] text-[var(--color-text-900)] group-hover:text-[var(--color-gold-600)] transition-colors leading-none">
              ADI PARVA
            </span>
            <MicroLabel className="text-[var(--color-gold-600)] text-[9px] tracking-[0.22em] mt-1.5">
              HERITAGE JEWELLERY
            </MicroLabel>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    'font-sans text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors relative py-1',
                    isActive
                      ? 'text-[var(--color-gold-600)] font-bold'
                      : 'text-[var(--color-text-700)] hover:text-[var(--color-text-900)]'
                  )}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[var(--color-gold-600)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-5 shrink-0">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 text-[var(--color-text-700)] hover:text-[var(--color-gold-600)] transition-colors cursor-pointer"
              aria-label="Search collection"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="p-2.5 text-[var(--color-text-700)] hover:text-[var(--color-gold-600)] transition-colors relative"
              aria-label="View wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistProductIds.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-risk-fg)]" />
              )}
            </Link>

            {/* Bag Cart Button */}
            <button
              onClick={toggleCart}
              className="p-2.5 px-4 bg-[var(--color-ink-900)] text-white hover:bg-[var(--color-ink-800)] rounded-[var(--radius-card)] flex items-center gap-2.5 transition-colors cursor-pointer shadow-xs border border-[var(--color-gold-700)]/30"
              aria-label="View shopping bag"
            >
              <ShoppingBag className="w-4 h-4 text-[var(--color-gold-400)]" />
              <span className="font-sans text-xs font-semibold tracking-[0.14em] uppercase">
                BAG
              </span>
              <span className="text-xs font-sans font-semibold text-[var(--color-gold-400)]">
                {formattedCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="xl:hidden bg-[var(--color-surface)] border-b border-[var(--color-cream-300)] p-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-900)] hover:text-[var(--color-gold-600)] py-1.5 border-b border-[var(--color-cream-200)]/50"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="pt-2 flex items-center justify-between text-xs text-[var(--color-text-500)] font-sans">
              <Link href="/admin" className="text-[var(--color-gold-600)] font-medium flex items-center gap-1">
                <span>Heritage Admin Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Cart Sheet Drawer & Search Overlay */}
      <CartSheet />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
