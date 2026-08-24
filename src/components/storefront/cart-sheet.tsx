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
        <div className="w-screen max-w-md bg-[var(--color-sanctum)] border-l border-[var(--color-temple-gold)]/30 flex flex-col justify-between text-[var(--color-ivory)] shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-[var(--color-temple-gold)]/20 flex items-center justify-between">
            <span className="font-marcellus text-[11px] uppercase tracking-[0.25em] text-[var(--color-temple-gold)]">
              RESERVATION VITRINE ({cartItems.reduce((acc, item) => acc + item.qty, 0)})
            </span>

            <button
              onClick={handleClose}
              className="text-[var(--color-ivory)] hover:text-[var(--color-gold-light)] transition-colors p-1 cursor-pointer"
              aria-label="Close cart sheet"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          {cartItems.length > 0 && (
            <div className="px-6 py-3 bg-[var(--color-vault-black)] border-b border-[var(--color-temple-gold)]/20 text-center font-jost text-xs">
              {isFreeShipping ? (
                <span className="text-[var(--color-gold-light)] font-medium">✓ You qualify for free insured transit</span>
              ) : (
                <span className="text-[var(--color-sandal)]">
                  Add ₹{amountNeededForFreeShipping.toLocaleString('en-IN')} more for free insured transit
                </span>
              )}
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 divide-y divide-[var(--color-temple-gold)]/15">
            {cartItems.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <p className="font-serif text-2xl text-[var(--color-ivory)]">Your vitrine is empty.</p>
                <p className="font-jost text-xs text-[var(--color-sandal)]/70">Explore our living archive of fine jewellery plates.</p>
                <button
                  onClick={handleClose}
                  className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)] hover:underline pt-4"
                >
                  START EXPLORING →
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const plateNo = `PLATE AP-${String(Math.abs(item.productId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 800 + 100).padStart(4, '0')}`;
                return (
                  <div key={`${item.productId}-${item.variantId}`} className="pt-6 first:pt-0 flex gap-4">
                    <div className="relative w-16 aspect-[3/4] bg-[var(--color-vault-black)] rounded-[2px] overflow-hidden border border-[var(--color-temple-gold)]/30 shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="font-marcellus text-[9px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)]">
                        {plateNo}
                      </div>
                      <h4 className="font-serif text-base text-[var(--color-ivory)] leading-tight">{item.name}</h4>
                      <div className="font-jost text-xs text-[var(--color-sandal)]/70">{item.variantLabel}</div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-[var(--color-temple-gold)]/30 rounded-[2px] h-7">
                          <button
                            onClick={() => updateQty(item.productId, item.variantId, Math.max(1, item.qty - 1))}
                            className="w-6 h-full flex items-center justify-center text-xs text-[var(--color-ivory)] hover:bg-[var(--color-vault-black)]"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-jost text-xs">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.productId, item.variantId, item.qty + 1)}
                            className="w-6 h-full flex items-center justify-center text-xs text-[var(--color-ivory)] hover:bg-[var(--color-vault-black)]"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-sans text-sm text-[var(--color-ivory)] tabular-nums">
                          ₹{(item.price * item.qty).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="text-[var(--color-sandal)]/60 hover:text-[var(--color-kemp-red)] p-1 transition-colors"
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
            <div className="p-6 border-t border-[var(--color-temple-gold)]/20 bg-[var(--color-vault-black)] space-y-4">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/30 px-3 py-1.5 text-xs text-[var(--color-ivory)] placeholder-[var(--color-sandal)]/40 rounded-[2px] outline-none uppercase tracking-wider font-jost"
                />
                <button
                  type="submit"
                  className="px-4 border border-[var(--color-temple-gold)] text-[var(--color-temple-gold)] font-marcellus text-[10px] uppercase tracking-[0.2em] rounded-[2px] hover:bg-[var(--color-burgundy-silk)] hover:text-[var(--color-ivory)]"
                >
                  APPLY
                </button>
              </form>

              <div className="space-y-2 font-jost text-xs text-[var(--color-sandal)]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[var(--color-ivory)] tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[var(--color-kemp-red)] font-medium">
                    <span>Discount</span>
                    <span className="tabular-nums">−₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between font-serif text-lg text-[var(--color-ivory)] border-t border-[var(--color-temple-gold)]/20 pt-2">
                  <span>Total</span>
                  <span className="tabular-nums">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={handleClose}
                className="btn-gold-sheen w-full h-12 bg-[var(--color-temple-gold)] text-[var(--color-vault-black)] font-marcellus text-[11px] uppercase tracking-[0.25em] font-semibold flex items-center justify-center rounded-[2px] shadow-lg"
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
