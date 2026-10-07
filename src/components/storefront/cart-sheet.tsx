'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Check } from 'lucide-react';
import { validateCoupon } from '@/lib/data/queries';
import { Coupon } from '@/lib/data/types';
import { useCartStore } from '@/lib/store/use-cart-store';

export interface CartSheetProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function CartSheet({ isOpen: propIsOpen, onClose: propOnClose }: CartSheetProps) {
  const storeIsCartOpen = useCartStore((state) => state.isCartOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const cartItems = useCartStore((state) => state.items);
  const updateQty = useCartStore((state) => state.updateQty);
  const removeItem = useCartStore((state) => state.removeItem);

  const isOpen = propIsOpen !== undefined ? propIsOpen : storeIsCartOpen;
  const handleClose = propOnClose || closeCart;

  const [couponCode, setCouponCode] = React.useState('');
  const [appliedCoupon, setAppliedCoupon] = React.useState<Coupon | null>(null);
  const [couponError, setCouponError] = React.useState('');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      discount = Math.round((subtotal * appliedCoupon.value) / 100);
      if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
        discount = appliedCoupon.maxDiscount;
      }
    } else {
      discount = appliedCoupon.value;
    }
  }

  const FREE_SHIPPING_THRESHOLD = 1999;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0;
  const amountNeededForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;
  const shipping = isFreeShipping ? 0 : 450;
  const total = Math.max(0, subtotal - discount + shipping);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError('');

    const res = await validateCoupon(couponCode, subtotal);
    if (!res.valid) {
      setCouponError(res.message || 'Invalid coupon code.');
    } else if (res.coupon) {
      setAppliedCoupon(res.coupon);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xs" onClick={handleClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#F4EEDF] border-l border-[#E2D6BC] flex flex-col justify-between text-[#2A1E17] shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-[#E2D6BC] flex items-center justify-between">
            <span className="font-marcellus text-[11px] uppercase tracking-[0.25em] text-[#8A6A1F] font-semibold">
              RESERVATION VITRINE ({cartItems.reduce((acc, item) => acc + item.qty, 0)})
            </span>

            <button
              onClick={handleClose}
              className="text-[#2A1E17] hover:text-[#5C1A1B] transition-colors p-1 cursor-pointer"
              aria-label="Close cart sheet"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          {cartItems.length > 0 && (
            <div className="px-6 py-3 bg-[#FBF7EE] border-b border-[#E2D6BC] text-center font-jost text-xs">
              {isFreeShipping ? (
                <span className="text-[#8A6A1F] font-medium">✓ You qualify for free insured transit</span>
              ) : (
                <span className="text-[#6B5B4E]">
                  Add ₹{amountNeededForFreeShipping.toLocaleString('en-IN')} more for free insured transit
                </span>
              )}
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 divide-y divide-[#E2D6BC]">
            {cartItems.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <p className="font-serif text-2xl text-[#2A1E17]">Your vitrine is empty.</p>
                <p className="font-jost text-xs text-[#6B5B4E]">Explore our living archive of fine jewellery plates.</p>
                <button
                  onClick={handleClose}
                  className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[#8A6A1F] hover:underline pt-4 font-semibold"
                >
                  START EXPLORING →
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const plateNo = `PLATE AP-${String(Math.abs(item.productId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 800 + 100).padStart(4, '0')}`;
                return (
                  <div key={`${item.productId}-${item.variantId}`} className="pt-6 first:pt-0 flex gap-4">
                    <div className="relative w-16 aspect-[3/4] bg-[#120D0E] rounded-[2px] overflow-hidden border border-[#B8923A]/40 shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="font-marcellus text-[9px] uppercase tracking-[0.2em] text-[#8A6A1F] font-medium">
                        {plateNo}
                      </div>
                      <h4 className="font-serif text-base text-[#2A1E17] leading-tight font-normal">{item.name}</h4>
                      <div className="font-jost text-xs text-[#6B5B4E]">{item.variantLabel}</div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-[#E2D6BC] rounded-[2px] h-7 bg-[#FBF7EE]">
                          <button
                            onClick={() => updateQty(item.productId, item.variantId, Math.max(1, item.qty - 1))}
                            className="w-6 h-full flex items-center justify-center text-xs text-[#2A1E17] hover:bg-[#E2D6BC]"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-jost text-xs text-[#2A1E17]">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.productId, item.variantId, item.qty + 1)}
                            className="w-6 h-full flex items-center justify-center text-xs text-[#2A1E17] hover:bg-[#E2D6BC]"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-sans text-sm font-medium text-[#2A1E17] tabular-nums">
                          ₹{(item.price * item.qty).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="text-[#6B5B4E] hover:text-[#5C1A1B] p-1 transition-colors cursor-pointer"
                      aria-label="Remove item"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary & CTA */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-[#E2D6BC] bg-[#FBF7EE] space-y-4">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-[#F4EEDF] border border-[#E2D6BC] px-3 py-1.5 text-xs text-[#2A1E17] placeholder-[#6B5B4E]/60 rounded-[2px] outline-none uppercase tracking-wider font-jost focus:border-[#8A6A1F]"
                />
                <button
                  type="submit"
                  className="px-4 border border-[#5C1A1B] bg-[#5C1A1B] text-[#FBF7EE] font-marcellus text-[10px] uppercase tracking-[0.2em] rounded-[2px] hover:bg-[#441213] cursor-pointer"
                >
                  APPLY
                </button>
              </form>

              <div className="space-y-2 font-jost text-xs text-[#6B5B4E]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#2A1E17] font-medium tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#5C1A1B] font-medium">
                    <span>Discount</span>
                    <span className="tabular-nums">−₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between font-serif text-lg text-[#2A1E17] border-t border-[#E2D6BC] pt-2">
                  <span>Total</span>
                  <span className="tabular-nums font-semibold">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={handleClose}
                className="w-full h-12 bg-[#5C1A1B] text-[#FBF7EE] hover:bg-[#441213] font-marcellus text-[11px] uppercase tracking-[0.25em] font-semibold flex items-center justify-center rounded-[2px] shadow-md transition-colors"
              >
                PROCEED TO CHECKOUT
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
