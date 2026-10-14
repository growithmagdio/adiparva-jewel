'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { KolamDivider } from '@/components/storefront/kolam-divider';
import { useCartStore } from '@/lib/store/use-cart-store';
import { getProducts, validateCoupon } from '@/lib/data/queries';
import { Coupon } from '@/lib/data/types';
import { X, ShieldCheck, Truck, RotateCcw, ArrowRight, AlertTriangle } from 'lucide-react';

export default function CartPage() {
  const cartItems = useCartStore((state) => state.items);
  const updateQty = useCartStore((state) => state.updateQty);
  const removeItem = useCartStore((state) => state.removeItem);

  const [couponCode, setCouponCode] = React.useState('');
  const [appliedCoupon, setAppliedCoupon] = React.useState<Coupon | null>(null);
  const [couponError, setCouponError] = React.useState('');
  const [removedAlert, setRemovedAlert] = React.useState(false);

  React.useEffect(() => {
    async function validateCartItems() {
      const liveProducts = await getProducts({ status: 'live' });
      const liveIds = new Set(liveProducts.map((p) => p.id));
      let hadUnavailable = false;

      cartItems.forEach((item) => {
        if (!liveIds.has(item.productId)) {
          removeItem(item.productId, item.variantId);
          hadUnavailable = true;
        }
      });

      if (hadUnavailable) {
        setRemovedAlert(true);
      }
    }
    if (cartItems.length > 0) {
      validateCartItems();
    }
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
    <div className="min-h-screen bg-[#FAF5EC] text-[#765E55] flex flex-col font-sans selection:bg-[#5B1018] selection:text-[#FAF5EC]">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-10 sm:py-14 space-y-10">
        {/* Breadcrumbs */}
        <div className="text-[11px] uppercase tracking-[0.2em] text-[#B68A3A] font-semibold flex items-center gap-2">
          <Link href="/" className="hover:text-[#5B1018] transition-colors">HOME</Link>
          <span className="text-[#B68A3A]/40">/</span>
          <span className="text-[#5B1018]">SHOPPING CART</span>
        </div>

        <div className="border-b border-[#E7D7C0] pb-6 space-y-2">
          <div className="text-[11px] uppercase tracking-[0.28em] text-[#B68A3A] font-semibold">
            YOUR SELECTION
          </div>
          <h1 className="font-serif text-[32px] sm:text-[44px] font-normal text-[#5B1018]">
            Shopping Bag & Treasury Vitrine
          </h1>
        </div>

        {removedAlert && (
          <div className="p-4 bg-[#FBEFD6] text-[#9A6A05] border border-[#9A6A05]/30 rounded flex items-center justify-between font-sans text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#9A6A05]" />
              <span>An item in your cart is currently out of stock and was updated.</span>
            </div>
            <button onClick={() => setRemovedAlert(false)} className="underline ml-4 cursor-pointer font-semibold">
              Dismiss
            </button>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="py-20 text-center space-y-6 max-w-xl mx-auto bg-[#FFFFFF] border border-[#E7D7C0] rounded-[6px] p-8 shadow-sm">
            <KolamDivider />
            <h2 className="font-serif text-[32px] text-[#5B1018]">Your shopping cart is empty</h2>
            <p className="text-[15px] text-[#765E55] max-w-[42ch] mx-auto leading-relaxed">
              Explore our handcrafted South Indian temple gold, royal Kundan, and heirloom bridal collections.
            </p>
            <Link
              href="/collections"
              className="h-12 px-8 bg-[#5B1018] text-[#FAF5EC] hover:bg-[#3B090D] font-sans text-xs uppercase tracking-[0.2em] font-semibold inline-flex items-center justify-center rounded-[2px] transition-colors shadow-sm"
            >
              EXPLORE COLLECTION
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Cart Items Table */}
            <div className="lg:col-span-8 bg-[#FFFFFF] border border-[#E7D7C0] rounded-[6px] p-6 space-y-6 shadow-sm">
              <div className="divide-y divide-[#E7D7C0]">
                {cartItems.map((item) => {
                  const plateNo = `PLATE AP-${String(Math.abs(item.productId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 800 + 100).padStart(4, '0')}`;
                  return (
                    <div key={`${item.productId}-${item.variantId}`} className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        {/* Vitrine Thumbnail */}
                        <div className="relative w-20 aspect-[3/4] bg-[#3B090D] rounded-[3px] overflow-hidden border border-[#B68A3A]/40 shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] uppercase tracking-[0.2em] text-[#B68A3A] font-semibold">
                            {plateNo}
                          </div>
                          <Link href={`/piece/${item.productId}`} className="block">
                            <h3 className="font-serif text-lg text-[#5B1018] hover:text-[#B68A3A] transition-colors leading-snug">
                              {item.name}
                            </h3>
                          </Link>
                          <div className="text-xs text-[#765E55]">{item.variantLabel}</div>
                          <div className="text-sm font-semibold text-[#5B1018] tabular-nums sm:hidden pt-1">
                            ₹{item.price.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto gap-8">
                        {/* Stepper */}
                        <div className="flex items-center border border-[#B68A3A] rounded-[2px] h-9 bg-[#FFFFFF]">
                          <button
                            onClick={() => updateQty(item.productId, item.variantId, Math.max(1, item.qty - 1))}
                            className="w-8 h-full flex items-center justify-center text-[#5B1018] hover:bg-[#F2E7D7] transition-colors cursor-pointer font-semibold"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-semibold text-[#5B1018]">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.productId, item.variantId, item.qty + 1)}
                            className="w-8 h-full flex items-center justify-center text-[#5B1018] hover:bg-[#F2E7D7] transition-colors cursor-pointer font-semibold"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Line Total */}
                        <div className="text-base font-semibold text-[#5B1018] tabular-nums hidden sm:block">
                          ₹{(item.price * item.qty).toLocaleString('en-IN')}
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="text-[#765E55]/60 hover:text-[#B3261E] p-1 transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Form */}
              <div className="pt-6 border-t border-[#E7D7C0] space-y-2">
                <form onSubmit={handleApplyCoupon} className="flex gap-3 max-w-md">
                  <input
                    type="text"
                    placeholder="Coupon Code (e.g. PARVA10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-[#FAF5EC] border border-[#B68A3A] px-4 py-2 text-sm text-[#5B1018] placeholder-[#765E55]/60 rounded-[2px] outline-none uppercase font-semibold tracking-wider"
                  />
                  <button
                    type="submit"
                    className="h-10 px-6 bg-[#5B1018] text-[#FAF5EC] hover:bg-[#3B090D] text-xs uppercase tracking-[0.16em] font-semibold rounded-[2px] transition-colors cursor-pointer shrink-0"
                  >
                    APPLY
                  </button>
                </form>
                {couponError && <p className="text-xs text-[#B3261E] font-medium">{couponError}</p>}
                {appliedCoupon && (
                  <p className="text-xs text-emerald-700 font-medium">
                    ✓ Coupon {appliedCoupon.code} applied successfully!
                  </p>
                )}
              </div>
            </div>

            {/* Right Summary Card */}
            <div className="lg:col-span-4 bg-[#FFFFFF] border border-[#E7D7C0] rounded-[6px] p-6 space-y-6 shadow-sm sticky top-28">
              <h3 className="text-[12px] uppercase tracking-[0.24em] text-[#B68A3A] font-bold border-b border-[#E7D7C0] pb-4">
                ORDER SUMMARY
              </h3>

              <div className="space-y-3 text-sm text-[#765E55]">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="text-[#5B1018] font-semibold tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Insured Express Shipping</span>
                  <span className="text-[#B68A3A] font-medium">
                    {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Savings</span>
                    <span className="tabular-nums">−₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* Gold Hairline Divider */}
              <div className="h-[1px] bg-[#E7D7C0]" />

              <div className="flex items-baseline justify-between">
                <span className="text-sm uppercase tracking-wider font-semibold text-[#5B1018]">TOTAL DUE</span>
                <span className="font-serif text-[28px] text-[#5B1018] font-medium tabular-nums">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>

              {discount > 0 && (
                <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded text-center font-medium">
                  You save ₹{discount.toLocaleString('en-IN')} on this order!
                </p>
              )}

              <Link
                href="/checkout"
                className="w-full h-[52px] bg-[#5B1018] text-[#FAF5EC] hover:bg-[#3B090D] font-sans text-xs uppercase tracking-[0.2em] font-semibold flex items-center justify-center rounded-[2px] shadow-md cursor-pointer transition-colors"
              >
                PROCEED TO CHECKOUT
              </Link>

              <div className="text-center pt-2">
                <Link
                  href="/collections"
                  className="text-[11px] uppercase tracking-[0.18em] text-[#B68A3A] hover:text-[#5B1018] transition-colors font-semibold"
                >
                  ← CONTINUE SHOPPING
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Trust Badges */}
        <div className="border-t border-[#E7D7C0] pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-xs text-[#765E55]">
          <div className="flex items-center justify-center gap-3 p-3 bg-[#F2E7D7]/40 rounded border border-[#E7D7C0]">
            <ShieldCheck className="w-5 h-5 text-[#B68A3A]" />
            <span>BIS Hallmarked Gold Guarantee</span>
          </div>
          <div className="flex items-center justify-center gap-3 p-3 bg-[#F2E7D7]/40 rounded border border-[#E7D7C0]">
            <Truck className="w-5 h-5 text-[#B68A3A]" />
            <span>Tamper-Proof Insured Transit</span>
          </div>
          <div className="flex items-center justify-center gap-3 p-3 bg-[#F2E7D7]/40 rounded border border-[#E7D7C0]">
            <RotateCcw className="w-5 h-5 text-[#B68A3A]" />
            <span>7-Day Inspection & Exchange</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
