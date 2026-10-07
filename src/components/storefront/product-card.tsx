'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, Check, Zap } from 'lucide-react';
import { Product } from '@/lib/data/types';
import { useCartStore } from '@/lib/store/use-cart-store';
import { useWishlistStore } from '@/lib/store/use-wishlist-store';
import { VariantPickerSheet } from './variant-picker-sheet';

export interface ProductCardProps {
  product: Product;
  categoryName?: string;
  showRating?: boolean;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const [isAdded, setIsAdded] = React.useState(false);
  const [isVariantSheetOpen, setIsVariantSheetOpen] = React.useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isWishlisted = useWishlistStore((state) => state.isInWishlist(product.id));

  const mainImage = product.images[0] || '/images/products/maharani-temple-necklace-1.jpg';

  const discountPercent = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

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

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.totalStock === 0) return;

    if (product.variants && product.variants.length > 1) {
      setIsVariantSheetOpen(true);
    } else {
      const variantId = product.variants?.[0]?.id || 'default-variant';
      router.push(`/checkout?buyNow=${product.id}&variant=${variantId}&qty=1`);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const isSoldOut = product.totalStock === 0;

  return (
    <>
      <div className="group relative flex flex-col justify-between bg-[#F4EEDF] border border-[#E2D6BC] rounded-[4px] overflow-hidden transition-all duration-500 hover:border-[#B8923A] hover:-translate-y-1 hover:shadow-lg">
        {/* Image Vitrine Container */}
        <Link
          href={`/piece/${product.slug}`}
          className="block relative aspect-[4/5] bg-[#120D0E] overflow-hidden w-full"
        >
          {/* Inset Hairline Frame */}
          <div className="absolute inset-[6px] pointer-events-none z-20 border border-[#B8923A]/40 rounded-[2px] transition-colors duration-400 group-hover:border-[#B8923A]" />

          {/* Vignette Shadow Overlay */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{ boxShadow: 'inset 0 0 50px rgba(0,0,0,0.55)' }}
          />

          <Image
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          />

          {/* Stock Badges */}
          {isSoldOut ? (
            <div className="absolute top-3 left-3 z-30">
              <span className="px-2.5 py-1 font-marcellus text-[9px] uppercase font-bold bg-[#B3261E] text-[#FBF7EE] rounded-[2px] shadow-lg border border-[#FBE9E7]/40 tracking-wider">
                SOLD OUT
              </span>
            </div>
          ) : product.totalStock <= (product.lowStockThreshold ?? 3) ? (
            <div className="absolute top-3 left-3 z-30">
              <span className="px-2 py-0.5 font-marcellus text-[9px] uppercase font-bold bg-[#9A6A05] text-[#FBF7EE] rounded-[2px] shadow-md tracking-wider">
                ONLY {product.totalStock} LEFT
              </span>
            </div>
          ) : product.collectionTag === 'New arrival' ? (
            <div className="absolute top-3 left-3 z-30">
              <span className="w-7 h-7 flex items-center justify-center font-marcellus text-[9px] uppercase font-bold bg-[#5C1A1B] text-[#FBF7EE] rounded-full shadow-lg border border-[#B8923A]/40 tracking-wider">
                NEW
              </span>
            </div>
          ) : null}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute top-3 right-3 z-30 p-1.5 rounded-full bg-[#FBF7EE]/90 text-[#2A1E17] hover:text-[#5C1A1B] transition-all border border-[#E2D6BC] cursor-pointer shadow-sm"
          >
            <Heart
              className={`w-3.5 h-3.5 stroke-[1.5] ${
                isWishlisted ? 'fill-[#5C1A1B] text-[#5C1A1B]' : ''
              }`}
            />
          </button>

          {/* Hover Action Bar (Desktop Dual Buttons) */}
          <div className="absolute bottom-0 inset-x-0 z-30 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out p-2 bg-[#FBF7EE]/95 backdrop-blur-xs border-t border-[#E2D6BC] hidden sm:block">
            {isSoldOut ? (
              <button
                disabled
                className="w-full h-8 border border-neutral-300 bg-neutral-200 text-neutral-500 font-marcellus text-[10px] uppercase tracking-[0.2em] flex items-center justify-center cursor-not-allowed opacity-80"
              >
                SOLD OUT
              </button>
            ) : (
              <div className="flex gap-1.5">
                <button
                  onClick={handleQuickAdd}
                  className="flex-1 h-8 border border-[#8A6A1F] text-[#8A6A1F] hover:bg-[#8A6A1F]/10 font-marcellus text-[9px] uppercase tracking-[0.15em] flex items-center justify-center gap-1 transition-all cursor-pointer rounded-[2px]"
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>ADDED</span>
                    </>
                  ) : (
                    <span>ADD TO CART</span>
                  )}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 h-8 bg-[#5C1A1B] text-[#FBF7EE] hover:bg-[#441213] font-marcellus text-[9px] uppercase tracking-[0.15em] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer rounded-[2px]"
                >
                  <Zap className="w-3 h-3 text-[#D9A441] fill-current" />
                  <span>BUY NOW</span>
                </button>
              </div>
            )}
          </div>
        </Link>

        {/* Details Section */}
        <div className="p-3.5 flex flex-col flex-1 justify-between space-y-2">
          <div className="space-y-1">
            <div className="font-marcellus text-[10px] uppercase tracking-[0.25em] text-[#8A6A1F] font-medium">
              {plateNo}
            </div>

            <Link href={`/piece/${product.slug}`} className="block">
              <h4 className="font-serif font-light text-[17px] leading-snug text-[#2A1E17] group-hover:text-[#8A6A1F] transition-colors line-clamp-1">
                {product.name}
              </h4>
            </Link>

            <div className="flex items-center gap-2 pt-0.5">
              <span className="font-sans text-[15px] font-medium text-[#2A1E17] tabular-nums">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.compareAtPrice && (
                <span className="font-sans text-[12px] text-[#6B5B4E] line-through tabular-nums">
                  ₹{product.compareAtPrice.toLocaleString('en-IN')}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="font-marcellus text-[9px] uppercase tracking-wider font-semibold text-[#5C1A1B] border border-[#5C1A1B]/40 px-1 py-0.2">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-[#8A6A1F] pt-0.5">
              <span className="tracking-widest">★★★★★</span>
              <span className="text-[#6B5B4E] text-[10px]">({product.reviewCount || 42})</span>
            </div>
          </div>

          {/* Mobile Buttons Row (Touch screens) */}
          <div className="sm:hidden pt-2">
            {isSoldOut ? (
              <button
                disabled
                className="w-full h-8 bg-neutral-200 text-neutral-500 font-marcellus text-[10px] uppercase tracking-[0.2em] flex items-center justify-center cursor-not-allowed opacity-80"
              >
                SOLD OUT
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleQuickAdd}
                  className="flex-1 h-8 border border-[#8A6A1F] text-[#8A6A1F] font-marcellus text-[9px] uppercase tracking-[0.1em] flex items-center justify-center gap-1 rounded-[2px]"
                >
                  {isAdded ? 'ADDED' : 'ADD TO CART'}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 h-8 bg-[#5C1A1B] text-[#FBF7EE] font-marcellus text-[9px] uppercase tracking-[0.1em] font-semibold flex items-center justify-center gap-1 rounded-[2px]"
                >
                  BUY NOW
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Variant Picker Sheet for Multi-Variant Products */}
      <VariantPickerSheet
        product={product}
        isOpen={isVariantSheetOpen}
        onClose={() => setIsVariantSheetOpen(false)}
      />
    </>
  );
}
