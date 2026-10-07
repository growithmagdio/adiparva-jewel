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
import { LogoLockup } from '@/components/brand/logo-lockup';
import { getCategories } from '@/lib/data/queries';
import { Category } from '@/lib/data/types';

export function Header() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [categories, setCategories] = React.useState<Category[]>([]);

  const cartItems = useCartStore((state) => state.items);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const wishlistProductIds = useWishlistStore((state) => state.wishlistProductIds);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

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

      {/* 2. Header Navbar */}
      <header
        className={`sticky top-0 z-40 transition-all duration-500 select-none ${
          isScrolled
            ? 'bg-[#FBF7EE]/95 backdrop-blur-md border-b border-[#E2D6BC] shadow-md'
            : 'bg-[#FBF7EE]/80 backdrop-blur-sm border-b border-[#E2D6BC]/60'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 min-h-[96px] md:min-h-[110px] py-2 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2 text-[#2A1E17] hover:text-[#8A6A1F] transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6 stroke-[1.5]" /> : <Menu className="w-6 h-6 stroke-[1.5]" />}
          </button>

          {/* Logo Brand Block */}
          <LogoLockup />

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
                        ? 'text-[#8A6A1F] font-semibold'
                        : 'text-[#2A1E17]/90 hover:text-[#8A6A1F]'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.hasMega && <ChevronDown className="w-3 h-3 text-[#8A6A1F]" />}
                    
                    {/* Gold Underline Slide-in */}
                    <span
                      className={`absolute -bottom-1 left-0 h-[1.5px] bg-[#8A6A1F] transition-all duration-300 ${
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
                      className="absolute top-full left-1/2 -translate-x-1/2 w-[920px] bg-[#F4EEDF] border border-[#E2D6BC] p-8 shadow-2xl z-50 text-[#2A1E17]"
                    >
                      <div className="grid grid-cols-4 gap-6">
                        {categories.slice(0, 4).map((cat) => {
                          const displayImg = cat.image || cat.heroImage || `/images/categories/${cat.slug}.jpg`;
                          return (
                            <Link
                              key={cat.id}
                              href={`/collections/${cat.slug}`}
                              onClick={() => setIsMegaMenuOpen(false)}
                              className="group/item flex flex-col space-y-3"
                            >
                              <div className="aspect-[4/5] relative overflow-hidden rounded-[4px] border border-[#E2D6BC]">
                                <Image
                                  src={displayImg}
                                  alt={cat.name}
                                  fill
                                  className="object-cover transition-transform duration-700 group-hover/item:scale-105"
                                  sizes="220px"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover/item:bg-black/10 transition-colors" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-serif text-lg text-[#2A1E17] group-hover/item:text-[#8A6A1F] transition-colors">
                                  {cat.name}
                                </span>
                                <span className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[#8A6A1F]">
                                  {cat.pieceCount} Pieces
                                </span>
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

          {/* Action Icons — 1.5px Gold Stroke */}
          <div className="flex items-center space-x-6 text-[#8A6A1F]">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 hover:text-[#5C1A1B] transition-colors cursor-pointer"
              aria-label="Search collection"
            >
              <Search className="w-5 h-5 stroke-[1.5]" />
            </button>

            <Link
              href="/wishlist"
              className="p-1.5 hover:text-[#5C1A1B] transition-colors relative"
              aria-label="View wishlist"
            >
              <Heart className="w-5 h-5 stroke-[1.5]" />
              {wishlistProductIds.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#5C1A1B] border border-[#FBF7EE]" />
              )}
            </Link>

            <Link
              href="/account"
              className="p-1.5 hover:text-[#5C1A1B] transition-colors hidden sm:block"
              aria-label="Account"
            >
              <User className="w-5 h-5 stroke-[1.5]" />
            </Link>

            {/* Cart Icon + Maroon Count Badge */}
            <button
              onClick={toggleCart}
              className="p-1.5 hover:text-[#5C1A1B] transition-colors relative flex items-center cursor-pointer"
              aria-label="View shopping bag"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#5C1A1B] text-[#FBF7EE] font-marcellus text-[9px] font-bold flex items-center justify-center border border-[#FBF7EE]">
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
              className="xl:hidden fixed inset-0 top-[120px] bg-[#FBF7EE] z-50 p-8 flex flex-col justify-between border-t border-[#E2D6BC]"
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
                      className="font-serif text-[32px] font-light text-[#2A1E17] hover:text-[#8A6A1F] transition-colors block border-b border-[#E2D6BC] pb-3"
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
                  className="font-marcellus text-sm uppercase tracking-[0.3em] text-[#8A6A1F] block"
                >
                  CURATOR ACCOUNT →
                </Link>
                <div className="font-marcellus text-[10px] uppercase tracking-[0.25em] text-[#6B5B4E]">
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
