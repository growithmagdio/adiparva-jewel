'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/store/use-cart-store';
import { createOrder } from '@/lib/data/queries';
import { Button } from '@/components/primitives/button';
import { GopuramRule } from '@/components/ui/GopuramRule';
import { Lock, ArrowLeft, Loader2, Check } from 'lucide-react';

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
  const [editingCityState, setEditingCityState] = React.useState(false);

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

  const codHandlingFee = paymentMethod === 'Cash on delivery' ? 49 : 0;
  const total = subtotal + shippingCost + codHandlingFee;
  const isCodDisabled = total > 50000;

  // Auto-fill City/State based on Pincode
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
      subtotal: subtotal,
      discount: 0,
      shipping: shippingCost + codHandlingFee,
      gst: Math.round(subtotal * 0.03),
      total: total,
      shippingAddress: {
        id: 'addr-1',
        label: 'Delivery Address',
        line1: addressLine,
        line2: landmark,
        city: city,
        state: stateName,
        pincode: pincode,
        phone: `+91 ${phone}`,
        isDefault: true,
      },
      paymentMethod: paymentMethod,
    });

    clearCart();
    setIsProcessing(false);
    router.push(`/checkout/confirmed/${newOrder.id}`);
  };

  if (cartItems.length === 0 && !isProcessing) {
    return (
      <div className="min-h-screen bg-[var(--color-ivory)] flex flex-col font-sans">
        <header className="border-b border-[var(--color-hairline)] py-6 text-center">
          <Link href="/" className="font-bodoni text-2xl tracking-[-0.02em] text-[var(--color-ink)]">
            ADI PARVA
          </Link>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
          <h2 className="font-bodoni text-3xl text-[var(--color-ink)]">Your bag is empty.</h2>
          <p className="font-karla text-sm text-[var(--color-ink)]/70">Add pieces to your bag before checking out.</p>
          <Link href="/collections">
            <Button variant="gold">Explore collection</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-ivory)] text-[var(--color-ink)] flex flex-col font-sans">
      {/* Conversion-Focused Header: Wordmark + Encrypted Lock line */}
      <header className="border-b border-[var(--color-hairline)] bg-[var(--color-ivory)] py-5 px-6 select-none">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex flex-col">
            <span className="font-bodoni text-[22px] tracking-[-0.02em] text-[var(--color-ink)]">
              ADI PARVA
            </span>
            <span className="font-marcellus text-[9px] uppercase tracking-[0.34em] text-[var(--color-gold)]">
              THE TEMPLE OF TRADITION
            </span>
          </Link>

          <div className="flex items-center gap-2 font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Encrypted Checkout</span>
          </div>
        </div>
      </header>

      {/* Main Single Page 60/40 Two Column Layout */}
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column 60% (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-12">
            <form onSubmit={handlePlaceOrder} className="space-y-12">
              {/* 1. Contact Section */}
              <section className="space-y-6">
                <h2 className="font-marcellus text-[12px] uppercase tracking-[0.18em] text-[var(--color-gold)] border-b border-[var(--color-hairline)] pb-2">
                  1. Contact Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-karla">
                  <div className="space-y-1">
                    <label className="block font-marcellus text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink)]/70">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => validateForm()}
                      className="w-full h-[52px] px-4 bg-[var(--color-bone)] border-b border-[var(--color-hairline)] focus:border-[var(--color-gold)] text-base outline-none rounded-[2px]"
                      placeholder="name@example.com"
                    />
                    {errors.email && <p className="text-[12px] text-[var(--color-kumkum)] pt-1">{errors.email}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="block font-marcellus text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink)]/70">
                      Mobile Number
                    </label>
                    <div className="flex h-[52px] bg-[var(--color-bone)] border-b border-[var(--color-hairline)] rounded-[2px] overflow-hidden">
                      <span className="px-3 flex items-center font-karla text-sm text-[var(--color-ink)]/60 bg-[var(--color-hairline)]/30">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        onBlur={() => validateForm()}
                        className="flex-1 px-3 bg-transparent text-base outline-none font-karla"
                        placeholder="9876543210"
                      />
                    </div>
                    {errors.phone && <p className="text-[12px] text-[var(--color-kumkum)] pt-1">{errors.phone}</p>}
                  </div>
                </div>
              </section>

              {/* 2. Delivery Address Section */}
              <section className="space-y-6">
                <h2 className="font-marcellus text-[12px] uppercase tracking-[0.18em] text-[var(--color-gold)] border-b border-[var(--color-hairline)] pb-2">
                  2. Delivery Address
                </h2>

                <div className="space-y-6 font-karla">
                  <div className="space-y-1">
                    <label className="block font-marcellus text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink)]/70">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onBlur={() => validateForm()}
                      className="w-full h-[52px] px-4 bg-[var(--color-bone)] border-b border-[var(--color-hairline)] focus:border-[var(--color-gold)] text-base outline-none rounded-[2px]"
                      placeholder="First and last name"
                    />
                    {errors.fullName && <p className="text-[12px] text-[var(--color-kumkum)] pt-1">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="block font-marcellus text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink)]/70">
                      Address Line
                    </label>
                    <input
                      type="text"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      onBlur={() => validateForm()}
                      className="w-full h-[52px] px-4 bg-[var(--color-bone)] border-b border-[var(--color-hairline)] focus:border-[var(--color-gold)] text-base outline-none rounded-[2px]"
                      placeholder="House number, street name"
                    />
                    {errors.addressLine && <p className="text-[12px] text-[var(--color-kumkum)] pt-1">{errors.addressLine}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="block font-marcellus text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink)]/70">
                        Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full h-[52px] px-4 bg-[var(--color-bone)] border-b border-[var(--color-hairline)] focus:border-[var(--color-gold)] text-base outline-none rounded-[2px]"
                        placeholder="Near landmark"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-marcellus text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink)]/70">
                        Pincode
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                        onBlur={handlePincodeBlur}
                        className="w-full h-[52px] px-4 bg-[var(--color-bone)] border-b border-[var(--color-hairline)] focus:border-[var(--color-gold)] text-base outline-none rounded-[2px]"
                        placeholder="6-digit pincode"
                      />
                      {errors.pincode && <p className="text-[12px] text-[var(--color-kumkum)] pt-1">{errors.pincode}</p>}
                    </div>
                  </div>

                  {/* Auto-filled City & State Read-Only Chips */}
                  <div className="flex items-center gap-3 pt-2">
                    <span className="font-marcellus text-[10px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
                      City & State:
                    </span>
                    {!editingCityState ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-[var(--color-bone)] border border-[var(--color-hairline)] text-xs font-medium rounded-[2px]">
                          {city}, {stateName}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingCityState(true)}
                          className="font-marcellus text-[10px] uppercase tracking-[0.14em] text-[var(--color-gold)] underline"
                        >
                          Edit
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-28 px-2 py-1 bg-[var(--color-bone)] border border-[var(--color-hairline)] text-xs"
                        />
                        <input
                          type="text"
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                          className="w-28 px-2 py-1 bg-[var(--color-bone)] border border-[var(--color-hairline)] text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingCityState(false)}
                          className="text-xs text-[var(--color-gold)] font-medium"
                        >
                          Done
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* 3. Shipping Method Section */}
              <section className="space-y-6">
                <h2 className="font-marcellus text-[12px] uppercase tracking-[0.18em] text-[var(--color-gold)] border-b border-[var(--color-hairline)] pb-2">
                  3. Shipping Method
                </h2>

                <div className="space-y-3 font-karla">
                  {[
                    { id: 'standard', title: 'Standard Armored Transit (5–7 Days)', price: 'Free', val: 0 },
                    { id: 'express', title: 'Express Insured Air (2–3 Days)', price: '₹199', val: 199 },
                    { id: 'sameday', title: 'Same-Day Atelier Courier (Madurai Only)', price: '₹499', val: 499 },
                  ].map((option) => (
                    <label
                      key={option.id}
                      onClick={() => setShippingMethod(option.id as any)}
                      className={`flex items-center justify-between p-4 bg-[var(--color-ivory)] border border-[var(--color-hairline)] transition-all cursor-pointer rounded-[2px] ${
                        shippingMethod === option.id
                          ? 'border-l-4 border-l-[var(--color-gold)] border-y-[var(--color-hairline)] border-r-[var(--color-hairline)]'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingMethod === option.id}
                          onChange={() => setShippingMethod(option.id as any)}
                          className="accent-[var(--color-gold)]"
                        />
                        <span className="text-sm font-medium text-[var(--color-ink)]">{option.title}</span>
                      </div>
                      <span className="text-sm font-semibold text-[var(--color-ink)]">{option.price}</span>
                    </label>
                  ))}
                </div>
              </section>

              {/* 4. Payment Method Section */}
              <section className="space-y-6">
                <h2 className="font-marcellus text-[12px] uppercase tracking-[0.18em] text-[var(--color-gold)] border-b border-[var(--color-hairline)] pb-2">
                  4. Payment Options
                </h2>

                <div className="space-y-3 font-karla">
                  {[
                    { id: 'UPI', label: 'UPI / QR Payment' },
                    { id: 'Card', label: 'Credit / Debit Cards (Visa / Mastercard)' },
                    { id: 'Net banking', label: 'Net Banking' },
                    { id: 'Cash on delivery', label: 'Cash on Delivery' },
                  ].map((pay) => {
                    const isDisabled = pay.id === 'Cash on delivery' && isCodDisabled;
                    return (
                      <div key={pay.id} className="space-y-2">
                        <label
                          onClick={() => !isDisabled && setPaymentMethod(pay.id as any)}
                          className={`flex items-center justify-between p-4 bg-[var(--color-ivory)] border border-[var(--color-hairline)] transition-all cursor-pointer rounded-[2px] ${
                            paymentMethod === pay.id
                              ? 'border-l-4 border-l-[var(--color-gold)] border-y-[var(--color-hairline)] border-r-[var(--color-hairline)]'
                              : ''
                          } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="payment"
                              disabled={isDisabled}
                              checked={paymentMethod === pay.id}
                              onChange={() => setPaymentMethod(pay.id as any)}
                              className="accent-[var(--color-gold)]"
                            />
                            <span className="text-sm font-medium text-[var(--color-ink)]">{pay.label}</span>
                          </div>
                          {pay.id === 'Cash on delivery' && (
                            <span className="text-xs text-[var(--color-ink)]/60">₹49 handling fee</span>
                          )}
                        </label>
                        {isDisabled && pay.id === 'Cash on delivery' && (
                          <p className="text-xs text-[var(--color-kumkum)] pl-7">
                            Cash on delivery is disabled for orders exceeding ₹50,000.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 5. Place Order Button (Gold Foil Gradient) */}
              <div className="pt-4">
                <Button
                  type="submit"
                  variant="gold"
                  isLoading={isProcessing}
                  className="w-full h-[60px] text-sm bg-foil-gold text-[var(--color-vault)] font-bold tracking-[0.2em]"
                >
                  {isProcessing ? 'Verifying Atelier Reservation...' : `Place Order · ₹${total.toLocaleString('en-IN')}`}
                </Button>
              </div>
            </form>
          </div>

          {/* Right Sticky Order Summary 40% (lg:col-span-5) */}
          <div className="lg:col-span-5 sticky top-28 bg-[var(--color-ivory)] border border-[var(--color-hairline)] p-6 space-y-6 rounded-[2px] font-karla">
            <h3 className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)] border-b border-[var(--color-hairline)] pb-3">
              Order Summary ({cartItems.reduce((acc, item) => acc + item.qty, 0)})
            </h3>

            {/* Line Items with 56px Thumbnails */}
            <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
              {cartItems.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="flex items-center gap-3">
                  <div className="w-[56px] h-[56px] bg-[var(--color-vault)] relative overflow-hidden shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-xs text-[var(--color-ink)] truncate">{item.name}</h4>
                    <p className="text-[11px] text-[var(--color-ink)]/60">Qty: {item.qty}</p>
                  </div>
                  <span className="font-medium text-xs text-[var(--color-ink)] [font-variant-numeric:tabular-nums]">
                    ₹{(item.price * item.qty).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <GopuramRule size="sm" />

            {/* Totals Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[var(--color-ink)]/80">
                <span>Subtotal</span>
                <span className="[font-variant-numeric:tabular-nums]">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[var(--color-ink)]/80">
                <span>Armored Shipping</span>
                <span>{shippingCost === 0 ? <span className="text-[var(--color-leaf)]">Free</span> : `₹${shippingCost}`}</span>
              </div>
              {codHandlingFee > 0 && (
                <div className="flex justify-between text-[var(--color-ink)]/80">
                  <span>COD Handling Fee</span>
                  <span>₹{codHandlingFee}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t border-[var(--color-hairline)]">
                <span className="font-marcellus text-xs uppercase tracking-[0.18em] text-[var(--color-gold)]">Total</span>
                <span className="font-bodoni text-[28px] text-[var(--color-ink)] [font-variant-numeric:tabular-nums]">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Single Line Trust Rule (Replaces icon strips) */}
            <div className="pt-4 border-t border-[var(--color-hairline)] text-center font-marcellus text-[10px] uppercase tracking-[0.16em] text-[var(--color-gold)]">
              Secure payment · 7-day returns · COD available
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
