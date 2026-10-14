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
      <div className="absolute inset-0 bg-[#3B090D]/50 backdrop-blur-xs" onClick={handleClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF5EC] border-l border-[#E7D7C0] flex flex-col justify-between text-[#765E55] shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-[#E7D7C0] flex items-center justify-between bg-[#F2E7D7]">
            <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#B68A3A] font-semibold">
              SHOPPING BAG ({cartItems.reduce((acc, item) => acc + item.qty, 0)})
            </span>

            <button
              onClick={handleClose}
              className="text-[#5B1018] hover:text-[#3B090D] transition-colors p-1 cursor-pointer"
              aria-label="Close cart sheet"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          {cartItems.length > 0 && (
            <div className="px-6 py-3 bg-[#FAF5EC] border-b border-[#E7D7C0] text-center font-sans text-xs">
              {isFreeShipping ? (
                <span className="text-[#167A52] font-medium">✓ You qualify for free express delivery</span>
              ) : (
                <span className="text-[#765E55]">
                  Add ₹{amountNeededForFreeShipping.toLocaleString('en-IN')} more for free shipping
                </span>
              )}
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 divide-y divide-[#E7D7C0]">
            {cartItems.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <p className="font-serif text-2xl text-[#5B1018]">Your bag is currently empty.</p>
                <p className="font-sans text-xs text-[#765E55]">Discover handcrafted temple jewellery in our collection.</p>
                <button
                  onClick={handleClose}
                  className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#B68A3A] hover:text-[#5B1018] pt-4 font-semibold"
                >
                  START EXPLORING →
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const plateNo = `PLATE AP-${String(Math.abs(item.productId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 800 + 100).padStart(4, '0')}`;
                return (
                  <div key={`${item.productId}-${item.variantId}`} className="pt-6 first:pt-0 flex gap-4">
                    <div className="relative w-16 aspect-[3/4] bg-[#3B090D] rounded-[2px] overflow-hidden border border-[#B68A3A]/40 shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#B68A3A] font-semibold">
                        {plateNo}
                      </div>
                      <h4 className="font-serif text-base text-[#5B1018] leading-tight font-normal">{item.name}</h4>
                      <div className="font-sans text-xs text-[#765E55]">{item.variantLabel}</div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-[#E7D7C0] rounded-[2px] h-7 bg-[#FAF5EC]">
                          <button
                            onClick={() => updateQty(item.productId, item.variantId, Math.max(1, item.qty - 1))}
                            className="w-6 h-full flex items-center justify-center text-xs text-[#5B1018] hover:bg-[#E7D7C0] cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-sans text-xs text-[#5B1018] font-semibold">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.productId, item.variantId, item.qty + 1)}
                            className="w-6 h-full flex items-center justify-center text-xs text-[#5B1018] hover:bg-[#E7D7C0] cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-sans text-sm font-semibold text-[#5B1018] tabular-nums">
                          ₹{(item.price * item.qty).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="text-[#765E55] hover:text-[#5B1018] p-1 transition-colors cursor-pointer"
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
            <div className="p-6 border-t border-[#E7D7C0] bg-[#F2E7D7] space-y-4">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-[#FAF5EC] border border-[#E7D7C0] px-3 py-1.5 text-xs text-[#5B1018] placeholder-[#765E55]/60 rounded-[2px] outline-none uppercase tracking-wider font-sans focus:border-[#B68A3A]"
                />
                <button
                  type="submit"
                  className="px-4 border border-[#5B1018] bg-[#5B1018] text-[#FAF5EC] font-sans text-[10px] uppercase tracking-[0.2em] font-semibold rounded-[2px] hover:bg-[#3B090D] cursor-pointer"
                >
                  APPLY
                </button>
              </form>
              {couponError && <p className="text-xs text-[#B3261E]">{couponError}</p>}

              <div className="space-y-2 font-sans text-xs text-[#765E55]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#5B1018] font-semibold tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#167A52] font-semibold">
                    <span>Offer Discount</span>
                    <span className="tabular-nums">−₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between font-serif text-lg text-[#5B1018] border-t border-[#E7D7C0] pt-2">
                  <span>Total</span>
                  <span className="tabular-nums font-semibold">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={handleClose}
                className="w-full h-12 bg-[#5B1018] text-[#FAF5EC] hover:bg-[#3B090D] font-sans text-xs uppercase tracking-[0.22em] font-semibold flex items-center justify-center rounded-[2px] shadow-sm transition-colors cursor-pointer"
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
