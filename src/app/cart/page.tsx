'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { KolamDivider } from '@/components/storefront/kolam-divider';
import { useCartStore } from '@/lib/store/use-cart-store';
import { validateCoupon } from '@/lib/data/queries';
import { Coupon } from '@/lib/data/types';
import { X, ShieldCheck, Truck, RotateCcw, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const cartItems = useCartStore((state) => state.items);
  const updateQty = useCartStore((state) => state.updateQty);
  const removeItem = useCartStore((state) => state.removeItem);

  const [couponCode, setCouponCode] = React.useState('');
  const [appliedCoupon, setAppliedCoupon] = React.useState<Coupon | null>(null);
  const [couponError, setCouponError] = React.useState('');

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
    <div className="min-h-screen bg-[var(--color-vault-black)] text-[var(--color-ivory)] flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12 space-y-12">
        {/* Breadcrumbs */}
        <div className="font-marcellus text-[11px] uppercase tracking-[0.25em] text-[var(--color-temple-gold)] flex items-center gap-2">
          <Link href="/" className="hover:text-[var(--color-gold-light)] transition-colors">HOME</Link>
          <span className="text-[var(--color-sandal)]/40">/</span>
          <span className="text-[var(--color-ivory)]">TREASURY CART</span>
        </div>

        <div className="border-b border-[var(--color-temple-gold)]/20 pb-6">
          <div className="font-marcellus text-[11px] uppercase tracking-[0.35em] text-[var(--color-temple-gold)]">
            RESERVATION TABLE
          </div>
          <h1 className="font-serif text-[36px] sm:text-[48px] font-light text-[var(--color-ivory)]">
            Your Shopping <em className="italic text-gold-gradient font-normal">Vitrine</em>
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="py-20 text-center space-y-6 max-w-xl mx-auto bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 rounded-[4px] p-8">
            <KolamDivider />
            <h2 className="font-serif text-[32px] text-[var(--color-ivory)]">Your vitrine is empty.</h2>
            <p className="font-jost text-sm text-[var(--color-sandal)]/80 font-light">
              Explore our living archive of temple gold, Kundan stone setting, and royal Polki heirlooms.
            </p>
            <Link
              href="/collections"
              className="btn-gold-sheen h-12 px-8 bg-[var(--color-temple-gold)] text-[var(--color-vault-black)] font-marcellus text-[11px] uppercase tracking-[0.25em] font-semibold inline-flex items-center justify-center rounded-[2px]"
            >
              BROWSE NEW ARRIVALS
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Cart Items Table on Sanctum Ground */}
            <div className="lg:col-span-8 bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 rounded-[4px] p-6 space-y-6">
              <div className="divide-y divide-[var(--color-temple-gold)]/15">
                {cartItems.map((item) => {
                  const plateNo = `PLATE AP-${String(Math.abs(item.productId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 800 + 100).padStart(4, '0')}`;
                  return (
                    <div key={`${item.productId}-${item.variantId}`} className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        {/* Vitrine Thumbnail */}
                        <div className="relative w-20 aspect-[3/4] bg-[var(--color-vault-black)] rounded-[2px] overflow-hidden border border-[var(--color-temple-gold)]/30 shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="space-y-1">
                          <div className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)]">
                            {plateNo}
                          </div>
                          <h3 className="font-serif text-lg text-[var(--color-ivory)]">{item.name}</h3>
                          <div className="font-jost text-xs text-[var(--color-sandal)]/70">{item.variantLabel}</div>
                          <div className="font-sans text-sm text-[var(--color-ivory)] tabular-nums sm:hidden pt-1">
                            ₹{item.price.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto gap-8">
                        {/* Stepper */}
                        <div className="flex items-center border border-[var(--color-temple-gold)]/30 rounded-[2px] h-8">
                          <button
                            onClick={() => updateQty(item.productId, item.variantId, Math.max(1, item.qty - 1))}
                            className="w-8 h-full flex items-center justify-center text-[var(--color-ivory)] hover:bg-[var(--color-vault-black)] cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-jost text-xs text-[var(--color-ivory)]">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.productId, item.variantId, item.qty + 1)}
                            className="w-8 h-full flex items-center justify-center text-[var(--color-ivory)] hover:bg-[var(--color-vault-black)] cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* Line Total */}
                        <div className="font-sans text-base text-[var(--color-ivory)] tabular-nums font-normal hidden sm:block">
                          ₹{(item.price * item.qty).toLocaleString('en-IN')}
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="text-[var(--color-sandal)]/60 hover:text-[var(--color-kemp-red)] p-1 transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Below-Left Coupon Input */}
              <form onSubmit={handleApplyCoupon} className="pt-6 border-t border-[var(--color-temple-gold)]/20 flex gap-3 max-w-md">
                <input
                  type="text"
                  placeholder="Enter Coupon Code (e.g. PARVA10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-[var(--color-vault-black)] border border-[var(--color-temple-gold)]/30 px-4 py-2.5 text-sm text-[var(--color-ivory)] placeholder-[var(--color-sandal)]/40 rounded-[2px] outline-none focus:border-[var(--color-gold-light)] font-jost uppercase tracking-wider"
                />
                <button
                  type="submit"
                  className="h-10 px-6 border border-[var(--color-temple-gold)] text-[var(--color-temple-gold)] font-marcellus text-[11px] uppercase tracking-[0.2em] rounded-[2px] hover:bg-[var(--color-burgundy-silk)] hover:text-[var(--color-ivory)] transition-colors cursor-pointer shrink-0"
                >
                  APPLY
                </button>
              </form>
              {couponError && <p className="font-jost text-xs text-[var(--color-kemp-red)]">{couponError}</p>}
            </div>

            {/* Right Summary Card */}
            <div className="lg:col-span-4 bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 rounded-[4px] p-6 space-y-6 sticky top-28">
              <h3 className="font-marcellus text-[12px] uppercase tracking-[0.3em] text-[var(--color-temple-gold)] border-b border-[var(--color-temple-gold)]/20 pb-4">
                SUMMARY
              </h3>

              <div className="space-y-3 font-jost text-sm text-[var(--color-sandal)]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[var(--color-ivory)] tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Insured Shipping</span>
                  <span className="text-[var(--color-temple-gold)]">
                    {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[var(--color-kemp-red)] font-medium">
                    <span>Offer Discount</span>
                    <span className="tabular-nums">−₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* 1px Gold Hairline Divider */}
              <div className="h-[1px] bg-[var(--color-temple-gold)]/30" />

              <div className="flex items-baseline justify-between">
                <span className="font-marcellus text-sm uppercase tracking-wider text-[var(--color-ivory)]">TOTAL</span>
                <span className="font-serif text-[28px] text-[var(--color-ivory)] font-light tabular-nums">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>

              {discount > 0 && (
                <p className="font-jost text-xs italic text-[var(--color-gold-light)] text-center">
                  You saved ₹{discount.toLocaleString('en-IN')} on this reservation.
                </p>
              )}

              <Link
                href="/checkout"
                className="btn-gold-sheen w-full h-[52px] bg-[var(--color-temple-gold)] text-[var(--color-vault-black)] font-marcellus text-[11px] uppercase tracking-[0.3em] font-semibold flex items-center justify-center rounded-[2px] shadow-lg cursor-pointer"
              >
                PROCEED TO CHECKOUT
              </Link>

              <div className="text-center pt-2">
                <Link
                  href="/collections"
                  className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)] hover:text-[var(--color-gold-light)] transition-colors"
                >
                  ← CONTINUE SHOPPING
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Repeat Trust Strip */}
        <div className="border-t border-[var(--color-temple-gold)]/20 pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center font-jost text-xs text-[var(--color-sandal)]/80">
          <div className="flex items-center justify-center gap-3">
            <ShieldCheck className="w-4 h-4 text-[var(--color-temple-gold)]" />
            <span>BIS Hallmarked 22kt Gold Certified</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Truck className="w-4 h-4 text-[var(--color-temple-gold)]" />
            <span>Insured Transit & Tamper-Evident Box</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <RotateCcw className="w-4 h-4 text-[var(--color-temple-gold)]" />
            <span>7-Day Inspection & Exchange Policy</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
