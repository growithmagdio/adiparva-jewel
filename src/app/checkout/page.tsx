'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/store/use-cart-store';
import { createOrder } from '@/lib/data/queries';
import { KolamDivider } from '@/components/storefront/kolam-divider';
import { Lock, ArrowLeft, Loader2, Check, ShieldCheck } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  // Form Field States
  const [email, setEmail] = React.useState('priya.sharma@example.com');
  const [phone, setPhone] = React.useState('9876543210');
  const [fullName, setFullName] = React.useState('Priya Sharma');
  const [addressLine, setAddressLine] = React.useState('42, Khader Nawaz Khan Road');
  const [landmark, setLandmark] = React.useState('Near Taj Hotel');
  const [pincode, setPincode] = React.useState('600034');
  const [city, setCity] = React.useState('Chennai');
  const [stateName, setStateName] = React.useState('Tamil Nadu');

  // Error States
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Shipping & Payment Selections
  const [shippingMethod, setShippingMethod] = React.useState<'standard' | 'express' | 'sameday'>('standard');
  const [paymentMethod, setPaymentMethod] = React.useState<'UPI' | 'Card' | 'Net banking' | 'Cash on delivery'>('UPI');
  const [isProcessing, setIsProcessing] = React.useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const shippingCost = {
    standard: 0,
    express: 199,
    sameday: 499,
  }[shippingMethod];

  const total = subtotal + shippingCost;
  const isCodDisabled = total > 50000;

  const handlePincodeBlur = () => {
    if (pincode.length !== 6) {
      setErrors((prev) => ({ ...prev, pincode: 'Enter a valid 6-digit pincode.' }));
      return;
    }
    setErrors((prev) => ({ ...prev, pincode: '' }));

    if (pincode.startsWith('625')) {
      setCity('Madurai');
      setStateName('Tamil Nadu');
    } else if (pincode.startsWith('600')) {
      setCity('Chennai');
      setStateName('Tamil Nadu');
    } else if (pincode.startsWith('641')) {
      setCity('Coimbatore');
      setStateName('Tamil Nadu');
    } else if (pincode.startsWith('560')) {
      setCity('Bengaluru');
      setStateName('Karnataka');
    } else if (pincode.startsWith('400')) {
      setCity('Mumbai');
      setStateName('Maharashtra');
    }
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!email.includes('@')) errs.email = 'Enter a valid email address.';
    if (phone.length !== 10) errs.phone = 'Enter a 10-digit mobile number.';
    if (!fullName.trim()) errs.fullName = 'Enter your full name.';
    if (!addressLine.trim()) errs.addressLine = 'Enter your delivery address.';
    if (pincode.length !== 6) errs.pincode = 'Enter a 6-digit pincode.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (paymentMethod === 'Cash on delivery' && isCodDisabled) return;

    setIsProcessing(true);

    // 2.2s processing arc state
    await new Promise((resolve) => setTimeout(resolve, 2200));

    const newOrder = await createOrder({
      customerId: 'cust-1',
      customerName: fullName,
      customerEmail: email,
      items: cartItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        image: item.image,
        unitPrice: item.price,
        qty: item.qty,
      })),
      subtotal,
      discount: 0,
      shipping: shippingCost,
      gst: Math.round(subtotal * 0.03),
      total,
      shippingAddress: {
        id: 'addr-1',
        label: 'Home',
        line1: addressLine,
        line2: landmark,
        city,
        state: stateName,
        pincode,
        phone,
        isDefault: true,
      },
      paymentMethod,
    });

    clearCart();
    router.push(`/checkout/confirmed/${newOrder.id}`);
  };

  if (cartItems.length === 0 && !isProcessing) {
    return (
      <div className="min-h-screen bg-[var(--color-vault-black)] text-[var(--color-ivory)] flex flex-col justify-center items-center p-6 text-center space-y-4 font-sans">
        <KolamDivider />
        <h2 className="font-serif text-3xl">No Reservation Items</h2>
        <p className="font-jost text-sm text-[var(--color-sandal)]/70">Your cart is empty. Browse the archive to select pieces.</p>
        <Link
          href="/collections"
          className="h-10 px-6 border border-[var(--color-temple-gold)] text-[var(--color-temple-gold)] font-marcellus text-xs uppercase tracking-[0.2em] inline-flex items-center justify-center rounded-[2px]"
        >
          RETURN TO ARCHIVE
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-vault-black)] text-[var(--color-ivory)] select-none font-sans">
      {/* Top Header */}
      <header className="border-b border-[var(--color-temple-gold)]/20 py-6 px-6 sm:px-8 bg-[var(--color-sanctum)]">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <Link href="/cart" className="flex items-center gap-2 font-marcellus text-xs uppercase tracking-[0.2em] text-[var(--color-temple-gold)] hover:text-[var(--color-gold-light)] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO CART</span>
          </Link>

          <Link href="/" className="font-marcellus text-xl tracking-[0.14em] text-[var(--color-ivory)]">
            ADI PARVA
          </Link>

          <div className="flex items-center gap-2 font-marcellus text-xs uppercase tracking-[0.2em] text-[var(--color-temple-gold)]">
            <Lock className="w-3.5 h-3.5 text-[var(--color-temple-gold)]" />
            <span>100% SECURE CHECKOUT</span>
          </div>
        </div>
      </header>

      {/* Main 2-Column Checkout Layout */}
      <main className="max-w-[1440px] mx-auto px-6 sm:px-8 py-12">
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Billing Details & Options */}
          <div className="lg:col-span-7 space-y-10">
            {/* Step 1: Contact & Delivery Address */}
            <div className="bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 rounded-[4px] p-6 space-y-6">
              <h3 className="font-marcellus text-[12px] uppercase tracking-[0.3em] text-[var(--color-temple-gold)] border-b border-[var(--color-temple-gold)]/20 pb-3">
                1. DELIVER TO (PATRON DETAILS)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-jost text-sm">
                <div className="space-y-1.5">
                  <label className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)]">FULL NAME</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-transparent border border-[#3A2A22] rounded-[2px] px-3.5 py-2.5 text-[var(--color-ivory)] outline-none focus:border-[var(--color-temple-gold)] focus:shadow-[0_0_12px_rgba(201,162,75,0.25)] transition-all"
                    required
                  />
                  {errors.fullName && <p className="text-xs text-[var(--color-kemp-red)]">{errors.fullName}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)]">MOBILE PHONE</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-transparent border border-[#3A2A22] rounded-[2px] px-3.5 py-2.5 text-[var(--color-ivory)] outline-none focus:border-[var(--color-temple-gold)] focus:shadow-[0_0_12px_rgba(201,162,75,0.25)] transition-all"
                    required
                  />
                  {errors.phone && <p className="text-xs text-[var(--color-kemp-red)]">{errors.phone}</p>}
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)]">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border border-[#3A2A22] rounded-[2px] px-3.5 py-2.5 text-[var(--color-ivory)] outline-none focus:border-[var(--color-temple-gold)] focus:shadow-[0_0_12px_rgba(201,162,75,0.25)] transition-all"
                    required
                  />
                  {errors.email && <p className="text-xs text-[var(--color-kemp-red)]">{errors.email}</p>}
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)]">STREET ADDRESS & HOUSE NO.</label>
                  <input
                    type="text"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    className="w-full bg-transparent border border-[#3A2A22] rounded-[2px] px-3.5 py-2.5 text-[var(--color-ivory)] outline-none focus:border-[var(--color-temple-gold)] focus:shadow-[0_0_12px_rgba(201,162,75,0.25)] transition-all"
                    required
                  />
                  {errors.addressLine && <p className="text-xs text-[var(--color-kemp-red)]">{errors.addressLine}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)]">LANDMARK (OPTIONAL)</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full bg-transparent border border-[#3A2A22] rounded-[2px] px-3.5 py-2.5 text-[var(--color-ivory)] outline-none focus:border-[var(--color-temple-gold)] focus:shadow-[0_0_12px_rgba(201,162,75,0.25)] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)]">PINCODE</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    onBlur={handlePincodeBlur}
                    className="w-full bg-transparent border border-[#3A2A22] rounded-[2px] px-3.5 py-2.5 text-[var(--color-ivory)] outline-none focus:border-[var(--color-temple-gold)] focus:shadow-[0_0_12px_rgba(201,162,75,0.25)] transition-all"
                    required
                  />
                  {errors.pincode && <p className="text-xs text-[var(--color-kemp-red)]">{errors.pincode}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)]">CITY</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-transparent border border-[#3A2A22] rounded-[2px] px-3.5 py-2.5 text-[var(--color-ivory)] outline-none focus:border-[var(--color-temple-gold)] focus:shadow-[0_0_12px_rgba(201,162,75,0.25)] transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)]">STATE</label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full bg-transparent border border-[#3A2A22] rounded-[2px] px-3.5 py-2.5 text-[var(--color-ivory)] outline-none focus:border-[var(--color-temple-gold)] focus:shadow-[0_0_12px_rgba(201,162,75,0.25)] transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Method Radio Cards */}
            <div className="bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 rounded-[4px] p-6 space-y-6">
              <h3 className="font-marcellus text-[12px] uppercase tracking-[0.3em] text-[var(--color-temple-gold)] border-b border-[var(--color-temple-gold)]/20 pb-3">
                2. SHIPPING METHOD
              </h3>

              <div className="space-y-3 font-jost text-sm">
                {[
                  { id: 'standard', label: 'Standard Insured Transit', time: '5–7 Business Days', price: 'FREE' },
                  { id: 'express', label: 'Express Priority Transit', time: '2–3 Business Days', price: '₹199' },
                  { id: 'sameday', label: 'Same-Day Atelier Courier', time: 'Within City Limits', price: '₹499' },
                ].map((s) => (
                  <label
                    key={s.id}
                    onClick={() => setShippingMethod(s.id as any)}
                    className={`flex items-center justify-between p-4 rounded-[2px] border cursor-pointer transition-all ${
                      shippingMethod === s.id
                        ? 'border-[var(--color-temple-gold)] bg-[var(--color-burgundy-silk)] text-[var(--color-ivory)]'
                        : 'border-[#3A2A22] bg-transparent text-[var(--color-sandal)]/80 hover:border-[var(--color-temple-gold)]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        shippingMethod === s.id ? 'border-[var(--color-gold-light)] bg-[var(--color-gold-light)]' : 'border-[#3A2A22]'
                      }`}>
                        {shippingMethod === s.id && <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-vault-black)]" />}
                      </div>
                      <div>
                        <div className="font-marcellus text-xs uppercase tracking-wider text-[var(--color-ivory)]">{s.label}</div>
                        <div className="text-xs text-[var(--color-sandal)]/70">{s.time}</div>
                      </div>
                    </div>
                    <span className="font-marcellus text-xs text-[var(--color-temple-gold)] font-medium">{s.price}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 3: Payment Method Radio Cards */}
            <div className="bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 rounded-[4px] p-6 space-y-6">
              <h3 className="font-marcellus text-[12px] uppercase tracking-[0.3em] text-[var(--color-temple-gold)] border-b border-[var(--color-temple-gold)]/20 pb-3">
                3. PAYMENT METHOD
              </h3>

              <div className="space-y-3 font-jost text-sm">
                {[
                  { id: 'UPI', label: 'UPI / QR Code', desc: 'Instant Google Pay, PhonePe, Paytm transfer' },
                  { id: 'Card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
                  { id: 'Net banking', label: 'Net Banking', desc: 'All major Indian banks supported' },
                  { id: 'Cash on delivery', label: 'Cash on Delivery', desc: isCodDisabled ? 'Disabled for orders above ₹50,000' : 'Pay cash at your doorstep' },
                ].map((p) => {
                  const disabled = p.id === 'Cash on delivery' && isCodDisabled;
                  return (
                    <label
                      key={p.id}
                      onClick={() => !disabled && setPaymentMethod(p.id as any)}
                      className={`flex items-center justify-between p-4 rounded-[2px] border transition-all ${
                        disabled
                          ? 'border-gray-800 opacity-50 cursor-not-allowed'
                          : paymentMethod === p.id
                          ? 'border-[var(--color-temple-gold)] bg-[var(--color-burgundy-silk)] text-[var(--color-ivory)] cursor-pointer'
                          : 'border-[#3A2A22] bg-transparent text-[var(--color-sandal)]/80 hover:border-[var(--color-temple-gold)]/50 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === p.id ? 'border-[var(--color-gold-light)] bg-[var(--color-gold-light)]' : 'border-[#3A2A22]'
                        }`}>
                          {paymentMethod === p.id && <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-vault-black)]" />}
                        </div>
                        <div>
                          <div className="font-marcellus text-xs uppercase tracking-wider text-[var(--color-ivory)]">{p.label}</div>
                          <div className="text-xs text-[var(--color-sandal)]/70">{p.desc}</div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Order Summary */}
          <div className="lg:col-span-5 bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 rounded-[4px] p-6 space-y-6 sticky top-28">
            <h3 className="font-marcellus text-[12px] uppercase tracking-[0.3em] text-[var(--color-temple-gold)] border-b border-[var(--color-temple-gold)]/20 pb-3">
              ORDER SUMMARY ({cartItems.length} ITEMS)
            </h3>

            {/* Line Items */}
            <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2 divide-y divide-[var(--color-temple-gold)]/10">
              {cartItems.map((item) => {
                const plateNo = `PLATE AP-${String(Math.abs(item.productId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 800 + 100).padStart(4, '0')}`;
                return (
                  <div key={`${item.productId}-${item.variantId}`} className="pt-3 first:pt-0 flex gap-4 items-center">
                    <div className="relative w-14 aspect-[3/4] bg-[var(--color-vault-black)] rounded-[2px] overflow-hidden border border-[var(--color-temple-gold)]/30 shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="font-marcellus text-[9px] uppercase tracking-wider text-[var(--color-temple-gold)]">{plateNo}</div>
                      <div className="font-serif text-sm text-[var(--color-ivory)] line-clamp-1">{item.name}</div>
                      <div className="font-jost text-xs text-[var(--color-sandal)]/70">Qty: {item.qty}</div>
                    </div>
                    <div className="font-sans text-sm text-[var(--color-ivory)] tabular-nums">
                      ₹{(item.price * item.qty).toLocaleString('en-IN')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals Breakdown */}
            <div className="border-t border-[var(--color-temple-gold)]/20 pt-4 space-y-2.5 font-jost text-sm text-[var(--color-sandal)]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-[var(--color-ivory)] tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-[var(--color-temple-gold)]">{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--color-temple-gold)]/20 pt-3">
                <span className="font-marcellus text-sm uppercase tracking-wider text-[var(--color-ivory)]">TOTAL</span>
                <span className="font-serif text-[28px] text-[var(--color-ivory)] font-light tabular-nums">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="btn-gold-sheen w-full h-[54px] bg-[var(--color-temple-gold)] text-[var(--color-vault-black)] font-marcellus text-[11px] uppercase tracking-[0.3em] font-semibold flex items-center justify-center gap-2 rounded-[2px] shadow-xl cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-black" />
                  <span>REGISTERING ORDER...</span>
                </>
              ) : (
                <span>PLACE ORDER</span>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 font-marcellus text-[10px] uppercase tracking-[0.2em] text-[var(--color-sandal)]/60 pt-2">
              <ShieldCheck className="w-4 h-4 text-[var(--color-temple-gold)]" />
              <span>100% SECURE ENCRYPTED TRANSACTIONS</span>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
