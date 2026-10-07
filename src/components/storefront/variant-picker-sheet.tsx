'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product, ProductVariant } from '@/lib/data/types';
import { X, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface VariantPickerSheetProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VariantPickerSheet({ product, isOpen, onClose }: VariantPickerSheetProps) {
  const router = useRouter();
  const [selectedVariantId, setSelectedVariantId] = React.useState<string>('');

  React.useEffect(() => {
    if (product && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].id);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  const mainImage = product.images[0] || '/images/products/maharani-temple-necklace-1.jpg';
  const isSoldOut = product.totalStock === 0 || (selectedVariant && selectedVariant.stock === 0);

  const handleProceedToBuyNow = () => {
    if (!selectedVariant || isSoldOut) return;
    onClose();
    router.push(`/checkout?buyNow=${product.id}&variant=${selectedVariant.id}&qty=1`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop overlay click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet / Dialog Content Box */}
      <div className="relative w-full max-w-lg bg-[#1C0F07] border border-[#B8761F]/40 rounded-t-[12px] sm:rounded-[8px] p-6 text-[#FAF0E4] shadow-2xl z-10 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#3D2418] pb-4">
          <div>
            <div className="font-marcellus text-[10px] uppercase tracking-[0.25em] text-[#C8891F]">
              SELECT VARIANT FOR BUY NOW
            </div>
            <h3 className="font-serif text-xl font-light text-[#FAF0E4] mt-0.5">{product.name}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 text-[#8B7D74] hover:text-[#FAF0E4] transition-colors rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Product Summary */}
        <div className="flex gap-4 items-center bg-[#2C1810] p-3 rounded-[4px] border border-[#3D2418]">
          <div className="relative w-16 aspect-[3/4] bg-[#1C0F07] rounded-[2px] overflow-hidden border border-[#B8761F]/30 shrink-0">
            <Image src={mainImage} alt={product.name} fill className="object-cover" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="font-sans text-lg font-medium text-[#FAF0E4] tabular-nums">
              ₹{(product.price + (selectedVariant?.priceDelta || 0)).toLocaleString('en-IN')}
            </div>
            <div className="font-jost text-xs text-[#8B7D74]">
              {selectedVariant ? selectedVariant.label : 'Standard Option'}
            </div>
            <div className="font-marcellus text-[10px] text-[#C8891F] uppercase tracking-wider">
              {selectedVariant?.stock > 0
                ? `${selectedVariant.stock} UNITS IN VAULT`
                : 'SOLD OUT'}
            </div>
          </div>
        </div>

        {/* Variant Radio List */}
        <div className="space-y-2.5">
          <label className="font-marcellus text-[11px] uppercase tracking-[0.2em] text-[#C8891F] block">
            AVAILABLE METAL & SIZES:
          </label>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {product.variants.map((v: ProductVariant) => {
              const active = v.id === selectedVariantId;
              const outOfStock = v.stock === 0;

              return (
                <div
                  key={v.id}
                  onClick={() => !outOfStock && setSelectedVariantId(v.id)}
                  className={`p-3.5 rounded-[4px] border flex items-center justify-between transition-all cursor-pointer ${
                    outOfStock
                      ? 'border-[#3D2418] opacity-50 cursor-not-allowed bg-[#1C0F07]'
                      : active
                      ? 'border-[#C8891F] bg-[#5C1A1B]/60 text-[#FAF0E4] shadow-md'
                      : 'border-[#3D2418] bg-[#2C1810] text-[#8B7D74] hover:border-[#B8761F]/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        active ? 'border-[#D9A441] bg-[#D9A441]' : 'border-[#5A3A26]'
                      }`}
                    >
                      {active && <Check className="w-3 h-3 text-[#1C0F07] stroke-[3]" />}
                    </div>
                    <div>
                      <div className="font-marcellus text-xs uppercase tracking-wider text-[#FAF0E4]">
                        {v.label}
                      </div>
                      <div className="text-xs text-[#8B7D74]">{v.metal}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    {v.priceDelta !== 0 && (
                      <div className="text-xs text-[#C8891F] font-medium">
                        {v.priceDelta > 0 ? `+₹${v.priceDelta}` : `-₹${Math.abs(v.priceDelta)}`}
                      </div>
                    )}
                    <div className="text-[10px] text-[#8B7D74]">
                      {outOfStock ? 'Sold Out' : `${v.stock} left`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-3">
          <button
            onClick={handleProceedToBuyNow}
            disabled={isSoldOut}
            className="w-full h-12 bg-[#5C1A1B] text-[#FAF0E4] hover:bg-[#441213] border border-[#B8761F]/50 font-marcellus text-[11px] uppercase tracking-[0.25em] font-semibold flex items-center justify-center gap-2 rounded-[2px] shadow-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>PROCEED TO BUY NOW</span>
            <ArrowRight className="w-4 h-4 text-[#D9A441]" />
          </button>
          <div className="flex items-center justify-center gap-2 font-marcellus text-[9px] uppercase tracking-[0.2em] text-[#8B7D74]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C8891F]" />
            <span>DIRECT FAST CHECKOUT · NO CART MUTATION</span>
          </div>
        </div>
      </div>
    </div>
  );
}
