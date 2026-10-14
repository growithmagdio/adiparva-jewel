'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown, Sparkles, Truck, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartSheet } from './cart-sheet';
import { SearchOverlay } from './search-overlay';
import { useCartStore } from '@/lib/store/use-cart-store';
import { useWishlistStore } from '@/lib/store/use-wishlist-store';
import { LogoLockup } from '@/components/brand/logo-lockup';
import { getCategories } from '@/lib/data/queries';
import { getInitialSeedData } from '@/lib/data/store';
import { Category } from '@/lib/data/types';

export function Header() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [categories, setCategories] = React.useState<Category[]>(() => {
    const store = getInitialSeedData();
    return store.categories.filter((c) => c.isActive !== false);
  });
  const [activeAnnouncementIdx, setActiveAnnouncementIdx] = React.useState(0);

  const cartItems = useCartStore((state) => state.items);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const wishlistProductIds = useWishlistStore((state) => state.wishlistProductIds);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const announcements = [
    { text: 'FREE SHIPPING ABOVE INR 1,999', icon: Truck },
    { text: 'HANDMADE HERITAGE JEWELLERY', icon: Sparkles },
    { text: 'CASH ON DELIVERY AVAILABLE', icon: ShieldCheck },
  ];

  // Rotate announcement on small screens
  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveAnnouncementIdx((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements.length]);

  React.useEffect(() => {
    async function loadCategories() {
      const activeCats = await getCategories({ activeOnly: true });
      setCategories(activeCats);
    }
    loadCategories();
  }, []);

  // Scroll detection
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
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
      {/* 1. Slim Premium Announcement Bar (Dark Burgundy #3B090D + Ivory #FAF5EC + Antique Gold #B68A3A) */}
      <aside
        aria-label="Announcement"
        className="bg-[#3B090D] text-[#FAF5EC] py-2 px-4 border-b border-[#B68A3A]/25 text-[10.5px] sm:text-[11px] font-sans tracking-[0.16em] uppercase relative z-50 select-none"
      >
        <div className="max-w-[1440px] mx-auto flex items-center justify-center md:justify-between">
          {/* Desktop: 3 Confirmed Value Props with Thin Dividers matching reference */}
          <div className="hidden md:flex items-center justify-center gap-8 lg:gap-12 w-full font-medium">
            <div className="flex items-center gap-2 text-[#FAF5EC]/90">
              <Truck className="w-3.5 h-3.5 text-[#D7B56D] shrink-0" />
              <span>FREE SHIPPING ABOVE INR 1,999</span>
            </div>
            
            <span className="text-[#B68A3A]/50 select-none text-xs">|</span>

            <div className="flex items-center gap-2 text-[#FAF5EC]">
              <Sparkles className="w-3.5 h-3.5 text-[#D7B56D] shrink-0" />
              <span className="font-semibold text-[#D7B56D]">HANDMADE HERITAGE JEWELLERY</span>
            </div>

            <span className="text-[#B68A3A]/50 select-none text-xs">|</span>

            <div className="flex items-center gap-2 text-[#FAF5EC]/90">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D7B56D] shrink-0" />
              <span>COD AVAILABLE</span>
            </div>
          </div>

          {/* Mobile: Subtle Smooth Crossfade Rotator */}
          <div className="md:hidden w-full flex items-center justify-center min-h-[18px]">
            <AnimatePresence mode="wait">
              {(() => {
                const CurrentIcon = announcements[activeAnnouncementIdx].icon;
                return (
                  <motion.div
                    key={activeAnnouncementIdx}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2 text-[#FAF5EC] font-medium"
                  >
                    <CurrentIcon className="w-3.5 h-3.5 text-[#D7B56D] shrink-0" />
                    <span>{announcements[activeAnnouncementIdx].text}</span>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* 2. Navigation Header (Ivory #FAF5EC, Deep Maroon #5B1018, Antique Gold #B68A3A) */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 select-none ${
          isScrolled
            ? 'bg-[#FAF5EC]/95 backdrop-blur-md border-b border-[#E7D7C0] shadow-sm'
            : 'bg-[#FAF5EC] border-b border-[#E7D7C0]/80'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 min-h-[88px] md:min-h-[96px] py-2 flex items-center justify-between">
          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2 text-[#5B1018] hover:text-[#B68A3A] transition-colors cursor-pointer"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open navigation menu'}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6 stroke-[1.8]" /> : <Menu className="w-6 h-6 stroke-[1.8]" />}
          </button>

          {/* Left: Transparent Adiparva Logo Lockup */}
          <LogoLockup size="md" />

          {/* Centre: Desktop Navigation Links (Maroon #5B1018 + Gold Hover) */}
          <nav className="hidden xl:flex items-center space-x-9" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <div
                  key={link.label}
                  className="relative group py-5"
                  onMouseEnter={() => link.hasMega && setIsMegaMenuOpen(true)}
                  onMouseLeave={() => link.hasMega && setIsMegaMenuOpen(false)}
                >
                  <Link
                    href={link.href}
                    prefetch={true}
                    className={`font-sans text-[13px] font-medium tracking-[0.12em] uppercase transition-colors duration-200 relative flex items-center gap-1.5 ${
                      isActive
                        ? 'text-[#5B1018] font-semibold'
                        : 'text-[#5B1018]/85 hover:text-[#B68A3A]'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.hasMega && <ChevronDown className="w-3.5 h-3.5 text-[#B68A3A] group-hover:rotate-180 transition-transform duration-200" />}
                    
                    {/* Gold Underline Indicator */}
                    <span
                      className={`absolute -bottom-1 left-0 h-[2px] bg-[#B68A3A] transition-all duration-300 rounded-full ${
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </Link>

                  {/* Mega Menu Dropdown */}
                  {link.hasMega && isMegaMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.25 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 w-[860px] bg-[#FAF5EC] border border-[#E7D7C0] p-6 shadow-xl z-50 text-[#5B1018] rounded-[3px]"
                    >
                      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E7D7C0]">
                        <span className="font-serif text-lg text-[#5B1018] font-medium">Explore The Heritage Collection</span>
                        <Link
                          href="/collections"
                          prefetch={true}
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="text-[11px] font-sans font-semibold text-[#B68A3A] hover:text-[#5B1018] uppercase tracking-[0.16em] transition-colors"
                        >
                          View All Pieces →
                        </Link>
                      </div>
                      <div className="grid grid-cols-4 gap-5">
                        {categories.slice(0, 4).map((cat) => {
                          const displayImg = cat.image || cat.heroImage || `/images/categories/${cat.slug}.jpg`;
                          return (
                            <Link
                              key={cat.id}
                              href={`/collections/${cat.slug}`}
                              prefetch={true}
                              onClick={() => setIsMegaMenuOpen(false)}
                              className="group/item flex flex-col space-y-2.5 p-2 rounded-[2px] hover:bg-[#F2E7D7]/60 transition-colors"
                            >
                              <div className="aspect-[4/5] relative overflow-hidden rounded-[2px] border border-[#E7D7C0]">
                                <Image
                                  src={displayImg}
                                  alt={cat.name}
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover/item:scale-105"
                                  sizes="200px"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80 group-hover/item:opacity-60 transition-opacity" />
                                <span className="absolute bottom-2 left-2 right-2 text-white font-serif text-sm font-medium drop-shadow-sm">
                                  {cat.name}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-[#765E55]">{cat.pieceCount} Pieces</span>
                                <span className="text-[#B68A3A] group-hover/item:translate-x-0.5 transition-transform font-medium">→</span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right: Functional Action Icons (Deep Maroon/Brown #3B090D, hover Antique Gold #B68A3A) */}
          <div className="flex items-center space-x-5 sm:space-x-6 text-[#3B090D]">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 hover:text-[#B68A3A] transition-colors cursor-pointer"
              aria-label="Search jewellery collection"
            >
              <Search className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              prefetch={true}
              className="p-1.5 hover:text-[#B68A3A] transition-colors relative"
              aria-label="View saved wishlist"
            >
              <Heart className="w-5 h-5 stroke-[1.8]" />
              {wishlistProductIds.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#5B1018] border-2 border-[#FAF5EC]" />
              )}
            </Link>

            {/* Account */}
            <Link
              href="/account"
              prefetch={true}
              className="p-1.5 hover:text-[#B68A3A] transition-colors hidden sm:block"
              aria-label="Customer Account"
            >
              <User className="w-5 h-5 stroke-[1.8]" />
            </Link>

            {/* Shopping Bag Button with Badge */}
            <button
              onClick={toggleCart}
              className="p-1.5 hover:text-[#B68A3A] transition-colors relative flex items-center cursor-pointer"
              aria-label="Open shopping bag"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#3B090D] text-[#FAF5EC] font-sans text-[10px] font-bold flex items-center justify-center border border-[#FAF5EC] shadow-xs">
                {totalCartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Full-Screen Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'calc(100vh - 120px)' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="xl:hidden fixed inset-x-0 top-[120px] bg-[#FAF5EC] z-50 p-6 sm:p-8 flex flex-col justify-between border-t border-[#E7D7C0] overflow-y-auto"
            >
              <nav className="flex flex-col space-y-4 pt-2">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="font-serif text-[26px] font-normal text-[#5B1018] hover:text-[#B68A3A] transition-colors block border-b border-[#E7D7C0] pb-3"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="space-y-4 pt-8 pb-10 border-t border-[#E7D7C0]">
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="h-10 px-4 bg-[#F2E7D7] border border-[#E7D7C0] rounded-[2px] font-sans text-xs uppercase tracking-wider text-[#5B1018] font-semibold flex items-center justify-center"
                  >
                    My Account
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="h-10 px-4 bg-[#F2E7D7] border border-[#E7D7C0] rounded-[2px] font-sans text-xs uppercase tracking-wider text-[#5B1018] font-semibold flex items-center justify-center"
                  >
                    Saved Pieces
                  </Link>
                </div>
                <div className="text-center font-sans text-[11px] uppercase tracking-[0.2em] text-[#765E55]">
                  ADI PARVA · THE TEMPLE OF TRADITION
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Slide-out Cart Sheet & Search Overlay */}
      <CartSheet />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
