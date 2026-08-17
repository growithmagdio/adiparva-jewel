'use client';

import * as React from 'react';
import Link from 'next/link';
import { Heart, Eye, ShoppingBag, Check } from 'lucide-react';
import { MicroLabel, Price } from '@/components/primitives';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { Product } from '@/lib/data/types';
import { useCartStore } from '@/lib/store/use-cart-store';
import { useWishlistStore } from '@/lib/store/use-wishlist-store';
import { clsx } from 'clsx';

export interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const [isAdded, setIsAdded] = React.useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isWishlisted = useWishlistStore((state) => state.isInWishlist(product.id));

  const mainImage = product.images[0] || '/images/products/maharani-temple-necklace-1.jpg';

  const handleAddToCart = (e: React.MouseEvent) => {
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
    <div className="group relative bg-[var(--color-surface)] border border-[var(--color-cream-200)] rounded-[var(--radius-card)] overflow-hidden shadow-[0_1px_2px_rgba(28,15,7,0.04)] hover:shadow-[0_8px_24px_rgba(28,15,7,0.08)] hover:border-[var(--color-gold-500)]/40 transition-all duration-300 flex flex-col justify-between select-none">
      <Link href={`/piece/${product.slug}`} className="block relative aspect-[4/5] bg-[var(--color-cream-100)] overflow-hidden">
        {/* Main Image */}
        <ImageWithFallback
          src={mainImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Collection Tag Ribbon */}
        {product.collectionTag && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-block px-2.5 py-1 bg-[var(--color-ink-900)] text-[var(--color-gold-400)] font-sans font-semibold text-[10px] uppercase tracking-[0.14em] rounded-[2px]">
              {product.collectionTag}
            </span>
          </div>
        )}

        {/* Wishlist Heart Top Right */}
        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-[var(--color-surface)]/90 backdrop-blur-xs flex items-center justify-center text-[var(--color-text-700)] hover:text-[var(--color-risk-fg)] transition-all shadow-xs"
        >
          <Heart className={clsx('w-4 h-4', isWishlisted && 'fill-[var(--color-risk-fg)] text-[var(--color-risk-fg)]')} />
        </button>

        {/* Quick View & Reserve Slide-Up Bar */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 flex gap-2">
          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="flex-1 py-2 bg-[var(--color-surface)] text-[var(--color-text-900)] font-sans font-medium text-xs rounded-[var(--radius-card)] flex items-center justify-center gap-1.5 hover:bg-[var(--color-cream-100)] transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick view</span>
            </button>
          )}

          <button
            onClick={handleAddToCart}
            className="flex-1 py-2 bg-[var(--color-gold-600)] text-white font-sans font-medium text-xs rounded-[var(--radius-card)] flex items-center justify-center gap-1.5 hover:bg-[var(--color-gold-700)] transition-colors cursor-pointer"
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Reserved</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Reserve</span>
              </>
            )}
          </button>
        </div>
      </Link>

      {/* Card Info Details */}
      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between border-t border-[var(--color-cream-200)]/60">
        <div>
          <MicroLabel className="text-[var(--color-gold-600)] text-[10px] mb-1">
            {product.artisanCluster || 'TEMPLE JEWELLERY'}
          </MicroLabel>
          <Link href={`/piece/${product.slug}`} className="block">
            <h4 className="font-serif font-medium text-base text-[var(--color-text-900)] group-hover:text-[var(--color-gold-600)] transition-colors line-clamp-1">
              {product.name}
            </h4>
          </Link>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <Price amount={product.price} compareAtAmount={product.compareAtPrice} size="sm" />
          {product.totalStock <= 3 && product.totalStock > 0 && (
            <span className="text-[10px] font-sans font-semibold text-[var(--color-risk-fg)] uppercase tracking-wider">
              {product.totalStock} left
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
