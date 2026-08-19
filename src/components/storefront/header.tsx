'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartSheet } from './cart-sheet';
import { SearchOverlay } from './search-overlay';
import { useCartStore } from '@/lib/store/use-cart-store';
import { useWishlistStore } from '@/lib/store/use-wishlist-store';

const ANNOUNCEMENT_MESSAGES = [
  'Free Shipping Above ₹1999   |   Handcrafted Heritage Jewellery   |   COD Available',
];

const MEGA_MENU_COLLECTIONS = [
  { name: 'Temple Jewellery', href: '/collections/temple-jewellery', image: '/images/categories/temple-jewellery.jpg', count: '8 Pieces' },
  { name: 'Kundan & Jadau', href: '/collections/kundan', image: '/images/categories/kundan.jpg', count: '6 Pieces' },
  { name: 'Uncut Polki', href: '/collections/polki', image: '/images/categories/polki.jpg', count: '5 Pieces' },
  { name: 'Bridal Register', href: '/collections/bridal-sets', image: '/images/categories/bridal-sets.jpg', count: '6 Ensembles' },
];

export function Header() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isAnnouncementDismissed, setIsAnnouncementDismissed] = React.useState(false);

  const cartItems = useCartStore((state) => state.items);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const wishlistProductIds = useWishlistStore((state) => state.wishlistProductIds);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  // Scroll detection
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const dismissAnnouncement = () => {
    setIsAnnouncementDismissed(true);
    localStorage.setItem('adaparva_announcement_dismissed', 'true');
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/collections' },
    { label: 'Collections', href: '/collections', hasMega: true },
    { label: 'Bridal', href: '/collections/bridal-sets' },
    { label: 'About', href: '/heritage' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      {/* 4.1 Announcement Bar */}
      {!isAnnouncementDismissed && (
        <div className="h-[36px] bg-[var(--color-vault)] text-[var(--color-gold-lit)] font-marcellus text-[11px] uppercase tracking-[0.18em] flex items-center justify-between px-4 select-none relative z-50 border-b border-[var(--color-gold)]/20">
          <div className="w-6 hidden md:block" />
          <div className="flex-1 flex justify-center items-center overflow-hidden h-full">
            <AnimatePresence mode="wait">
              <motion.span
                key="announcement-bar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                {ANNOUNCEMENT_MESSAGES[0]}
              </motion.span>
            </AnimatePresence>
          </div>
          <button
            onClick={dismissAnnouncement}
            className="text-[var(--color-gold-lit)]/60 hover:text-[var(--color-gold-lit)] transition-colors p-1"
            aria-label="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4.2 Header Bar */}
      <header
        className={`sticky top-0 z-40 transition-all duration-320 select-none ${
          isScrolled
            ? 'bg-[var(--color-ivory)] border-b border-[var(--color-hairline)] shadow-none'
            : 'bg-[var(--color-ivory)]/95 border-b border-transparent'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 h-[88px] flex items-center justify-between">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2 text-[var(--color-ink)] hover:text-[var(--color-gold)] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Wordmark */}
          <Link href="/" className="flex flex-col items-center xl:items-start group shrink-0">
            <span className="font-bodoni text-[22px] tracking-[-0.02em] font-normal text-[var(--color-ink)] group-hover:text-[var(--color-gold)] transition-colors leading-none">
              ADI PARVA
            </span>
            <span className="font-marcellus text-[9px] uppercase tracking-[0.34em] text-[var(--color-gold)] mt-1">
              THE TEMPLE OF TRADITION
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <div
                  key={link.label}
                  className="relative group py-6"
                  onMouseEnter={() => link.hasMega && setIsMegaMenuOpen(true)}
                  onMouseLeave={() => link.hasMega && setIsMegaMenuOpen(false)}
                >
                  <Link
                    href={link.href}
                    className={`font-marcellus text-[12px] uppercase tracking-[0.18em] transition-colors relative flex items-center gap-1 ${
                      isActive
                        ? 'text-[var(--color-gold)]'
                        : 'text-[var(--color-ink)] hover:text-[var(--color-gold)]'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.hasMega && <ChevronDown className="w-3 h-3 text-[var(--color-gold)]" />}
                    <motion.span
                      className="absolute -bottom-1 left-0 h-[1px] bg-[var(--color-gold)]"
                      initial={{ width: 0 }}
                      animate={{ width: isActive ? '100%' : 0 }}
                      whileHover={{ width: '100%' }}
                      transition={{ duration: 0.2 }}
                    />
                  </Link>

                  {/* Mega Menu Overlay */}
                  {link.hasMega && isMegaMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-full left-1/2 -translate-x-1/2 w-[900px] bg-[var(--color-vault)] border border-[var(--color-hairline)]/30 p-8 shadow-2xl z-50 text-[var(--color-ivory)]"
                    >
                      <div className="grid grid-cols-4 gap-6">
                        {MEGA_MENU_COLLECTIONS.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMegaMenuOpen(false)}
                            className="group/item flex flex-col space-y-3"
                          >
                            <div className="aspect-[4/5] relative overflow-hidden bg-[var(--color-vault)]">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover transition-transform duration-560 group-hover/item:scale-105"
                                sizes="200px"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bodoni text-base text-[var(--color-ivory)] group-hover/item:text-[var(--color-gold-lit)] transition-colors">
                                {item.name}
                              </span>
                              <span className="font-marcellus text-[10px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
                                {item.count}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-5 text-[var(--color-ink)]">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 hover:text-[var(--color-gold)] transition-colors cursor-pointer"
              aria-label="Search collection"
            >
              <Search className="w-[18px] h-[18px] stroke-[1.25]" />
            </button>

            <Link
              href="/wishlist"
              className="p-2 hover:text-[var(--color-gold)] transition-colors relative"
              aria-label="View wishlist"
            >
              <Heart className="w-[18px] h-[18px] stroke-[1.25]" />
              {wishlistProductIds.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]" />
              )}
            </Link>

            <Link
              href="/account"
              className="p-2 hover:text-[var(--color-gold)] transition-colors hidden sm:block"
              aria-label="Account"
            >
              <User className="w-[18px] h-[18px] stroke-[1.25]" />
            </Link>

            {/* Cart Icon + Gold Plain Numeral Count */}
            <button
              onClick={toggleCart}
              className="p-2 hover:text-[var(--color-gold)] transition-colors flex items-center gap-1.5 cursor-pointer"
              aria-label="View shopping bag"
            >
              <ShoppingBag className="w-[18px] h-[18px] stroke-[1.25]" />
              {totalCartCount > 0 && (
                <span className="font-karla text-sm font-semibold text-[var(--color-gold)]">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="xl:hidden bg-[var(--color-ivory)] border-b border-[var(--color-hairline)] p-6 space-y-4">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-marcellus text-xs uppercase tracking-[0.18em] text-[var(--color-ink)] hover:text-[var(--color-gold)] py-2 border-b border-[var(--color-hairline)]/50"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-marcellus text-xs uppercase tracking-[0.18em] text-[var(--color-ink)] hover:text-[var(--color-gold)] py-2"
              >
                ACCOUNT
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Cart Sheet Drawer & Search Overlay */}
      <CartSheet />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
