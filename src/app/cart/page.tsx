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
    <div className="min-h-screen bg-[#2E070B] text-[#FAF5EC] flex flex-col font-sans selection:bg-[#5B1018] selection:text-[#FAF5EC]">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-10 sm:py-14 space-y-10">
        {/* Breadcrumbs */}
        <div className="text-[11px] uppercase tracking-[0.2em] text-[#D7B56D] font-semibold flex items-center gap-2">
          <Link href="/" className="hover:text-[#FAF5EC] transition-colors">HOME</Link>
          <span className="text-[#B68A3A]/40">/</span>
          <span className="text-[#FAF5EC]">SHOPPING CART</span>
        </div>

        <div className="border-b border-[#B68A3A]/30 pb-6 space-y-2">
          <div className="text-[11px] uppercase tracking-[0.28em] text-[#D7B56D] font-semibold">
            YOUR SELECTION
          </div>
          <h1 className="font-serif text-[32px] sm:text-[44px] font-normal text-[#FAF5EC]">
            Shopping Bag & Treasury Vitrine
          </h1>
        </div>

        {removedAlert && (
          <div className="p-4 bg-[#3B090D] text-[#D7B56D] border border-[#B68A3A]/40 rounded-[2px] flex items-center justify-between font-sans text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#D7B56D]" />
              <span>An item in your cart is currently out of stock and was updated.</span>
            </div>
            <button onClick={() => setRemovedAlert(false)} className="underline ml-4 cursor-pointer font-semibold hover:text-[#FAF5EC]">
              Dismiss
            </button>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="py-20 text-center space-y-6 max-w-xl mx-auto bg-[#3B090D] border border-[#B68A3A]/40 rounded-[4px] p-8 shadow-md text-[#FAF5EC]">
            <KolamDivider />
            <h2 className="font-serif text-[32px] text-[#FAF5EC]">Your shopping cart is empty</h2>
            <p className="text-[15px] text-[#FAF5EC]/90 max-w-[42ch] mx-auto leading-relaxed">
              Explore our handcrafted South Indian temple gold, royal Kundan, and heirloom bridal collections.
            </p>
            <Link
              href="/collections"
              className="h-12 px-8 bg-[#5B1018] text-[#FAF5EC] border border-[#76252C] hover:bg-[#76252C] hover:border-[#D7B56D] font-sans text-xs uppercase tracking-[0.2em] font-semibold inline-flex items-center justify-center rounded-[2px] transition-all shadow-md"
            >
              EXPLORE COLLECTION
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Cart Items Table */}
            <div className="lg:col-span-8 bg-[#3B090D] border border-[#B68A3A]/40 rounded-[4px] p-6 space-y-6 shadow-md text-[#FAF5EC]">
              <div className="divide-y divide-[#B68A3A]/20">
                {cartItems.map((item) => {
                  const plateNo = `PLATE AP-${String(Math.abs(item.productId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 800 + 100).padStart(4, '0')}`;
                  return (
                    <div key={`${item.productId}-${item.variantId}`} className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        {/* Vitrine Thumbnail */}
                        <div className="relative w-20 aspect-[3/4] bg-[#2E070B] rounded-[3px] overflow-hidden border border-[#B68A3A]/40 shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] uppercase tracking-[0.2em] text-[#D7B56D] font-semibold">
                            {plateNo}
                          </div>
                          <Link href={`/piece/${item.productId}`} className="block">
                            <h3 className="font-serif text-lg text-[#FAF5EC] hover:text-[#D7B56D] transition-colors leading-snug">
                              {item.name}
                            </h3>
                          </Link>
                          <div className="text-xs text-[#FAF5EC]/80 font-medium">{item.variantLabel}</div>
                          <div className="text-sm font-semibold text-[#D7B56D] tabular-nums sm:hidden pt-1">
                            ₹{item.price.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto gap-8">
                        {/* Stepper */}
                        <div className="flex items-center border border-[#B68A3A]/50 rounded-[2px] h-9 bg-[#2E070B]">
                          <button
                            onClick={() => updateQty(item.productId, item.variantId, Math.max(1, item.qty - 1))}
                            className="w-8 h-full flex items-center justify-center text-[#FAF5EC] hover:bg-[#5B1018] transition-colors cursor-pointer font-semibold"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-semibold text-[#FAF5EC]">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.productId, item.variantId, item.qty + 1)}
                            className="w-8 h-full flex items-center justify-center text-[#FAF5EC] hover:bg-[#5B1018] transition-colors cursor-pointer font-semibold"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Line Total */}
                        <div className="text-base font-semibold text-[#FAF5EC] tabular-nums hidden sm:block">
                          ₹{(item.price * item.qty).toLocaleString('en-IN')}
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="text-[#FAF5EC]/60 hover:text-[#FF6B6B] p-1 transition-colors cursor-pointer"
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
              <div className="pt-6 border-t border-[#B68A3A]/20 space-y-2">
                <form onSubmit={handleApplyCoupon} className="flex gap-3 max-w-md">
                  <input
                    type="text"
                    placeholder="Coupon Code (e.g. PARVA10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-[#2E070B] border border-[#B68A3A]/40 px-4 py-2 text-sm text-[#FAF5EC] placeholder:text-[#FAF5EC]/70 rounded-[2px] outline-none uppercase font-semibold tracking-wider focus:border-[#B68A3A] focus:ring-1 focus:ring-[#B68A3A]"
                  />
                  <button
                    type="submit"
                    className="h-10 px-6 bg-[#5B1018] text-[#FAF5EC] border border-[#76252C] hover:bg-[#76252C] hover:border-[#D7B56D] text-xs uppercase tracking-[0.16em] font-semibold rounded-[2px] transition-all cursor-pointer shrink-0 shadow-md"
                  >
                    APPLY
                  </button>
                </form>
                {couponError && <p className="text-xs text-[#FF6B6B] font-medium">{couponError}</p>}
                {appliedCoupon && (
                  <p className="text-xs text-emerald-400 font-medium">
                    ✓ Coupon {appliedCoupon.code} applied successfully!
                  </p>
                )}
              </div>
            </div>

            {/* Right Summary Card (Product Card Matching Style) */}
            <div className="lg:col-span-4 bg-[#3B090D] border border-[#B68A3A]/40 rounded-[4px] p-6 space-y-6 shadow-md sticky top-28 text-[#FAF5EC]">
              <h3 className="text-[12px] uppercase tracking-[0.24em] text-[#D7B56D] font-bold border-b border-[#B68A3A]/30 pb-4">
                ORDER SUMMARY
              </h3>

              <div className="space-y-3 text-sm text-[#FAF5EC]">
                <div className="flex justify-between font-medium">
                  <span className="text-[#FAF5EC]/85">Bag Subtotal</span>
                  <span className="text-[#FAF5EC] font-bold tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-[#FAF5EC]/85">Insured Express Shipping</span>
                  <span className="text-[#D7B56D] font-semibold">
                    {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Coupon Savings</span>
                    <span className="tabular-nums">−₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* Gold Hairline Divider */}
              <div className="h-[1px] bg-[#B68A3A]/30" />

              <div className="flex items-baseline justify-between">
                <span className="text-sm uppercase tracking-wider font-bold text-[#FAF5EC]">TOTAL DUE</span>
                <span className="font-serif text-[28px] font-bold tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-[#F7DA96] via-[#E5B869] to-[#B68A3A]">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>

              {discount > 0 && (
                <p className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 p-2 rounded text-center font-medium">
                  You save ₹{discount.toLocaleString('en-IN')} on this order!
                </p>
              )}

              <Link
                href="/checkout"
                className="w-full h-[52px] bg-[#5B1018] text-[#FAF5EC] border border-[#76252C] hover:bg-[#76252C] hover:border-[#D7B56D] font-sans text-xs uppercase tracking-[0.2em] font-semibold flex items-center justify-center rounded-[2px] shadow-lg cursor-pointer transition-all"
              >
                PROCEED TO CHECKOUT
              </Link>

              <div className="text-center pt-2">
                <Link
                  href="/collections"
                  className="text-[11px] uppercase tracking-[0.18em] text-[#D7B56D] hover:text-[#FAF5EC] transition-colors font-semibold"
                >
                  ← CONTINUE SHOPPING
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Trust Badges */}
        <div className="border-t border-[#B68A3A]/30 pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-xs text-[#FAF5EC]">
          <div className="flex items-center justify-center gap-3 p-3 bg-[#3B090D] rounded-[4px] border border-[#B68A3A]/30 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-[#D7B56D]" />
            <span className="font-medium">BIS Hallmarked Gold Guarantee</span>
          </div>
          <div className="flex items-center justify-center gap-3 p-3 bg-[#3B090D] rounded-[4px] border border-[#B68A3A]/30 shadow-xs">
            <Truck className="w-5 h-5 text-[#D7B56D]" />
            <span className="font-medium">Tamper-Proof Insured Transit</span>
          </div>
          <div className="flex items-center justify-center gap-3 p-3 bg-[#3B090D] rounded-[4px] border border-[#B68A3A]/30 shadow-xs">
            <RotateCcw className="w-5 h-5 text-[#D7B56D]" />
            <span className="font-medium">7-Day Inspection & Exchange</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
