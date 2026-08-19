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

export function ProductCard({ product, categoryName, showRating = false }: ProductCardProps) {
  const [isAdded, setIsAdded] = React.useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isWishlisted = useWishlistStore((state) => state.isInWishlist(product.id));

  const mainImage = product.images[0] || '/images/products/maharani-temple-necklace-1.jpg';

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

  const displayCategory = categoryName || product.collectionTag || 'TEMPLE JEWELLERY';

  return (
    <div className="group relative flex flex-col justify-between select-none bg-[var(--color-surface)] border border-[var(--color-cream-200)] rounded-xs overflow-hidden shadow-xs hover:shadow-md transition-all duration-300">
      {/* 4:5 Image Container */}
      <Link
        href={`/piece/${product.slug}`}
        className="block relative aspect-[4/5] bg-[var(--color-ink-900)] overflow-hidden w-full"
      >
        <Image
          src={mainImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover transition-transform duration-560 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />

        {/* NEW Badge Top-Left */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="font-sans text-[9px] uppercase tracking-[0.14em] font-semibold bg-[var(--color-ink-900)] text-[var(--color-gold-400)] px-2 py-0.5 rounded-xs shadow-xs">
            NEW
          </span>
        </div>

        {/* Wishlist Heart Top-Right */}
        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-full bg-[var(--color-ink-900)]/60 text-[var(--color-surface)] hover:text-[var(--color-gold-400)] transition-all cursor-pointer"
        >
          <Heart
            className={`w-3.5 h-3.5 stroke-[1.5] ${
              isWishlisted ? 'fill-[var(--color-gold-400)] text-[var(--color-gold-400)]' : ''
            }`}
          />
        </button>
      </Link>

      {/* Product Information Details */}
      <div className="p-3 flex flex-col flex-1 justify-between space-y-2">
        <div className="space-y-1">
          {/* Product Name */}
          <Link href={`/piece/${product.slug}`} className="block">
            <h4 className="font-serif font-medium text-[14px] leading-snug text-[var(--color-text-900)] group-hover:text-[var(--color-gold-600)] transition-colors line-clamp-1">
              {product.name}
            </h4>
          </Link>

          {/* Price Row */}
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-[15px] font-semibold text-[var(--color-text-900)] [font-variant-numeric:lining-nums]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.compareAtPrice && (
              <span className="font-sans text-[12px] text-[var(--color-text-400)] line-through [font-variant-numeric:lining-nums]">
                ₹{product.compareAtPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Rating Stars */}
          <div className="flex items-center gap-1 text-[11px] text-[var(--color-gold-600)] pt-0.5">
            <span>★★★★★</span>
            <span className="text-[var(--color-text-500)] text-[10px]">({product.reviewCount || 42})</span>
          </div>
        </div>

        {/* ADD TO CART Button */}
        <button
          onClick={handleQuickAdd}
          className="w-full mt-2 h-[34px] bg-[var(--color-ink-900)] text-[var(--color-gold-100)] font-sans text-[10px] uppercase tracking-[0.14em] font-semibold flex items-center justify-center gap-1.5 rounded-xs hover:bg-[var(--color-ink-800)] hover:text-[var(--color-gold-400)] transition-all cursor-pointer"
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5 text-[var(--color-ok-fg)]" />
              <span>ADDED TO CART</span>
            </>
          ) : (
            <span>ADD TO CART</span>
          )}
        </button>
      </div>
    </div>
  );
}
