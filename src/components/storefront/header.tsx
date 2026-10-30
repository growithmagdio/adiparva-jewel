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
    { label: 'Our Story', href: '/heritage' },
    { label: 'Contact', href: '/contact' },
    { label: 'Wishlist', href: '/wishlist' },
    { label: 'Account', href: '/account' },
  ];

  const collectionStrip = [
    { label: 'Temple Necklaces', href: '/collections/temple-jewellery' },
    { label: 'Jhumkas & Earrings', href: '/collections/jhumkas' },
    { label: 'Bangles & Kada', href: '/collections/bangles-kada' },
    { label: 'Vaddanams (Hip Belts)', href: '/collections/oddiyanam' },
    { label: 'Bridal Parures', href: '/collections/bridal-sets' },
    { label: 'Maang Tikka & Accessories', href: '/collections/maang-tikka-nath' },
  ];

  const isCollectionActive = (href: string) => {
    if (pathname === href) return true;
    if (href === '/collections/temple-jewellery' && (pathname === '/collections/temple' || pathname === '/collections/necklaces')) return true;
    if (href === '/collections/jhumkas' && pathname === '/collections/earrings') return true;
    if (href === '/collections/bangles-kada' && pathname === '/collections/bangles') return true;
    if (href === '/collections/oddiyanam' && pathname === '/collections/vaddanams') return true;
    if (href === '/collections/bridal-sets' && pathname === '/collections/bridal') return true;
    if (href === '/collections/maang-tikka-nath' && pathname === '/collections/accessories') return true;
    return false;
  };

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

          {/* Centre: Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-7 lg:space-x-8" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <div key={link.label} className="relative py-4">
                  <Link
                    href={link.href}
                    prefetch={true}
                    className={`font-sans text-[12.5px] font-medium tracking-[0.14em] uppercase transition-colors duration-200 relative flex items-center ${
                      isActive
                        ? 'text-[#5B1018] font-bold'
                        : 'text-[#5B1018]/90 hover:text-[#B68A3A]'
                    }`}
                  >
                    <span>{link.label}</span>
                    
                    {/* Gold Underline Indicator */}
                    <span
                      className={`absolute -bottom-1 left-0 h-[2px] bg-[#B68A3A] transition-all duration-300 rounded-full ${
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Right: Functional Action Icons */}
          <div className="flex items-center space-x-5 sm:space-x-6 text-[#3B090D]">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 hover:text-[#B68A3A] transition-colors cursor-pointer"
              aria-label="Search jewellery collection"
            >
              <Search className="w-5 h-5 stroke-[1.8]" />
            </button>

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

        {/* 3. Horizontal Category Strip (Always Visible Under Main Nav & Sticky on Scrolling) */}
        <div className="bg-[#FAF5EC] border-t border-[#E7D7C0]/80 py-2.5 px-4 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none">
          <div className="max-w-[1440px] mx-auto flex items-center justify-start lg:justify-center gap-6 sm:gap-8 text-[11px] sm:text-[12px] uppercase tracking-[0.16em] font-sans font-medium whitespace-nowrap">
            {collectionStrip.map((item, index) => {
              const active = isCollectionActive(item.href);
              return (
                <React.Fragment key={item.href}>
                  {index > 0 && (
                    <span className="text-[#B68A3A]/40 text-[9px] shrink-0 pointer-events-none select-none">
                      ❖
                    </span>
                  )}
                  <Link
                    href={item.href}
                    prefetch={true}
                    className={`transition-all duration-200 py-1 relative shrink-0 ${
                      active
                        ? 'text-[#5B1018] font-bold'
                        : 'text-[#5B1018]/80 hover:text-[#B68A3A]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {active && (
                      <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#B68A3A] rounded-full" />
                    )}
                  </Link>
                </React.Fragment>
              );
            })}
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
              <div className="space-y-6">
                <nav className="flex flex-col space-y-2 pt-2">
                  <div className="text-[10.5px] uppercase tracking-[0.24em] text-[#B68A3A] font-semibold pb-1 border-b border-[#E7D7C0]">
                    MENU
                  </div>
                  {navLinks.map((link, idx) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`font-serif text-[22px] font-normal transition-colors block border-b border-[#E7D7C0]/60 pb-2 ${
                          pathname === link.href ? 'text-[#B68A3A] font-medium' : 'text-[#5B1018] hover:text-[#B68A3A]'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                <div className="space-y-3 pt-2">
                  <div className="text-[10.5px] uppercase tracking-[0.24em] text-[#B68A3A] font-semibold pb-1 border-b border-[#E7D7C0]">
                    COLLECTIONS
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                    {collectionStrip.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`py-2 px-3 rounded-[2px] border transition-colors ${
                          isCollectionActive(item.href)
                            ? 'bg-[#F2E7D7] border-[#B68A3A] text-[#5B1018] font-bold'
                            : 'bg-[#FAF5EC] border-[#E7D7C0] text-[#5B1018] hover:border-[#B68A3A]'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 pb-8 border-t border-[#E7D7C0]">
                <div className="text-center font-sans text-[11px] uppercase tracking-[0.2em] text-[#5B1018]/70">
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
