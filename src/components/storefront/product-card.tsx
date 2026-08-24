'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Check } from 'lucide-react';
import { Product } from '@/lib/data/types';
import { useCartStore } from '@/lib/store/use-cart-store';
import { useWishlistStore } from '@/lib/store/use-wishlist-store';

export interface ProductCardProps {
  product: Product;
  categoryName?: string;
  showRating?: boolean;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAdded, setIsAdded] = React.useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isWishlisted = useWishlistStore((state) => state.isInWishlist(product.id));

  const mainImage = product.images[0] || '/images/products/maharani-temple-necklace-1.jpg';

  // Compute discount percentage if compareAtPrice is present
  const discountPercent = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  // Format plate number
  const plateNo =
    product.plateNumber ||
    `PLATE AP-${String(Math.abs(product.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 800 + 100).padStart(4, '0')}`;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const variant = product.variants[0] || {
      id: 'default-variant',
      label: '22K Gold Standard',
    };

    addItem({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      image: mainImage,
      price: product.price,
      variantLabel: variant.label,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="group relative flex flex-col justify-between bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 rounded-[4px] overflow-hidden transition-all duration-500 hover:border-[var(--color-temple-gold)]/60 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.6)]">
      {/* Vitrine Image Container */}
      <Link
        href={`/piece/${product.slug}`}
        className="block relative aspect-[4/5] bg-[var(--color-vault-black)] overflow-hidden w-full"
      >
        {/* 1px Inner Hairline Frame */}
        <div className="absolute inset-[6px] pointer-events-none z-20 border border-[var(--color-temple-gold)]/30 rounded-[2px] transition-colors duration-400 group-hover:border-[var(--color-gold-light)]/60" />

        {/* Inner Vignette Overlay */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ boxShadow: 'inset 0 0 50px rgba(0,0,0,0.65)' }}
        />

        <Image
          src={mainImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        />

        {/* Circular Wax Seal NEW Badge (Top-Left) */}
        {product.collectionTag === 'New arrival' && (
          <div className="absolute top-3 left-3 z-30">
            <span className="w-7 h-7 flex items-center justify-center font-marcellus text-[9px] uppercase font-bold bg-[var(--color-kemp-red)] text-[var(--color-ivory)] rounded-full shadow-lg border border-[var(--color-temple-gold)]/40 tracking-wider">
              NEW
            </span>
          </div>
        )}

        {/* Wishlist Heart Button (Top-Right) */}
        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-3 right-3 z-30 p-1.5 rounded-full bg-black/60 text-[var(--color-ivory)] hover:text-[var(--color-gold-light)] transition-all border border-[var(--color-temple-gold)]/30 cursor-pointer"
        >
          <Heart
            className={`w-3.5 h-3.5 stroke-[1.5] ${
              isWishlisted ? 'fill-[var(--color-gold-light)] text-[var(--color-gold-light)]' : ''
            }`}
          />
        </button>

        {/* Hover Slide-up Quick Add Hairline Bar */}
        <div className="absolute bottom-0 inset-x-0 z-30 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out p-2 bg-[var(--color-vault-black)]/90 backdrop-blur-xs border-t border-[var(--color-temple-gold)]/30 hidden sm:block">
          <button
            onClick={handleQuickAdd}
            className="w-full h-8 border border-[var(--color-temple-gold)] text-[var(--color-temple-gold)] hover:bg-[var(--color-burgundy-silk)] hover:text-[var(--color-ivory)] font-marcellus text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>ADDED TO ARCHIVE</span>
              </>
            ) : (
              <span>ADD TO CART</span>
            )}
          </button>
        </div>
      </Link>

      {/* Product Details Section */}
      <div className="p-3.5 flex flex-col flex-1 justify-between space-y-2">
        <div className="space-y-1">
          {/* Marcellus Archive Plate Number */}
          <div className="font-marcellus text-[10px] uppercase tracking-[0.25em] text-[var(--color-temple-gold)]/90 font-medium">
            {plateNo}
          </div>

          {/* Cormorant Product Title */}
          <Link href={`/piece/${product.slug}`} className="block">
            <h4 className="font-serif font-light text-[17px] leading-snug text-[var(--color-ivory)] group-hover:text-[var(--color-gold-light)] transition-colors line-clamp-1">
              {product.name}
            </h4>
          </Link>

          {/* Price Row + Discount Tag */}
          <div className="flex items-center gap-2 pt-0.5">
            <span className="font-sans text-[15px] font-normal text-[var(--color-ivory)] tabular-nums">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.compareAtPrice && (
              <span className="font-sans text-[12px] text-[#7A6F60] line-through tabular-nums">
                ₹{product.compareAtPrice.toLocaleString('en-IN')}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="font-marcellus text-[9px] uppercase tracking-wider font-semibold text-[var(--color-kemp-red)] border border-[var(--color-kemp-red)]/40 px-1 py-0.2">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-temple-gold)] pt-0.5">
            <span className="tracking-widest">★★★★★</span>
            <span className="text-[var(--color-sandal)] text-[10px]">({product.reviewCount || 42})</span>
          </div>
        </div>

        {/* Mobile Quick Add Button (Always visible on touch) */}
        <button
          onClick={handleQuickAdd}
          className="w-full mt-2 h-8 border border-[var(--color-temple-gold)]/60 text-[var(--color-temple-gold)] hover:bg-[var(--color-burgundy-silk)] hover:text-[var(--color-ivory)] font-marcellus text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 transition-all sm:hidden cursor-pointer"
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>ADDED</span>
            </>
          ) : (
            <span>ADD TO CART</span>
          )}
        </button>
      </div>
    </div>
  );
}
