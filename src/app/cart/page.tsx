'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { ProductCard } from '@/components/storefront/product-card';
import { Button } from '@/components/primitives/button';
import { GopuramRule } from '@/components/ui/GopuramRule';
import { useCartStore } from '@/lib/store/use-cart-store';
import { getProducts } from '@/lib/data/queries';
import { Product, Coupon } from '@/lib/data/types';
import { validateCoupon } from '@/lib/data/queries';

export default function CartPage() {
  const cartItems = useCartStore((state) => state.items);
  const updateQty = useCartStore((state) => state.updateQty);
  const removeItem = useCartStore((state) => state.removeItem);

  const [bestsellers, setBestsellers] = React.useState<Product[]>([]);
  const [hasCouponOpen, setHasCouponOpen] = React.useState(false);
  const [couponCode, setCouponCode] = React.useState('');
  const [appliedCoupon, setAppliedCoupon] = React.useState<Coupon | null>(null);
  const [couponError, setCouponError] = React.useState('');

  React.useEffect(() => {
    async function loadData() {
      const all = await getProducts({ status: 'live' });
      setBestsellers(all.slice(0, 4));
    }
    loadData();
  }, []);

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
    <div className="min-h-screen bg-[var(--color-ivory)] text-[var(--color-ink)] flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12 space-y-16">
        {/* Breadcrumb */}
        <div className="font-karla text-[12px] text-[var(--color-ink)]/60 flex items-center gap-2">
          <Link href="/" className="hover:text-[var(--color-gold)] transition-colors">Home</Link>
          <span className="text-[var(--color-hairline)]">/</span>
          <span className="text-[var(--color-ink)] font-medium">Shopping Bag</span>
        </div>

        <div className="space-y-2 border-b border-[var(--color-hairline)] pb-6">
          <span className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
            Reservation Cart
          </span>
          <h1 className="font-bodoni text-[36px] sm:text-[44px] text-[var(--color-ink)]">
            Your Shopping Bag
          </h1>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="py-16 text-center space-y-8 max-w-xl mx-auto">
            <h2 className="font-bodoni text-[32px] text-[var(--color-ink)]">
              Your bag is empty.
            </h2>
            <p className="font-karla text-sm text-[var(--color-ink)]/70">
              Browse our heritage vault of temple gold, Kundan stone setting, and royal Polki heirlooms.
            </p>
            <Link href="/collections">
              <Button variant="ghost">Browse new arrivals</Button>
            </Link>

            {/* 4-up Bestseller Row */}
            <div className="pt-12 space-y-6 text-left">
              <h3 className="font-marcellus text-xs uppercase tracking-[0.18em] text-[var(--color-gold)] text-center">
                Popular Heirlooms
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {bestsellers.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Cart Content: Left Items / Right Sticky Rail */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Items Column (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Free Shipping Progress Hairline Bar */}
              <div className="p-4 bg-[var(--color-bone)] border border-[var(--color-hairline)] text-center font-karla text-xs rounded-[2px]">
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

              {/* Line Items List */}
              <div className="divide-y divide-[var(--color-hairline)] border-y border-[var(--color-hairline)]">
                {cartItems.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 font-karla"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-[96px] h-[96px] bg-[var(--color-vault)] relative overflow-hidden shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-karla font-medium text-base text-[var(--color-ink)]">
                          {item.name}
                        </h4>
                        <p className="text-xs text-[var(--color-ink)]/60">
                          {item.variantLabel}
                        </p>
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="text-[11px] text-[var(--color-ink)]/60 hover:text-[var(--color-kumkum)] transition-colors pt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[var(--color-hairline)] h-[36px] bg-[var(--color-bone)] text-xs">
                        <button
                          onClick={() => updateQty(item.productId, item.variantId, item.qty - 1)}
                          className="px-3 text-[var(--color-ink)] hover:text-[var(--color-gold)] transition-colors h-full"
                        >
                          -
                        </button>
                        <span className="px-3 font-medium">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.productId, item.variantId, item.qty + 1)}
                          className="px-3 text-[var(--color-ink)] hover:text-[var(--color-gold)] transition-colors h-full"
                        >
                          +
                        </button>
                      </div>

                      {/* Line Total */}
                      <span className="font-karla font-medium text-base text-[var(--color-ink)] [font-variant-numeric:tabular-nums]">
                        ₹{(item.price * item.qty).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Sticky Summary Rail (lg:col-span-4) */}
            <div className="lg:col-span-4 sticky top-28 bg-[var(--color-ivory)] border border-[var(--color-hairline)] p-6 space-y-6 rounded-[2px] font-karla">
              <h3 className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)] border-b border-[var(--color-hairline)] pb-3">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[var(--color-ink)]/80">
                  <span>Subtotal</span>
                  <span className="[font-variant-numeric:tabular-nums]">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-[var(--color-kumkum)]">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span className="[font-variant-numeric:tabular-nums]">-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-[var(--color-ink)]/80">
                  <span>Shipping</span>
                  <span>{isFreeShipping ? <span className="text-[var(--color-leaf)]">Free</span> : `₹${shipping}`}</span>
                </div>

                <GopuramRule size="sm" />

                <div className="flex justify-between items-baseline pt-2">
                  <span className="font-marcellus text-xs uppercase tracking-[0.18em] text-[var(--color-gold)]">Total</span>
                  <span className="font-bodoni text-[28px] text-[var(--color-ink)] [font-variant-numeric:tabular-nums]">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Coupon Expander */}
              <div className="pt-2 border-t border-[var(--color-hairline)]">
                {!hasCouponOpen ? (
                  <button
                    onClick={() => setHasCouponOpen(true)}
                    className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)] underline underline-offset-4 hover:text-[var(--color-gold-lit)]"
                  >
                    Have a code?
                  </button>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 px-3 py-2 bg-[var(--color-bone)] border border-[var(--color-hairline)] text-xs uppercase outline-none font-karla"
                      />
                      <Button type="submit" variant="ghost" size="sm">
                        Apply
                      </Button>
                    </div>
                    {couponError && <p className="text-[11px] text-[var(--color-kumkum)]">{couponError}</p>}
                  </form>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <Link href="/checkout" className="block">
                  <Button variant="gold" className="w-full">
                    Checkout
                  </Button>
                </Link>
                <div className="text-center">
                  <Link href="/collections" className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)]/70 hover:text-[var(--color-gold)] underline underline-offset-4">
                    Continue shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
