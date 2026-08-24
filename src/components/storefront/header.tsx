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

const MEGA_MENU_COLLECTIONS = [
  { name: 'Temple Jewellery', href: '/collections/temple-jewellery', image: '/images/categories/temple-jewellery.jpg', count: '32 Plates' },
  { name: 'Kundan & Jadau', href: '/collections/kundan', image: '/images/categories/kundan.jpg', count: '18 Plates' },
  { name: 'Uncut Polki', href: '/collections/polki', image: '/images/categories/polki.jpg', count: '15 Plates' },
  { name: 'Bridal Register', href: '/collections/bridal-sets', image: '/images/categories/bridal-sets.jpg', count: '12 Ensembles' },
];

export function Header() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  const cartItems = useCartStore((state) => state.items);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const wishlistProductIds = useWishlistStore((state) => state.wishlistProductIds);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  // Scroll detection
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/collections' },
    { label: 'Collections', href: '/collections', hasMega: true },
    { label: 'Bridal', href: '/collections/bridal-sets' },
    { label: 'Our Story', href: '/heritage' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      {/* 1. Announcement Bar — Vault Black with 30s Linear Marquee */}
      <div className="h-[36px] bg-[var(--color-vault-black)] text-[var(--color-gold-light)] font-marcellus text-[11px] uppercase tracking-[0.25em] flex items-center overflow-hidden border-b border-[var(--color-temple-gold)]/30 z-50 relative select-none">
        <div className="whitespace-nowrap animate-marquee flex items-center gap-8 w-full justify-around">
          <span>Free Shipping Above ₹1999 ✦ Handmade Heritage Jewellery ✦ Cash on Delivery Available ✦ 7-Day Easy Returns</span>
          <span>Free Shipping Above ₹1999 ✦ Handmade Heritage Jewellery ✦ Cash on Delivery Available ✦ 7-Day Easy Returns</span>
        </div>
      </div>

      {/* 2. Header Navbar */}
      <header
        className={`sticky top-0 z-40 transition-all duration-500 select-none ${
          isScrolled
            ? 'bg-[#120D0E]/90 backdrop-blur-md border-b border-[var(--color-temple-gold)]/30 shadow-xl'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 h-[84px] flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2 text-[var(--color-ivory)] hover:text-[var(--color-temple-gold)] transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6 stroke-[1.5]" /> : <Menu className="w-6 h-6 stroke-[1.5]" />}
          </button>

          {/* Logo Brand Block */}
          <Link href="/" className="flex flex-col items-center xl:items-start group shrink-0">
            <span className="font-marcellus text-[22px] sm:text-[24px] tracking-[0.14em] font-normal text-[var(--color-ivory)] group-hover:text-[var(--color-gold-light)] transition-colors leading-none">
              ADI PARVA
            </span>
            <span className="font-marcellus text-[9px] uppercase tracking-[0.45em] text-[var(--color-temple-gold)] mt-1">
              THE TEMPLE OF TRADITION
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-10">
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
                    className={`font-marcellus text-[11px] uppercase tracking-[0.35em] transition-colors relative flex items-center gap-1.5 ${
                      isActive
                        ? 'text-[var(--color-gold-light)]'
                        : 'text-[var(--color-ivory)]/90 hover:text-[var(--color-temple-gold)]'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.hasMega && <ChevronDown className="w-3 h-3 text-[var(--color-temple-gold)]" />}
                    
                    {/* Gold Underline Slide-in */}
                    <span
                      className={`absolute -bottom-1 left-0 h-[1px] bg-[var(--color-temple-gold)] transition-all duration-300 ${
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </Link>

                  {/* Mega Menu Drawer */}
                  {link.hasMega && isMegaMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      transition={{ duration: 0.3 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 w-[920px] bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/40 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 text-[var(--color-ivory)]"
                    >
                      <div className="grid grid-cols-4 gap-6">
                        {MEGA_MENU_COLLECTIONS.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMegaMenuOpen(false)}
                            className="group/item flex flex-col space-y-3"
                          >
                            <div className="aspect-[4/5] relative overflow-hidden rounded-[4px] border border-[var(--color-temple-gold)]/30">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover/item:scale-105"
                                sizes="220px"
                              />
                              <div className="absolute inset-0 bg-black/40 group-hover/item:bg-black/20 transition-colors" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-serif text-lg text-[var(--color-ivory)] group-hover/item:text-[var(--color-gold-light)] transition-colors">
                                {item.name}
                              </span>
                              <span className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)]">
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

          {/* Action Icons — 1.5px Gold Stroke */}
          <div className="flex items-center space-x-6 text-[var(--color-temple-gold)]">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 hover:text-[var(--color-gold-light)] transition-colors cursor-pointer"
              aria-label="Search collection"
            >
              <Search className="w-5 h-5 stroke-[1.5]" />
            </button>

            <Link
              href="/wishlist"
              className="p-1.5 hover:text-[var(--color-gold-light)] transition-colors relative"
              aria-label="View wishlist"
            >
              <Heart className="w-5 h-5 stroke-[1.5]" />
              {wishlistProductIds.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--color-kemp-red)] border border-black" />
              )}
            </Link>

            <Link
              href="/account"
              className="p-1.5 hover:text-[var(--color-gold-light)] transition-colors hidden sm:block"
              aria-label="Account"
            >
              <User className="w-5 h-5 stroke-[1.5]" />
            </Link>

            {/* Cart Icon + Kemp Red Count Badge */}
            <button
              onClick={toggleCart}
              className="p-1.5 hover:text-[var(--color-gold-light)] transition-colors relative flex items-center cursor-pointer"
              aria-label="View shopping bag"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--color-kemp-red)] text-[var(--color-ivory)] font-marcellus text-[9px] font-bold flex items-center justify-center border border-[var(--color-temple-gold)]/50">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Full-Screen Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: '100vh' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="xl:hidden fixed inset-0 top-[120px] bg-[var(--color-vault-black)] z-50 p-8 flex flex-col justify-between border-t border-[var(--color-temple-gold)]/30"
            >
              <nav className="flex flex-col space-y-6 pt-4">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 + 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="font-serif text-[32px] font-light text-[var(--color-ivory)] hover:text-[var(--color-gold-light)] transition-colors block border-b border-[var(--color-temple-gold)]/15 pb-3"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="space-y-4 pb-16">
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-marcellus text-sm uppercase tracking-[0.3em] text-[var(--color-temple-gold)] block"
                >
                  CURATOR ACCOUNT →
                </Link>
                <div className="font-marcellus text-[10px] uppercase tracking-[0.25em] text-[var(--color-sandal)]/60">
                  ADI PARVA · THE TEMPLE OF TRADITION
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Cart Sheet Drawer & Search Overlay */}
      <CartSheet />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
