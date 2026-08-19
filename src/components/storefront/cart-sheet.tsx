'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Button } from '@/components/primitives/button';
import { GopuramRule } from '@/components/ui/GopuramRule';
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

  const [hasCouponOpen, setHasCouponOpen] = React.useState(false);
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
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={handleClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[var(--color-ivory)] border-l border-[var(--color-hairline)] flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-[var(--color-hairline)] flex items-center justify-between">
            <span className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
              Shopping Bag ({cartItems.reduce((acc, item) => acc + item.qty, 0)})
            </span>

            <button
              onClick={handleClose}
              className="text-[var(--color-ink)] hover:text-[var(--color-gold)] transition-colors p-1"
              aria-label="Close cart sheet"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Hairline Bar */}
          {cartItems.length > 0 && (
            <div className="px-6 py-3 bg-[var(--color-bone)] border-b border-[var(--color-hairline)] text-center font-karla text-xs">
              {isFreeShipping ? (
                <span className="text-[var(--color-leaf)] font-medium">✓ You qualify for free insured shipping</span>
              ) : (
                <span className="text-[var(--color-ink)]/80">
                  Add ₹{amountNeededForFreeShipping.toLocaleString('en-IN')} more for free shipping
                </span>
              )}
              <div className="w-full h-[2px] bg-[var(--color-hairline)]/40 mt-2 overflow-hidden">
                <div
                  className="h-full bg-[var(--color-gold)] transition-all duration-320"
                  style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Line Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <h4 className="font-bodoni text-2xl text-[var(--color-ink)]">Your bag is empty.</h4>
                <p className="font-karla text-sm text-[var(--color-ink)]/70 max-w-xs">
                  Discover our temple gold, Kundan, and Polki pieces to reserve your heirlooms.
                </p>
                <Link href="/collections" onClick={handleClose}>
                  <Button variant="ghost">Browse new arrivals</Button>
                </Link>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="flex gap-4 pb-6 border-b border-[var(--color-hairline)]/50 font-karla"
                >
                  <div className="w-[96px] h-[96px] bg-[var(--color-vault)] relative overflow-hidden shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-karla font-medium text-sm text-[var(--color-ink)] line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[var(--color-ink)]/60 mt-0.5">
                        {item.variantLabel}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-[var(--color-hairline)] h-[32px] bg-[var(--color-bone)] text-xs">
                        <button
                          onClick={() => updateQty(item.productId, item.variantId, item.qty - 1)}
                          className="px-2 text-[var(--color-ink)] hover:text-[var(--color-gold)] transition-colors h-full"
                        >
                          -
                        </button>
                        <span className="px-2 font-medium">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.productId, item.variantId, item.qty + 1)}
                          className="px-2 text-[var(--color-ink)] hover:text-[var(--color-gold)] transition-colors h-full"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-karla font-medium text-sm text-[var(--color-ink)] [font-variant-numeric:tabular-nums]">
                        ₹{(item.price * item.qty).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="text-[11px] text-[var(--color-ink)]/60 hover:text-[var(--color-kumkum)] transition-colors text-left pt-1 font-karla"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-[var(--color-hairline)] bg-[var(--color-ivory)] space-y-4 font-karla">
              {/* Coupon Expander */}
              {!hasCouponOpen ? (
                <button
                  onClick={() => setHasCouponOpen(true)}
                  className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)] underline underline-offset-4 hover:text-[var(--color-gold-lit)]"
                >
                  Have a code?
                </button>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-[var(--color-bone)] border border-[var(--color-hairline)] text-xs uppercase outline-none font-karla"
                    />
                    <Button type="submit" variant="ghost" size="sm">
                      Apply
                    </Button>
                  </div>
                  {couponError && <p className="text-[11px] text-[var(--color-kumkum)]">{couponError}</p>}
                </form>
              )}

              <div className="space-y-2 text-sm pt-2">
                <div className="flex justify-between text-[var(--color-ink)]/80">
                  <span>Subtotal</span>
                  <span className="[font-variant-numeric:tabular-nums]">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-[var(--color-kumkum)]">
                    <span>Discount</span>
                    <span className="[font-variant-numeric:tabular-nums]">-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-[var(--color-ink)]/80">
                  <span>Shipping</span>
                  <span>{isFreeShipping ? <span className="text-[var(--color-leaf)]">Free</span> : `₹${shipping}`}</span>
                </div>

                <GopuramRule size="sm" />

                <div className="flex justify-between items-baseline pt-1">
                  <span className="font-marcellus text-xs uppercase tracking-[0.18em] text-[var(--color-gold)]">Total</span>
                  <span className="font-bodoni text-[28px] text-[var(--color-ink)] [font-variant-numeric:tabular-nums]">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <Link href="/checkout" onClick={handleClose} className="block pt-2">
                <Button variant="gold" className="w-full">
                  Checkout
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
