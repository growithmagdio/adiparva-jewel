'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button, MicroLabel, Price, Input } from '@/components/primitives';
import { formatCurrency } from '@/lib/data/format';
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
  const [couponSuccess, setCouponSuccess] = React.useState('');

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

  const shipping = subtotal >= 25000 || subtotal === 0 ? 0 : 450;
  const gst = Math.round((subtotal - discount) * 0.03); // 3% GST
  const total = Math.max(0, subtotal - discount + shipping + gst);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError('');
    setCouponSuccess('');

    const res = await validateCoupon(couponCode, subtotal);
    if (!res.valid) {
      setCouponError(res.message || 'Invalid coupon code.');
    } else if (res.coupon) {
      setAppliedCoupon(res.coupon);
      setCouponSuccess(`Coupon ${res.coupon.code} applied!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={handleClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[var(--color-surface)] shadow-2xl flex flex-col justify-between border-l border-[var(--color-cream-300)]">
          {/* Header */}
          <div className="p-6 border-b border-[var(--color-cream-200)] flex items-center justify-between bg-[var(--color-cream-50)]">
            <div className="flex items-center gap-2">
              <MicroLabel className="text-[var(--color-gold-600)]">RESERVATION BAG</MicroLabel>
              <span className="text-xs font-sans text-[var(--color-text-500)]">
                ({cartItems.reduce((acc, item) => acc + item.qty, 0)} pieces)
              </span>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 text-[var(--color-text-500)] hover:text-[var(--color-text-900)] rounded-[var(--radius-card)] hover:bg-[var(--color-cream-200)] transition-colors cursor-pointer"
              aria-label="Close cart sheet"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Line Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <MicroLabel className="text-[var(--color-text-400)]">RESERVATION EMPTY</MicroLabel>
                <h4 className="font-serif text-xl text-[var(--color-text-900)]">No pieces reserved yet</h4>
                <p className="text-xs text-[var(--color-text-500)] max-w-xs">
                  Discover our heritage temple, Kundan, and Polki collection to reserve pieces.
                </p>
                <Link href="/collections" onClick={handleClose}>
                  <Button variant="primary" size="sm">
                    Explore collection
                  </Button>
                </Link>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="flex gap-4 pb-6 border-b border-[var(--color-cream-200)] group"
                >
                  <div className="w-[88px] h-[88px] bg-[var(--color-cream-100)] rounded-[var(--radius-card)] relative overflow-hidden shrink-0 border border-[var(--color-cream-300)]">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-serif text-sm font-medium text-[var(--color-text-900)] line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-xs font-sans text-[var(--color-text-500)] mt-0.5">
                          {item.variantLabel}
                        </p>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="text-[var(--color-text-400)] hover:text-[var(--color-risk-fg)] transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-[var(--color-cream-300)] rounded-[var(--radius-card)] bg-[var(--color-surface)]">
                        <button
                          onClick={() => updateQty(item.productId, item.variantId, item.qty - 1)}
                          className="px-2 py-1 text-[var(--color-text-700)] hover:bg-[var(--color-cream-100)] transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 font-sans text-xs font-semibold text-[var(--color-text-900)]">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.productId, item.variantId, item.qty + 1)}
                          className="px-2 py-1 text-[var(--color-text-700)] hover:bg-[var(--color-cream-100)] transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <Price amount={item.price * item.qty} size="sm" className="font-sans font-semibold" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-[var(--color-cream-200)] bg-[var(--color-cream-50)] space-y-4">
              <form onSubmit={handleApplyCoupon} className="space-y-1">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code (e.g. PARVA10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="py-1.5 text-xs uppercase"
                  />
                  <Button type="submit" variant="secondary" size="sm" className="shrink-0">
                    Apply
                  </Button>
                </div>
                {couponError && <p className="text-[11px] text-[var(--color-risk-fg)] font-medium">{couponError}</p>}
                {couponSuccess && <p className="text-[11px] text-[var(--color-ok-fg)] font-medium">{couponSuccess}</p>}
              </form>

              <div className="space-y-1.5 text-xs font-sans text-[var(--color-text-700)] border-t border-[var(--color-cream-200)] pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[var(--color-ok-fg)]">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (3% Jewellery Rate)</span>
                  <span>{formatCurrency(gst)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Armored Transit Shipping</span>
                  <span>{shipping === 0 ? 'COMPLIMENTARY' : formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between text-base font-serif font-semibold text-[var(--color-text-900)] border-t border-[var(--color-cream-300)] pt-2 mt-2">
                  <span>Total</span>
                  <Price amount={total} size="lg" />
                </div>
              </div>

              <Link href="/checkout" onClick={handleClose} className="block">
                <Button variant="primary" size="lg" className="w-full justify-between" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  <span>Proceed to checkout</span>
                </Button>
              </Link>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--color-text-500)] font-sans pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-gold-600)]" />
                <span>BIS 916 Hallmarked & 100% Insured Delivery</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
