'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { BicameralHeading, MicroLabel, Price, Button, Input, Field } from '@/components/primitives';
import { useCartStore } from '@/lib/store/use-cart-store';
import { createOrder } from '@/lib/data/queries';
import { formatCurrency } from '@/lib/data/format';
import { ShieldCheck, ArrowRight, CheckCircle2, CreditCard, QrCode, Building, AlertCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function CheckoutPage() {
  const router = useRouter();
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const [step, setStep] = React.useState<1 | 2 | 3>(1);

  // Form State
  const [customerName, setCustomerName] = React.useState('Priya Sharma');
  const [customerEmail, setCustomerEmail] = React.useState('priya.sharma@example.com');
  const [customerPhone, setCustomerPhone] = React.useState('+91 98765 43210');

  const [addressLine1, setAddressLine1] = React.useState('No. 42, Khader Nawaz Khan Road');
  const [addressLine2, setAddressLine2] = React.useState('Nungambakkam');
  const [city, setCity] = React.useState('Chennai');
  const [stateName, setStateName] = React.useState('Tamil Nadu');
  const [pincode, setPincode] = React.useState('600034');

  const [paymentMethod, setPaymentMethod] = React.useState<'Card' | 'UPI' | 'Net banking' | 'Cash on delivery'>('Card');
  const [isProcessing, setIsProcessing] = React.useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal >= 25000 || subtotal === 0 ? 0 : 450;
  const gst = Math.round(subtotal * 0.03); // 3% GST
  const total = subtotal + shipping + gst;

  const isCodDisabled = total > 50000;

  const handleCompleteOrder = async () => {
    setIsProcessing(true);

    // Simulate 2.2s processing arc
    await new Promise((resolve) => setTimeout(resolve, 2200));

    const newOrder = await createOrder({
      customerId: 'cust-1',
      customerName: customerName,
      customerEmail: customerEmail,
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
      shipping: shipping,
      gst: gst,
      total: total,
      status: 'confirmed',
      timeline: [
        {
          status: 'confirmed',
          at: new Date().toISOString(),
          note: 'Reservation payment verified and assigned to atelier vault.',
        },
      ],
      shippingAddress: {
        id: 'addr-1',
        label: 'Home',
        line1: addressLine1,
        line2: addressLine2,
        city: city,
        state: stateName,
        pincode: pincode,
        phone: customerPhone,
        isDefault: true,
      },
      paymentMethod: paymentMethod,
      placedAt: new Date().toISOString(),
      expectedBy: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    });

    clearCart();
    setIsProcessing(false);
    router.push(`/checkout/confirmed/${newOrder.id}`);
  };

  if (cartItems.length === 0 && !isProcessing) {
    return (
      <div className="min-h-screen bg-[var(--color-cream-100)] flex flex-col font-sans">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <MicroLabel className="text-[var(--color-gold-600)] mb-2">CHECKOUT REPOSITORY</MicroLabel>
          <h2 className="font-serif text-3xl text-[var(--color-text-900)]">Your reservation bag is empty</h2>
          <p className="text-xs text-[var(--color-text-500)] mt-2">Add pieces from our collection before proceeding to checkout.</p>
          <Link href="/collections" className="mt-6">
            <Button variant="primary">Explore Collection</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream-100)] text-[var(--color-text-700)] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-10 space-y-10">
        {/* Stepper Header */}
        <div className="border-b border-[var(--color-cream-200)] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <MicroLabel className="text-[var(--color-gold-600)]">RESERVATION CHECKOUT</MicroLabel>
            <BicameralHeading italicPart="Secure" romanPart="Reservation" size="xl" />
          </div>

          <div className="flex items-center gap-2 sm:gap-4 text-xs font-sans font-semibold uppercase tracking-wider">
            <button
              onClick={() => setStep(1)}
              className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-pill)]', step === 1 ? 'bg-[var(--color-ink-900)] text-white' : 'text-[var(--color-text-500)]')}
            >
              <span>1. DETAILS</span>
            </button>
            <span>→</span>
            <button
              onClick={() => setStep(2)}
              className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-pill)]', step === 2 ? 'bg-[var(--color-ink-900)] text-white' : 'text-[var(--color-text-500)]')}
            >
              <span>2. DELIVERY</span>
            </button>
            <span>→</span>
            <button
              onClick={() => setStep(3)}
              className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-pill)]', step === 3 ? 'bg-[var(--color-ink-900)] text-white' : 'text-[var(--color-text-500)]')}
            >
              <span>3. PAYMENT</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Checkout Steps (Left ~7 Cols) & Order Summary (Right ~5 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Form Step Panels (Left 7 Cols) */}
          <div className="lg:col-span-7 bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-8 rounded-[var(--radius-card)] shadow-xs space-y-8">
            {/* STEP 1: Details */}
            {step === 1 && (
              <div className="space-y-6">
                <MicroLabel className="text-[var(--color-gold-600)]">STEP 1 OF 3 — PATRON CONTACT</MicroLabel>
                <h3 className="font-serif text-2xl font-medium text-[var(--color-text-900)]">Contact & Account Details</h3>

                <div className="space-y-4">
                  <Field label="FULL NAME" required>
                    <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
                  </Field>
                  <Field label="EMAIL ADDRESS (FOR RESERVATION DEED)" required>
                    <Input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required />
                  </Field>
                  <Field label="PHONE NUMBER (FOR ARMORED TRANSIT COORDINATION)" required>
                    <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />
                  </Field>
                </div>

                <div className="pt-4 border-t border-[var(--color-cream-200)] flex justify-end">
                  <Button variant="primary" size="lg" onClick={() => setStep(2)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                    CONTINUE TO DELIVERY
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Delivery */}
            {step === 2 && (
              <div className="space-y-6">
                <MicroLabel className="text-[var(--color-gold-600)]">STEP 2 OF 3 — ARMORED TRANSIT ADDRESS</MicroLabel>
                <h3 className="font-serif text-2xl font-medium text-[var(--color-text-900)]">Insured Delivery Address</h3>

                <div className="space-y-4">
                  <Field label="ADDRESS LINE 1" required>
                    <Input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} required />
                  </Field>
                  <Field label="ADDRESS LINE 2 (APARTMENT, SUITE, ETC.)">
                    <Input value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="CITY" required>
                      <Input value={city} onChange={(e) => setCity(e.target.value)} required />
                    </Field>
                    <Field label="STATE" required>
                      <Input value={stateName} onChange={(e) => setStateName(e.target.value)} required />
                    </Field>
                    <Field label="PINCODE" required>
                      <Input value={pincode} onChange={(e) => setPincode(e.target.value)} required />
                    </Field>
                  </div>
                </div>

                <div className="p-4 bg-[var(--color-ok-bg)] border border-[var(--color-ok-fg)]/30 rounded text-xs text-[var(--color-ok-fg)] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Pincode {pincode} is eligible for priority armored vehicle courier dispatch.</span>
                </div>

                <div className="pt-4 border-t border-[var(--color-cream-200)] flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    BACK
                  </Button>
                  <Button variant="primary" size="lg" onClick={() => setStep(3)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                    CONTINUE TO PAYMENT
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Payment */}
            {step === 3 && (
              <div className="space-y-6">
                <MicroLabel className="text-[var(--color-gold-600)]">STEP 3 OF 3 — PAYMENT METHOD</MicroLabel>
                <h3 className="font-serif text-2xl font-medium text-[var(--color-text-900)]">Select Payment Instrument</h3>

                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod('Card')}
                    className={clsx(
                      'w-full p-4 rounded-[var(--radius-card)] border flex items-center justify-between cursor-pointer transition-colors text-left',
                      paymentMethod === 'Card' ? 'border-[var(--color-gold-600)] bg-[var(--color-cream-50)]' : 'border-[var(--color-cream-300)]'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-[var(--color-gold-600)]" />
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-text-900)]">Credit / Debit Card</p>
                        <p className="text-[11px] text-[var(--color-text-500)]">Visa, Mastercard, American Express, RuPay</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('UPI')}
                    className={clsx(
                      'w-full p-4 rounded-[var(--radius-card)] border flex items-center justify-between cursor-pointer transition-colors text-left',
                      paymentMethod === 'UPI' ? 'border-[var(--color-gold-600)] bg-[var(--color-cream-50)]' : 'border-[var(--color-cream-300)]'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <QrCode className="w-5 h-5 text-[var(--color-gold-600)]" />
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-text-900)]">Instant UPI / QR</p>
                        <p className="text-[11px] text-[var(--color-text-500)]">Google Pay, PhonePe, Paytm, BHIM</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('Net banking')}
                    className={clsx(
                      'w-full p-4 rounded-[var(--radius-card)] border flex items-center justify-between cursor-pointer transition-colors text-left',
                      paymentMethod === 'Net banking' ? 'border-[var(--color-gold-600)] bg-[var(--color-cream-50)]' : 'border-[var(--color-cream-300)]'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-[var(--color-gold-600)]" />
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-text-900)]">Net Banking</p>
                        <p className="text-[11px] text-[var(--color-text-500)]">All major Indian banks supported</p>
                      </div>
                    </div>
                  </button>

                  <button
                    disabled={isCodDisabled}
                    onClick={() => !isCodDisabled && setPaymentMethod('Cash on delivery')}
                    className={clsx(
                      'w-full p-4 rounded-[var(--radius-card)] border flex items-center justify-between text-left transition-colors',
                      isCodDisabled
                        ? 'opacity-50 border-[var(--color-cream-200)] cursor-not-allowed bg-[var(--color-cream-100)]'
                        : paymentMethod === 'Cash on delivery'
                        ? 'border-[var(--color-gold-600)] bg-[var(--color-cream-50)] cursor-pointer'
                        : 'border-[var(--color-cream-300)] cursor-pointer'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-[var(--color-gold-600)]" />
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-text-900)]">Cash on Delivery</p>
                        <p className="text-[11px] text-[var(--color-text-500)]">
                          {isCodDisabled
                            ? 'Disabled for orders above ₹50,000 due to RBI high-value transit security policy.'
                            : 'Available for transit verification.'}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="pt-4 border-t border-[var(--color-cream-200)] flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(2)}>
                    BACK
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    disabled={isProcessing}
                    onClick={handleCompleteOrder}
                    leftIcon={isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                  >
                    {isProcessing ? 'AUTHORIZING RESERVATION...' : `COMPLETE RESERVATION (${formatCurrency(total)})`}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary (Right 5 Cols) */}
          <div className="lg:col-span-5 bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-6 rounded-[var(--radius-card)] shadow-xs space-y-6">
            <MicroLabel className="text-[var(--color-gold-600)]">RESERVATION SUMMARY</MicroLabel>

            {/* Line items list */}
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1 border-b border-[var(--color-cream-200)] pb-4">
              {cartItems.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="flex gap-3 text-xs font-sans">
                  <div className="w-14 h-14 bg-[var(--color-cream-100)] rounded relative overflow-hidden shrink-0 border border-[var(--color-cream-300)]">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-[var(--color-text-900)] line-clamp-1">{item.name}</h5>
                    <p className="text-[11px] text-[var(--color-text-500)]">{item.variantLabel}</p>
                    <p className="text-[11px] text-[var(--color-gold-600)] mt-0.5">Qty: {item.qty}</p>
                  </div>
                  <Price amount={item.price * item.qty} size="sm" className="font-semibold" />
                </div>
              ))}
            </div>

            {/* Subtotals */}
            <div className="space-y-2 text-xs font-sans text-[var(--color-text-700)]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (3% Jewellery Rate)</span>
                <span>{formatCurrency(gst)}</span>
              </div>
              <div className="flex justify-between">
                <span>Armored Transit Shipping</span>
                <span>{shipping === 0 ? 'COMPLIMENTARY' : formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between text-base font-serif font-semibold text-[var(--color-text-900)] border-t border-[var(--color-cream-300)] pt-3 mt-3">
                <span>Total Amount</span>
                <Price amount={total} size="lg" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
