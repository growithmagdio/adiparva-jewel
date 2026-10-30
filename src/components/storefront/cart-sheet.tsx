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
      <div className="absolute inset-0 bg-[#2E070B]/75 backdrop-blur-xs" onClick={handleClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#2E070B] border-l border-[#B68A3A]/40 flex flex-col justify-between text-[#FAF5EC] shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-[#B68A3A]/30 flex items-center justify-between bg-[#3B090D]">
            <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#D7B56D] font-semibold">
              SHOPPING BAG ({cartItems.reduce((acc, item) => acc + item.qty, 0)})
            </span>

            <button
              onClick={handleClose}
              className="text-[#FAF5EC] hover:text-[#D7B56D] transition-colors p-1 cursor-pointer"
              aria-label="Close cart sheet"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          {cartItems.length > 0 && (
            <div className="px-6 py-3 bg-[#3B090D]/60 border-b border-[#B68A3A]/20 text-center font-sans text-xs">
              {isFreeShipping ? (
                <span className="text-emerald-400 font-medium">✓ You qualify for free express delivery</span>
              ) : (
                <span className="text-[#FAF5EC]/85 font-medium">
                  Add ₹{amountNeededForFreeShipping.toLocaleString('en-IN')} more for free shipping
                </span>
              )}
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 divide-y divide-[#B68A3A]/20">
            {cartItems.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <p className="font-serif text-2xl text-[#FAF5EC]">Your bag is currently empty.</p>
                <p className="font-sans text-xs text-[#FAF5EC]/80 font-medium">Discover handcrafted temple jewellery in our collection.</p>
                <button
                  onClick={handleClose}
                  className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#D7B56D] hover:text-[#FAF5EC] pt-4 font-semibold cursor-pointer transition-colors"
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
                      <div className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#D7B56D] font-semibold">
                        {plateNo}
                      </div>
                      <h4 className="font-serif text-base text-[#FAF5EC] leading-tight font-normal">{item.name}</h4>
                      <div className="font-sans text-xs text-[#FAF5EC]/75 font-medium">{item.variantLabel}</div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-[#B68A3A]/50 rounded-[2px] h-7 bg-[#3B090D]">
                          <button
                            onClick={() => updateQty(item.productId, item.variantId, Math.max(1, item.qty - 1))}
                            className="w-6 h-full flex items-center justify-center text-xs text-[#FAF5EC] hover:bg-[#5B1018] cursor-pointer transition-colors"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-sans text-xs text-[#FAF5EC] font-semibold">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.productId, item.variantId, item.qty + 1)}
                            className="w-6 h-full flex items-center justify-center text-xs text-[#FAF5EC] hover:bg-[#5B1018] cursor-pointer transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-sans text-sm font-semibold text-[#FAF5EC] tabular-nums">
                          ₹{(item.price * item.qty).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="text-[#FAF5EC]/60 hover:text-[#FF6B6B] p-1 transition-colors cursor-pointer"
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
            <div className="p-6 border-t border-[#B68A3A]/30 bg-[#3B090D] space-y-4">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-[#2E070B] border border-[#B68A3A]/40 px-3 py-1.5 text-xs text-[#FAF5EC] placeholder:text-[#FAF5EC]/70 rounded-[2px] outline-none uppercase tracking-wider font-sans focus:border-[#B68A3A] focus:ring-1 focus:ring-[#B68A3A]"
                />
                <button
                  type="submit"
                  className="px-4 border border-[#76252C] bg-[#5B1018] text-[#FAF5EC] font-sans text-[10px] uppercase tracking-[0.2em] font-semibold rounded-[2px] hover:bg-[#76252C] hover:border-[#D7B56D] cursor-pointer transition-all shadow-sm"
                >
                  APPLY
                </button>
              </form>
              {couponError && <p className="text-xs text-[#FF6B6B]">{couponError}</p>}

              <div className="space-y-2 font-sans text-xs text-[#FAF5EC]">
                <div className="flex justify-between font-medium">
                  <span className="text-[#FAF5EC]/85">Subtotal</span>
                  <span className="text-[#FAF5EC] font-bold tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Offer Discount</span>
                    <span className="tabular-nums">−₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between font-serif text-lg text-[#FAF5EC] border-t border-[#B68A3A]/20 pt-2">
                  <span>Total</span>
                  <span className="tabular-nums font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F7DA96] via-[#E5B869] to-[#B68A3A]">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={handleClose}
                className="w-full h-12 bg-[#5B1018] text-[#FAF5EC] border border-[#76252C] hover:bg-[#76252C] hover:border-[#D7B56D] font-sans text-xs uppercase tracking-[0.22em] font-semibold flex items-center justify-center rounded-[2px] shadow-lg transition-all cursor-pointer"
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
