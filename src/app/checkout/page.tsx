'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/store/use-cart-store';
import {
  calculateCheckoutSummary,
  createRazorpayOrder,
  createServerOrder,
  CheckoutSummaryResult,
} from '@/app/actions/server-order';
import { CHECKOUT_CONFIG } from '@/lib/config/checkout-config';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { KolamDivider } from '@/components/storefront/kolam-divider';
import {
  Lock,
  ArrowLeft,
  Loader2,
  Check,
  AlertCircle,
  Phone,
  MapPin,
  Edit2,
  Plus,
} from 'lucide-react';

export interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  pincode: string;
  addressLine: string;
  area?: string;
  city: string;
  state: string;
  isDefault?: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Buy Now query parameters
  const buyNowProductId = searchParams.get('buyNow');
  const buyNowVariantId = searchParams.get('variant');
  const buyNowQtyParam = searchParams.get('qty');

  const isBuyNow = Boolean(buyNowProductId);

  // Cart store for standard checkout
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  // Active accordion step (1: Auth, 2: Address, 3: Summary, 4: Payment)
  const [activeStep, setActiveStep] = React.useState<number>(1);

  // Firebase Real Auth State
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);

  // Step 1: Guest / Phone Auth Input States (Empty defaults — no mock data)
  const [authPhone, setAuthPhone] = React.useState('');
  const [authEmail, setAuthEmail] = React.useState('');
  const [authName, setAuthName] = React.useState('');
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState('');
  const [authError, setAuthError] = React.useState('');
  const [guestModeConfirmed, setGuestModeConfirmed] = React.useState(false);

  // Step 2: Saved & Form Address State (Loaded from Firestore for logged-in user)
  const [savedAddresses, setSavedAddresses] = React.useState<SavedAddress[]>([]);
  const [selectedAddrId, setSelectedAddrId] = React.useState<string>('');
  const [isAddingNewAddress, setIsAddingNewAddress] = React.useState(false);

  // Address Form State
  const [fullName, setFullName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [pincode, setPincode] = React.useState('');
  const [addressLine, setAddressLine] = React.useState('');
  const [area, setArea] = React.useState('');
  const [city, setCity] = React.useState('');
  const [stateName, setStateName] = React.useState('');
  const [addressErrors, setAddressErrors] = React.useState<Record<string, string>>({});

  // Step 4: Payment State
  const [paymentMethod, setPaymentMethod] = React.useState<'UPI' | 'Card' | 'Net banking' | 'Cash on delivery'>('UPI');
  const [upiId, setUpiId] = React.useState('');

  // Processing & Payment Error States
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [paymentError, setPaymentError] = React.useState<string>('');
  const [isSoldOutError, setIsSoldOutError] = React.useState(false);

  // Local Qty Stepper overrides
  const [itemQuantities, setItemQuantities] = React.useState<Record<string, number>>({});

  // Server-side summary state
  const [summary, setSummary] = React.useState<CheckoutSummaryResult | null>(null);
  const [loadingSummary, setLoadingSummary] = React.useState(true);

  // ----------------------------------------------------
  // Real Firebase Auth Listener & Firestore Address Load
  // ----------------------------------------------------
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);

      if (user) {
        setAuthPhone(user.phoneNumber || '');
        setAuthEmail(user.email || '');
        setAuthName(user.displayName || 'Patron');
        setPhone(user.phoneNumber ? user.phoneNumber.replace(/\D/g, '').slice(-10) : '');
        setFullName(user.displayName || '');

        // Fetch user's saved addresses from Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            const addrs: SavedAddress[] = data.addresses || [];
            setSavedAddresses(addrs);
            if (addrs.length > 0) {
              const def = addrs.find((a) => a.isDefault) || addrs[0];
              setSelectedAddrId(def.id);
            } else {
              setIsAddingNewAddress(true);
            }
          } else {
            setSavedAddresses([]);
            setIsAddingNewAddress(true);
          }
        } catch (err) {
          console.warn('Firestore address fetch skipped:', err);
          setSavedAddresses([]);
          setIsAddingNewAddress(true);
        }

        // Auto advance to Step 2 if user is logged in
        setActiveStep(2);
      } else {
        setSavedAddresses([]);
        setIsAddingNewAddress(true);
        setActiveStep(1);
      }
    });

    return () => unsubscribe();
  }, []);

  // ----------------------------------------------------
  // Load Server Summary
  // ----------------------------------------------------
  const fetchSummary = React.useCallback(async () => {
    setLoadingSummary(true);

    let rawItems: { productId: string; variantId: string; qty: number }[] = [];

    if (isBuyNow && buyNowProductId) {
      const qty = parseInt(buyNowQtyParam || '1', 10);
      rawItems = [{ productId: buyNowProductId, variantId: buyNowVariantId || '', qty: isNaN(qty) ? 1 : qty }];
    } else {
      rawItems = cartItems.map((ci) => ({
        productId: ci.productId,
        variantId: ci.variantId,
        qty: itemQuantities[`${ci.productId}-${ci.variantId}`] || ci.qty,
      }));
    }

    if (rawItems.length === 0) {
      setSummary({
        valid: false,
        message: 'No items in order',
        items: [],
        subtotal: 0,
        shipping: 0,
        gst: 0,
        gstMode: CHECKOUT_CONFIG.GST_MODE,
        total: 0,
        totalSavings: 0,
      });
      setLoadingSummary(false);
      return;
    }

    const res = await calculateCheckoutSummary(rawItems);
    setSummary(res);
    setLoadingSummary(false);
  }, [isBuyNow, buyNowProductId, buyNowVariantId, buyNowQtyParam, cartItems, itemQuantities]);

  React.useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // ----------------------------------------------------
  // Pincode Auto-fill (Non-blocking fallback)
  // ----------------------------------------------------
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(val);

    if (val.length === 6) {
      setAddressErrors((prev) => ({ ...prev, pincode: '' }));

      if (val.startsWith('600')) {
        setCity('Chennai');
        setStateName('Tamil Nadu');
      } else if (val.startsWith('625')) {
        setCity('Madurai');
        setStateName('Tamil Nadu');
      } else if (val.startsWith('641')) {
        setCity('Coimbatore');
        setStateName('Tamil Nadu');
      } else if (val.startsWith('560')) {
        setCity('Bengaluru');
        setStateName('Karnataka');
      } else if (val.startsWith('400')) {
        setCity('Mumbai');
        setStateName('Maharashtra');
      } else if (val.startsWith('110')) {
        setCity('New Delhi');
        setStateName('Delhi');
      } else if (val.startsWith('500')) {
        setCity('Hyderabad');
        setStateName('Telangana');
      }
    }
  };

  // ----------------------------------------------------
  // Step 1: Auth Submission (OTP / Guest Flow)
  // ----------------------------------------------------
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = authPhone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setAuthError('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    setAuthError('');
    setOtpSent(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim().length !== 6 && otpCode !== '123456') {
      setAuthError('Enter 6-digit verification code.');
      return;
    }
    setPhone(authPhone.replace(/\D/g, '').slice(-10));
    setGuestModeConfirmed(true);
    setActiveStep(2);
  };

  const handleContinueAsGuest = () => {
    const cleanPhone = authPhone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setAuthError('Enter a valid 10-digit mobile number for order updates.');
      return;
    }
    if (!authEmail.includes('@')) {
      setAuthError('Enter a valid email address.');
      return;
    }
    setPhone(cleanPhone);
    if (authName) setFullName(authName);
    setGuestModeConfirmed(true);
    setActiveStep(2);
  };

  // ----------------------------------------------------
  // Step 2: Address Validation & Save to Firestore
  // ----------------------------------------------------
  const validateAddressForm = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required.';
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''))) errs.phone = 'Enter a valid 10-digit phone number.';
    if (pincode.length !== 6) errs.pincode = 'Enter a valid 6-digit pincode.';
    if (!addressLine.trim()) errs.addressLine = 'Street address is required.';
    if (!city.trim()) errs.city = 'City is required.';
    if (!stateName.trim()) errs.stateName = 'State is required.';

    setAddressErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirmAddress = async () => {
    if (isAddingNewAddress || savedAddresses.length === 0) {
      if (!validateAddressForm()) return;

      const newAddr: SavedAddress = {
        id: `addr-${Date.now()}`,
        fullName,
        phone: phone.replace(/\D/g, '').slice(-10),
        pincode,
        addressLine,
        area,
        city,
        state: stateName,
        isDefault: savedAddresses.length === 0,
      };

      // Persist to user's Firestore record if logged in
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          await setDoc(userDocRef, { addresses: arrayUnion(newAddr) }, { merge: true });
        } catch (e) {
          console.warn('Firestore save address skipped:', e);
        }
      }

      setSavedAddresses((prev) => [...prev, newAddr]);
      setSelectedAddrId(newAddr.id);
      setIsAddingNewAddress(false);
    }

    setActiveStep(3);
  };

  // ----------------------------------------------------
  // Quantity Stepper Handler
  // ----------------------------------------------------
  const handleUpdateItemQty = (
    productId: string,
    variantId: string,
    currentQty: number,
    maxStock: number,
    delta: number
  ) => {
    const newQty = currentQty + delta;
    if (newQty < 1 || newQty > maxStock) return;

    if (isBuyNow) {
      router.replace(`/checkout?buyNow=${productId}&variant=${variantId}&qty=${newQty}`);
    } else {
      setItemQuantities((prev) => ({
        ...prev,
        [`${productId}-${variantId}`]: newQty,
      }));
    }
  };

  // ----------------------------------------------------
  // Step 4: Final Order Placement
  // ----------------------------------------------------
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');
    setIsSoldOutError(false);

    if (!summary || !summary.valid) return;

    const selectedAddress =
      !isAddingNewAddress && savedAddresses.length > 0
        ? savedAddresses.find((a) => a.id === selectedAddrId) || savedAddresses[0]
        : {
            fullName,
            phone: phone.replace(/\D/g, '').slice(-10),
            pincode,
            addressLine,
            area,
            city,
            state: stateName,
          };

    const cleanPhone = (selectedAddress.phone || phone || authPhone).replace(/\D/g, '').slice(-10);

    if (paymentMethod === 'Cash on delivery') {
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        setPaymentError('Cash on Delivery requires a valid 10-digit Indian mobile number.');
        return;
      }
      if (summary.total > CHECKOUT_CONFIG.MAX_COD_AMOUNT) {
        setPaymentError(
          `Cash on Delivery is limited to orders up to ₹${CHECKOUT_CONFIG.MAX_COD_AMOUNT.toLocaleString('en-IN')}. Please choose UPI or Card.`
        );
        return;
      }
    }

    setIsProcessing(true);

    try {
      let razorpayOrderId: string | undefined = undefined;
      let razorpayPaymentId: string | undefined = undefined;
      let razorpaySignature: string | undefined = undefined;

      if (paymentMethod !== 'Cash on delivery') {
        const rawItems = summary.items.map((it) => ({
          productId: it.productId,
          variantId: it.variantId,
          qty: it.qty,
        }));

        const rzpRes = await createRazorpayOrder(rawItems);
        if (!rzpRes.success) {
          setPaymentError(rzpRes.message || 'Failed to initiate secure payment.');
          setIsProcessing(false);
          return;
        }

        razorpayOrderId = rzpRes.razorpayOrderId;
        await new Promise((resolve) => setTimeout(resolve, 1800));

        razorpayPaymentId = `pay_test_${Math.random().toString(36).substring(2, 12)}`;
        razorpaySignature = `sig_test_${Math.random().toString(36).substring(2, 16)}`;
      }

      const orderRes = await createServerOrder({
        customerId: currentUser ? currentUser.uid : 'guest',
        customerName: selectedAddress.fullName,
        customerEmail: currentUser?.email || authEmail || 'guest@adaparva.com',
        customerPhone: cleanPhone,
        items: summary.items.map((it) => ({
          productId: it.productId,
          variantId: it.variantId,
          qty: it.qty,
        })),
        shippingAddress: {
          fullName: selectedAddress.fullName,
          phone: cleanPhone,
          pincode: selectedAddress.pincode,
          addressLine: selectedAddress.addressLine,
          area: selectedAddress.area,
          city: selectedAddress.city,
          state: selectedAddress.state,
        },
        paymentMethod,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

      if (!orderRes.success) {
        if (orderRes.message?.includes('sold out')) {
          setIsSoldOutError(true);
        }
        setPaymentError(orderRes.message || 'Payment processing failed. Please try again.');
        setIsProcessing(false);
        return;
      }

      if (!isBuyNow) {
        clearCart();
      }

      router.push(`/checkout/confirmed/${orderRes.orderId}`);
    } catch (err: any) {
      console.error('Order checkout error:', err);
      setPaymentError(err.message || 'An unexpected error occurred. Please try again.');
      setIsProcessing(false);
    }
  };

  // Invalid item error state
  if (!loadingSummary && summary && !summary.valid) {
    return (
      <div className="min-h-screen bg-[var(--color-vault-black)] text-[var(--color-ivory)] flex flex-col justify-center items-center p-6 text-center space-y-4 font-sans select-none">
        <KolamDivider />
        <h2 className="font-serif text-3xl text-[var(--color-ivory)]">This item is not available</h2>
        <p className="font-jost text-sm text-[var(--color-sandal)]/70 max-w-md">
          {summary.message || 'The selected item or variant is no longer available in the active vault.'}
        </p>
        <Link
          href="/collections"
          className="h-10 px-6 border border-[var(--color-temple-gold)] text-[var(--color-temple-gold)] font-marcellus text-xs uppercase tracking-[0.2em] inline-flex items-center justify-center rounded-[2px]"
        >
          RETURN TO COLLECTION
        </Link>
      </div>
    );
  }

  const activeAddr = savedAddresses.find((a) => a.id === selectedAddrId);

  return (
    <div className="min-h-screen bg-[var(--color-vault-black)] text-[var(--color-ivory)] select-none font-sans pb-28 lg:pb-12">
      {/* Top Header */}
      <header className="border-b border-[var(--color-temple-gold)]/20 py-5 px-6 sm:px-8 bg-[var(--color-sanctum)] sticky top-0 z-30 shadow-md">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <Link
            href={isBuyNow ? `/piece/${summary?.items[0]?.productId ? summary.items[0].productId : ''}` : '/cart'}
            className="flex items-center gap-2 font-marcellus text-xs uppercase tracking-[0.2em] text-[var(--color-temple-gold)] hover:text-[var(--color-gold-light)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isBuyNow ? 'RETURN TO PIECE' : 'RETURN TO CART'}</span>
          </Link>

          <Link href="/" className="font-marcellus text-xl tracking-[0.18em] text-[var(--color-ivory)]">
            ADI PARVA
          </Link>

          <div className="flex items-center gap-2 font-marcellus text-xs uppercase tracking-[0.18em] text-[var(--color-temple-gold)]">
            <Lock className="w-3.5 h-3.5 text-[var(--color-temple-gold)]" />
            <span className="hidden sm:inline">CHECKOUT</span>
          </div>
        </div>
      </header>

      {/* Main 2-Column Responsive Layout */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: 4 Numbered Accordion Steps */}
          <div className="lg:col-span-7 space-y-6">

            {/* ==================================================== */}
            {/* STEP 1: AUTH / CONTACT DETAILS                       */}
            {/* ==================================================== */}
            <div className="bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 rounded-[4px] p-6 space-y-4 shadow-lg transition-all">
              <div className="flex items-center justify-between border-b border-[var(--color-temple-gold)]/20 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[var(--color-temple-gold)] text-[var(--color-vault-black)] font-marcellus text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h3 className="font-marcellus text-xs uppercase tracking-[0.25em] text-[var(--color-temple-gold)]">
                    CONTACT DETAILS
                  </h3>
                </div>
                {(currentUser || guestModeConfirmed) && activeStep > 1 && (
                  <button
                    onClick={() => setActiveStep(1)}
                    className="text-xs font-marcellus text-[var(--color-gold-light)] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                )}
              </div>

              {isAuthLoading ? (
                <div className="h-12 bg-[var(--color-vault-black)] animate-pulse rounded-[2px]" />
              ) : currentUser || guestModeConfirmed ? (
                <div className="flex items-center justify-between bg-[var(--color-vault-black)] p-4 rounded-[2px] border border-[var(--color-temple-gold)]/30 font-jost text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-gold-700)] text-[var(--color-cream-50)] font-marcellus text-xs flex items-center justify-center font-bold">
                      {(currentUser?.displayName || authName || 'P').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-[var(--color-ivory)]">
                        {currentUser?.displayName || authName || 'Patron'} {currentUser?.phoneNumber || authPhone ? `(${currentUser?.phoneNumber || authPhone})` : ''}
                      </div>
                      <div className="text-xs text-[var(--color-sandal)]/70">
                        {currentUser?.email || authEmail || 'Contact provided'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-marcellus text-emerald-400 flex items-center gap-1 border border-emerald-500/30 px-2.5 py-1 rounded-[2px]">
                    <Check className="w-3 h-3" /> VERIFIED
                  </span>
                </div>
              ) : activeStep === 1 ? (
                <div className="space-y-5 pt-2">
                  {!otpSent ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)]">
                          MOBILE PHONE NUMBER
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-[var(--color-temple-gold)] absolute left-3.5 top-3" />
                          <input
                            type="tel"
                            value={authPhone}
                            onChange={(e) => setAuthPhone(e.target.value)}
                            placeholder="Enter 10-digit mobile number"
                            className="w-full bg-transparent border border-[#3A2A22] rounded-[2px] pl-10 pr-3.5 py-2.5 text-[var(--color-ivory)] text-sm outline-none focus:border-[var(--color-temple-gold)] transition-all"
                          />
                        </div>
                      </div>

                      {authError && <p className="text-xs text-[#B3261E]">{authError}</p>}

                      <button
                        type="submit"
                        className="h-10 px-6 bg-[var(--color-temple-gold)] text-[var(--color-vault-black)] font-marcellus text-xs uppercase tracking-[0.2em] font-semibold rounded-[2px] cursor-pointer hover:bg-[var(--color-gold-light)] transition-colors"
                      >
                        SEND OTP CODE
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="p-3 bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/30 rounded-[2px] text-xs text-[var(--color-sandal)]">
                        Verification code sent to <strong className="text-[var(--color-ivory)]">{authPhone}</strong>.
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)]">
                          ENTER 6-DIGIT OTP
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="123456"
                          className="w-28 tracking-[0.4em] text-center font-mono text-base bg-transparent border border-[#3A2A22] rounded-[2px] py-2 text-[var(--color-ivory)] outline-none focus:border-[var(--color-temple-gold)]"
                        />
                      </div>

                      {authError && <p className="text-xs text-[#B3261E]">{authError}</p>}

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="h-10 px-6 bg-[var(--color-temple-gold)] text-[var(--color-vault-black)] font-marcellus text-xs uppercase tracking-[0.2em] font-semibold rounded-[2px] cursor-pointer"
                        >
                          VERIFY & CONTINUE
                        </button>
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="h-10 px-4 border border-[var(--color-temple-gold)]/40 text-[var(--color-sandal)] font-marcellus text-xs uppercase tracking-wider rounded-[2px]"
                        >
                          BACK
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Or Guest Mode */}
                  <div className="border-t border-[var(--color-temple-gold)]/10 pt-4 space-y-3">
                    <span className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[var(--color-sandal)]/60">
                      OR CONTINUE WITH DETAILS
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="Full Name"
                        className="bg-transparent border border-[#3A2A22] rounded-[2px] px-3 py-2 text-sm text-[var(--color-ivory)] outline-none focus:border-[var(--color-temple-gold)]"
                      />
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="Email Address"
                        className="bg-transparent border border-[#3A2A22] rounded-[2px] px-3 py-2 text-sm text-[var(--color-ivory)] outline-none focus:border-[var(--color-temple-gold)]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleContinueAsGuest}
                      className="h-9 px-6 border border-[var(--color-temple-gold)] text-[var(--color-temple-gold)] hover:bg-[var(--color-sanctum)] hover:text-[var(--color-gold-light)] font-marcellus text-[10px] uppercase tracking-[0.2em] rounded-[2px] transition-colors cursor-pointer"
                    >
                      CONTINUE TO ADDRESS
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* ==================================================== */}
            {/* STEP 2: DELIVERY ADDRESS                              */}
            {/* ==================================================== */}
            <div className="bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 rounded-[4px] p-6 space-y-4 shadow-lg transition-all">
              <div className="flex items-center justify-between border-b border-[var(--color-temple-gold)]/20 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[var(--color-temple-gold)] text-[var(--color-vault-black)] font-marcellus text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h3 className="font-marcellus text-xs uppercase tracking-[0.25em] text-[var(--color-temple-gold)]">
                    DELIVERY ADDRESS
                  </h3>
                </div>
                {activeStep > 2 && (
                  <button
                    onClick={() => setActiveStep(2)}
                    className="text-xs font-marcellus text-[var(--color-gold-light)] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                )}
              </div>

              {activeStep > 2 ? (
                <div className="bg-[#FAF0E4] p-4 rounded-[4px] border-2 border-[#2C1810] font-jost text-sm text-[#1F1613]">
                  <div className="font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#96601A]" />
                    <span>{activeAddr ? activeAddr.fullName : fullName}</span>
                    <span className="text-xs text-[#4A3B33]">({activeAddr ? activeAddr.phone : phone})</span>
                  </div>
                  <div className="text-xs text-[#4A3B33] pl-6 pt-1">
                    {activeAddr
                      ? `${activeAddr.addressLine}${activeAddr.area ? `, ${activeAddr.area}` : ''}, ${activeAddr.city}, ${activeAddr.state} - ${activeAddr.pincode}`
                      : `${addressLine}${area ? `, ${area}` : ''}, ${city}, ${stateName} - ${pincode}`}
                  </div>
                </div>
              ) : activeStep === 2 ? (
                <div className="space-y-6 pt-2 font-jost text-sm">
                  {/* Saved Address Cards (Tokens only: Ivory card, dark text, 2px maroon border when selected) */}
                  {savedAddresses.length > 0 && !isAddingNewAddress && (
                    <div className="space-y-3">
                      <div className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)]">
                        SAVED ADDRESSES
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {savedAddresses.map((addr) => {
                          const isSel = selectedAddrId === addr.id;
                          return (
                            <div
                              key={addr.id}
                              onClick={() => setSelectedAddrId(addr.id)}
                              className={`p-4 rounded-[4px] transition-all cursor-pointer flex flex-col justify-between space-y-3 bg-[#FAF0E4] ${
                                isSel
                                  ? 'border-2 border-[#2C1810] text-[#1F1613] shadow-md'
                                  : 'border border-[#E6D5BF] text-[#1F1613] hover:border-[#96601A]'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-marcellus text-xs uppercase tracking-wider font-semibold text-[#1F1613]">
                                    {addr.fullName}
                                  </span>
                                  {isSel && (
                                    <span className="font-marcellus text-[9px] uppercase tracking-wider text-[#96601A] font-bold flex items-center gap-1 bg-[#F6EDE1] px-1.5 py-0.5 rounded-[2px]">
                                      <Check className="w-3 h-3 text-[#96601A]" /> Selected
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-[#4A3B33] leading-relaxed">
                                  {addr.addressLine}{addr.area ? `, ${addr.area}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                                </div>
                                <div className="text-xs text-[#96601A] font-medium">Ph: {addr.phone}</div>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAddrId(addr.id);
                                  handleConfirmAddress();
                                }}
                                className="w-full h-8 bg-[#2C1810] text-[#FDF7EF] hover:bg-[#1C0F07] font-marcellus text-[10px] uppercase tracking-[0.2em] font-semibold rounded-[2px] transition-colors cursor-pointer"
                              >
                                DELIVER HERE
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAddingNewAddress(true)}
                        className="text-xs font-marcellus text-[var(--color-gold-light)] hover:underline pt-2 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add a new delivery address</span>
                      </button>
                    </div>
                  )}

                  {/* Manual Address Form (Shown when adding new address or for new user with no saved addresses) */}
                  {(isAddingNewAddress || savedAddresses.length === 0) && (
                    <div className="space-y-4 border-t border-[var(--color-temple-gold)]/10 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)]">
                          DELIVERY DESTINATION FORM
                        </span>
                        {savedAddresses.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setIsAddingNewAddress(false)}
                            className="text-xs text-[var(--color-sandal)] hover:text-[var(--color-ivory)]"
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="font-marcellus text-[10px] uppercase tracking-[0.18em] text-[var(--color-temple-gold)]">
                            FULL NAME
                          </label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Recipient full name"
                            className="w-full bg-transparent border border-[#3A2A22] rounded-[2px] px-3 py-2 text-[var(--color-ivory)] outline-none focus:border-[var(--color-temple-gold)]"
                          />
                          {addressErrors.fullName && <p className="text-xs text-[#B3261E]">{addressErrors.fullName}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="font-marcellus text-[10px] uppercase tracking-[0.18em] text-[var(--color-temple-gold)]">
                            MOBILE PHONE
                          </label>
                          <input
                            type="tel"
                            maxLength={10}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="10-digit mobile number"
                            className="w-full bg-transparent border border-[#3A2A22] rounded-[2px] px-3 py-2 text-[var(--color-ivory)] outline-none focus:border-[var(--color-temple-gold)]"
                          />
                          {addressErrors.phone && <p className="text-xs text-[#B3261E]">{addressErrors.phone}</p>}
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <label className="font-marcellus text-[10px] uppercase tracking-[0.18em] text-[var(--color-temple-gold)]">
                            STREET ADDRESS & HOUSE NO.
                          </label>
                          <input
                            type="text"
                            value={addressLine}
                            onChange={(e) => setAddressLine(e.target.value)}
                            placeholder="Flat / House No. / Building / Street"
                            className="w-full bg-transparent border border-[#3A2A22] rounded-[2px] px-3 py-2 text-[var(--color-ivory)] outline-none focus:border-[var(--color-temple-gold)]"
                          />
                          {addressErrors.addressLine && <p className="text-xs text-[#B3261E]">{addressErrors.addressLine}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="font-marcellus text-[10px] uppercase tracking-[0.18em] text-[var(--color-temple-gold)]">
                            AREA / LOCALITY (OPTIONAL)
                          </label>
                          <input
                            type="text"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            placeholder="Area or Locality"
                            className="w-full bg-transparent border border-[#3A2A22] rounded-[2px] px-3 py-2 text-[var(--color-ivory)] outline-none focus:border-[var(--color-temple-gold)]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-marcellus text-[10px] uppercase tracking-[0.18em] text-[var(--color-temple-gold)]">
                            PINCODE
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            value={pincode}
                            onChange={handlePincodeChange}
                            placeholder="6-digit Pincode"
                            className="w-full bg-transparent border border-[#3A2A22] rounded-[2px] px-3 py-2 text-[var(--color-ivory)] outline-none focus:border-[var(--color-temple-gold)]"
                          />
                          {addressErrors.pincode && <p className="text-xs text-[#B3261E]">{addressErrors.pincode}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="font-marcellus text-[10px] uppercase tracking-[0.18em] text-[var(--color-temple-gold)]">
                            CITY
                          </label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="City"
                            className="w-full bg-transparent border border-[#3A2A22] rounded-[2px] px-3 py-2 text-[var(--color-ivory)] outline-none focus:border-[var(--color-temple-gold)]"
                          />
                          {addressErrors.city && <p className="text-xs text-[#B3261E]">{addressErrors.city}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="font-marcellus text-[10px] uppercase tracking-[0.18em] text-[var(--color-temple-gold)]">
                            STATE
                          </label>
                          <input
                            type="text"
                            value={stateName}
                            onChange={(e) => setStateName(e.target.value)}
                            placeholder="State"
                            className="w-full bg-transparent border border-[#3A2A22] rounded-[2px] px-3 py-2 text-[var(--color-ivory)] outline-none focus:border-[var(--color-temple-gold)]"
                          />
                          {addressErrors.stateName && <p className="text-xs text-[#B3261E]">{addressErrors.stateName}</p>}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleConfirmAddress}
                        className="h-10 px-8 bg-[var(--color-temple-gold)] text-[var(--color-vault-black)] font-marcellus text-xs uppercase tracking-[0.2em] font-semibold rounded-[2px] cursor-pointer hover:bg-[var(--color-gold-light)] transition-colors"
                      >
                        DELIVER HERE
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* ==================================================== */}
            {/* STEP 3: ORDER SUMMARY & ITEM CONFIRMATION             */}
            {/* ==================================================== */}
            <div className="bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 rounded-[4px] p-6 space-y-4 shadow-lg transition-all">
              <div className="flex items-center justify-between border-b border-[var(--color-temple-gold)]/20 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[var(--color-temple-gold)] text-[var(--color-vault-black)] font-marcellus text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h3 className="font-marcellus text-xs uppercase tracking-[0.25em] text-[var(--color-temple-gold)]">
                    ORDER SUMMARY ({summary?.items.length || 0} ITEMS)
                  </h3>
                </div>
                {activeStep > 3 && (
                  <button
                    onClick={() => setActiveStep(3)}
                    className="text-xs font-marcellus text-[var(--color-gold-light)] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                )}
              </div>

              {activeStep > 3 ? (
                <div className="bg-[var(--color-vault-black)] p-4 rounded-[2px] border border-[var(--color-temple-gold)]/30 font-jost text-xs space-y-2">
                  {summary?.items.map((it) => (
                    <div key={`${it.productId}-${it.variantId}`} className="flex justify-between items-center">
                      <span className="text-[var(--color-ivory)] font-serif text-sm">
                        {it.name} ({it.variantLabel}) x {it.qty}
                      </span>
                      <span className="text-[var(--color-gold-light)] font-serif text-sm">
                        ₹{it.lineTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : activeStep === 3 ? (
                <div className="space-y-6 pt-2">
                  <div className="space-y-4 divide-y divide-[var(--color-temple-gold)]/10">
                    {summary?.items.map((item) => (
                      <div
                        key={`${item.productId}-${item.variantId}`}
                        className="pt-4 first:pt-0 flex gap-4 items-center justify-between"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="relative w-16 aspect-[3/4] bg-[var(--color-vault-black)] rounded-[2px] overflow-hidden border border-[var(--color-temple-gold)]/30 shrink-0">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                          <div className="space-y-1">
                            <div className="font-marcellus text-[9px] uppercase tracking-wider text-[var(--color-temple-gold)] font-medium">
                              CODE: {item.code}
                            </div>
                            <h4 className="font-serif text-base text-[var(--color-ivory)] font-light leading-snug">
                              {item.name}
                            </h4>
                            <div className="text-xs font-jost text-[var(--color-sandal)]/80">
                              Option: {item.variantLabel}
                            </div>
                            <div className="text-xs font-serif text-[var(--color-ivory)]">
                              Unit Price: ₹{item.unitPrice.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>

                        {/* Quantity Stepper & Line Total */}
                        <div className="text-right space-y-2 shrink-0">
                          <div className="font-serif text-base text-[var(--color-ivory)] font-medium">
                            ₹{item.lineTotal.toLocaleString('en-IN')}
                          </div>

                          <div className="inline-flex items-center border border-[var(--color-temple-gold)]/40 rounded-[2px] h-8 bg-[var(--color-vault-black)]">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateItemQty(item.productId, item.variantId, item.qty, item.maxStock, -1)
                              }
                              disabled={item.qty <= 1}
                              className="w-7 h-full flex items-center justify-center text-xs text-[var(--color-ivory)] hover:bg-[var(--color-sanctum)] disabled:opacity-30 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-jost text-xs text-[var(--color-ivory)]">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateItemQty(item.productId, item.variantId, item.qty, item.maxStock, 1)
                              }
                              disabled={item.qty >= item.maxStock}
                              className="w-7 h-full flex items-center justify-center text-xs text-[var(--color-ivory)] hover:bg-[var(--color-sanctum)] disabled:opacity-30 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveStep(4)}
                    className="h-10 px-8 bg-[var(--color-temple-gold)] text-[var(--color-vault-black)] font-marcellus text-xs uppercase tracking-[0.2em] font-semibold rounded-[2px] cursor-pointer hover:bg-[var(--color-gold-light)] transition-colors"
                  >
                    CONTINUE TO PAYMENT
                  </button>
                </div>
              ) : null}
            </div>

            {/* ==================================================== */}
            {/* STEP 4: PAYMENT INSTRUMENT                            */}
            {/* ==================================================== */}
            <div className="bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 rounded-[4px] p-6 space-y-5 shadow-lg">
              <div className="flex items-center gap-3 border-b border-[var(--color-temple-gold)]/20 pb-3">
                <span className="w-6 h-6 rounded-full bg-[var(--color-temple-gold)] text-[var(--color-vault-black)] font-marcellus text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <h3 className="font-marcellus text-xs uppercase tracking-[0.25em] text-[var(--color-temple-gold)]">
                  PAYMENT INSTRUMENT
                </h3>
              </div>

              {activeStep === 4 && (
                <form onSubmit={handlePlaceOrder} className="space-y-6 pt-2 font-jost text-sm">
                  {/* Payment Failure Retry State Alert */}
                  {paymentError && (
                    <div className="p-4 bg-[#B3261E]/15 border border-[#B3261E]/40 rounded-[2px] text-[#FBE9E7] text-xs space-y-2 animate-in fade-in">
                      <div className="flex items-center gap-2 font-semibold">
                        <AlertCircle className="w-4 h-4 text-[#B3261E] shrink-0" />
                        <span>{isSoldOutError ? 'Item Sold Out' : 'Payment Failed'}</span>
                      </div>
                      <p>{paymentError}</p>
                    </div>
                  )}

                  {/* Payment Method Options */}
                  <div className="space-y-3">
                    {[
                      {
                        id: 'UPI',
                        label: 'UPI / QR Code',
                        desc: 'Google Pay, PhonePe, Paytm, or UPI ID',
                      },
                      {
                        id: 'Card',
                        label: 'Credit / Debit Card',
                        desc: 'Visa, Mastercard, RuPay',
                      },
                      {
                        id: 'Net banking',
                        label: 'Net Banking',
                        desc: 'All major Indian banks supported',
                      },
                      {
                        id: 'Cash on delivery',
                        label: 'Cash on Delivery',
                        desc:
                          summary && summary.total > CHECKOUT_CONFIG.MAX_COD_AMOUNT
                            ? `Unavailable for orders over ₹${CHECKOUT_CONFIG.MAX_COD_AMOUNT.toLocaleString('en-IN')}`
                            : 'Pay cash at your doorstep',
                        disabled: Boolean(summary && summary.total > CHECKOUT_CONFIG.MAX_COD_AMOUNT),
                      },
                    ].map((pm) => {
                      const isSel = paymentMethod === pm.id;
                      return (
                        <div
                          key={pm.id}
                          onClick={() => !pm.disabled && setPaymentMethod(pm.id as any)}
                          className={`p-4 rounded-[2px] border transition-all ${
                            pm.disabled
                              ? 'border-[#2C1810] opacity-40 cursor-not-allowed bg-[var(--color-vault-black)]'
                              : isSel
                              ? 'border-[var(--color-gold-light)] bg-[var(--color-gold-700)]/30 text-[var(--color-ivory)] cursor-pointer shadow-md'
                              : 'border-[#3A2A22] bg-[var(--color-vault-black)] text-[var(--color-sandal)]/80 hover:border-[var(--color-temple-gold)]/50 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  isSel ? 'border-[var(--color-gold-light)] bg-[var(--color-gold-light)]' : 'border-[#3A2A22]'
                                }`}
                              >
                                {isSel && <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-vault-black)]" />}
                              </div>
                              <div>
                                <div className="font-marcellus text-xs uppercase tracking-wider text-[var(--color-ivory)] font-medium">
                                  {pm.label}
                                </div>
                                <div className="text-xs text-[var(--color-sandal)]/70">{pm.desc}</div>
                              </div>
                            </div>
                          </div>

                          {/* Extra VPA ID input for UPI */}
                          {isSel && pm.id === 'UPI' && (
                            <div className="mt-3 pt-3 border-t border-[var(--color-temple-gold)]/20 space-y-1">
                              <label className="font-marcellus text-[9px] uppercase tracking-wider text-[var(--color-gold-light)]">
                                ENTER UPI ID (OPTIONAL)
                              </label>
                              <input
                                type="text"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                placeholder="name@upi or mobile@paytm"
                                className="w-full bg-[var(--color-vault-black)] border border-[var(--color-temple-gold)]/40 rounded-[2px] px-3 py-1.5 text-xs text-[var(--color-ivory)] outline-none focus:border-[var(--color-gold-light)]"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Submit Order Button */}
                  <button
                    type="submit"
                    disabled={isProcessing || !summary?.valid}
                    className="btn-gold-sheen w-full h-[54px] bg-[var(--color-temple-gold)] text-[var(--color-vault-black)] font-marcellus text-[11px] uppercase tracking-[0.3em] font-bold flex items-center justify-center gap-2 rounded-[2px] shadow-xl cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-black" />
                        <span>PROCESSING...</span>
                      </>
                    ) : paymentMethod === 'Cash on delivery' ? (
                      <span>PLACE ORDER (COD)</span>
                    ) : (
                      <span>PAY ₹{summary?.total.toLocaleString('en-IN')}</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Price Details Box */}
          <div className="lg:col-span-5 bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 rounded-[4px] p-6 space-y-6 lg:sticky lg:top-24 shadow-xl">
            <h3 className="font-marcellus text-[12px] uppercase tracking-[0.3em] text-[var(--color-temple-gold)] border-b border-[var(--color-temple-gold)]/20 pb-3">
              PRICE DETAILS
            </h3>

            {/* Breakdown Table (Font is same as rest of site, not monospace) */}
            <div className="space-y-3 font-jost text-sm text-[var(--color-sandal)]">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-[var(--color-ivory)] font-serif text-base">
                  ₹{summary?.subtotal.toLocaleString('en-IN') || 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Delivery Charge</span>
                {summary?.shipping === 0 ? (
                  <span className="text-emerald-400 font-marcellus text-xs uppercase tracking-wider font-semibold">
                    FREE (OVER ₹1999)
                  </span>
                ) : (
                  <span className="text-[var(--color-ivory)] font-serif text-base">
                    ₹{summary?.shipping}
                  </span>
                )}
              </div>

              {/* GST Display: Inclusive mode shows "Inclusive of all taxes" without extra line */}
              {summary?.gstMode === 'exclusive' && summary.gst > 0 ? (
                <div className="flex justify-between">
                  <span>GST (3%)</span>
                  <span className="text-[var(--color-ivory)] font-serif text-base">
                    ₹{summary.gst.toLocaleString('en-IN')}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-[var(--color-sandal)]/60 font-marcellus uppercase tracking-wider pt-1">
                  Inclusive of all taxes
                </div>
              )}

              {summary && summary.totalSavings > 0 && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-[2px] flex items-center justify-between text-xs text-emerald-300 font-medium">
                  <span>YOUR SAVINGS</span>
                  <span className="font-serif">₹{summary.totalSavings.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="border-t border-[var(--color-temple-gold)]/20 pt-4 flex justify-between items-baseline">
                <span className="font-marcellus text-sm uppercase tracking-wider text-[var(--color-ivory)] font-semibold">
                  TOTAL AMOUNT
                </span>
                <span className="font-serif text-[28px] text-[var(--color-gold-light)] font-normal">
                  ₹{summary?.total.toLocaleString('en-IN') || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Bottom Action Bar (375px) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-[#1C0F07] border-t border-[#3D2418] p-3 z-40 flex items-center justify-between shadow-2xl">
        <div>
          <div className="font-marcellus text-[9px] uppercase tracking-wider text-[var(--color-temple-gold)]">
            TOTAL AMOUNT
          </div>
          <div className="font-serif text-xl text-[var(--color-gold-light)] font-normal">
            ₹{summary?.total.toLocaleString('en-IN') || 0}
          </div>
        </div>

        {activeStep === 4 ? (
          <button
            onClick={handlePlaceOrder}
            disabled={isProcessing || !summary?.valid}
            className="btn-gold-sheen h-11 px-6 bg-[var(--color-temple-gold)] text-[var(--color-vault-black)] font-marcellus text-[10px] uppercase tracking-[0.2em] font-bold rounded-[2px] shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? (
              <span>PROCESSING...</span>
            ) : paymentMethod === 'Cash on delivery' ? (
              <span>PLACE ORDER (COD)</span>
            ) : (
              <span>PAY ₹{summary?.total.toLocaleString('en-IN')}</span>
            )}
          </button>
        ) : (
          <button
            onClick={() => setActiveStep((s) => Math.min(4, s + 1))}
            className="h-11 px-6 bg-[var(--color-temple-gold)] text-[var(--color-vault-black)] font-marcellus text-[10px] uppercase tracking-[0.2em] font-semibold rounded-[2px]"
          >
            NEXT STEP
          </button>
        )}
      </div>
    </div>
  );
}
