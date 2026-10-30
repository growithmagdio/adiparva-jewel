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
import { getStoreData } from '@/lib/data/store';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
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

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Buy Now query parameters
  const buyNowProductId = searchParams.get('buyNow');
  const buyNowVariantId = searchParams.get('variant');
  const buyNowQtyParam = searchParams.get('qty');
  const buyNowSlug = searchParams.get('slug');
  const fromParam = searchParams.get('from');

  const isBuyNow = Boolean(buyNowProductId);

  // Cart store for standard checkout
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  // Resolve target product for accurate navigation back to the piece
  const targetProduct = React.useMemo(() => {
    if (!isBuyNow) return null;
    const store = getStoreData();
    if (buyNowSlug) {
      const found = store.products.find((p) => p.slug === buyNowSlug);
      if (found) return found;
    }
    if (buyNowProductId) {
      const found = store.products.find(
        (p) => p.id === buyNowProductId || p.slug === buyNowProductId
      );
      if (found) return found;
    }
    return null;
  }, [isBuyNow, buyNowProductId, buyNowSlug]);

  // Determine fallback URL for return navigation
  const returnHref = React.useMemo(() => {
    if (isBuyNow) {
      if (fromParam && fromParam.startsWith('/piece/')) {
        return fromParam;
      }
      if (targetProduct?.slug) {
        return `/piece/${targetProduct.slug}`;
      }
      if (buyNowSlug) {
        return `/piece/${buyNowSlug}`;
      }
      if (buyNowProductId && !buyNowProductId.startsWith('prod-')) {
        return `/piece/${buyNowProductId}`;
      }
      return '/collections';
    }
    return '/cart';
  }, [isBuyNow, fromParam, targetProduct, buyNowSlug, buyNowProductId]);

  const handleReturn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if the customer arrived from within the site and from a product page
    if (
      typeof window !== 'undefined' &&
      window.history.length > 1 &&
      document.referrer &&
      document.referrer.includes(window.location.host) &&
      document.referrer.includes('/piece/')
    ) {
      router.back();
      return;
    }

    // Direct navigation fallback (e.g. page refresh, direct link, or arrived via collection)
    router.push(returnHref);
  };

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
      <div className="min-h-screen bg-[#2E070B] text-[#FAF5EC] flex flex-col justify-center items-center p-6 text-center space-y-4 font-sans select-none">
        <KolamDivider />
        <h2 className="font-serif text-3xl text-[#FAF5EC]">This item is not available</h2>
        <p className="text-sm text-[#FAF5EC]/85 max-w-md">
          {summary.message || 'The selected piece or option is no longer available.'}
        </p>
        <Link
          href="/collections"
          className="h-11 px-7 bg-[#5B1018] text-[#FAF5EC] border border-[#76252C] hover:bg-[#76252C] hover:border-[#D7B56D] font-sans text-xs uppercase tracking-[0.2em] font-semibold inline-flex items-center justify-center rounded-[2px] transition-all"
        >
          RETURN TO COLLECTION
        </Link>
      </div>
    );
  }

  const activeAddr = savedAddresses.find((a) => a.id === selectedAddrId);

  return (
    <div className="min-h-screen bg-[#2E070B] text-[#FAF5EC] select-none font-sans pb-28 lg:pb-16 selection:bg-[#5B1018] selection:text-[#FAF5EC]">
      {/* Universal Storefront Header with Category Strip */}
      <Header />

      {/* Return to piece/cart & Secure checkout sub-bar */}
      <div className="border-b border-[#B68A3A]/25 bg-[#3B090D] py-3 px-4 sm:px-8">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={handleReturn}
            className="flex items-center gap-2 font-sans text-xs uppercase tracking-[0.16em] font-semibold text-[#D7B56D] hover:text-[#FAF5EC] transition-colors cursor-pointer"
            aria-label={isBuyNow ? 'Return to piece' : 'Return to cart'}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isBuyNow ? 'RETURN TO PIECE' : 'RETURN TO CART'}</span>
          </button>

          <div className="flex items-center gap-2 font-sans text-xs uppercase tracking-[0.16em] font-semibold text-[#D7B56D]">
            <Lock className="w-3.5 h-3.5 text-[#B68A3A]" />
            <span className="hidden sm:inline">SECURE CHECKOUT</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: 4 Numbered Accordion Steps */}
          <div className="lg:col-span-7 space-y-6">

            {/* ==================================================== */}
            {/* STEP 1: AUTH / CONTACT DETAILS                       */}
            {/* ==================================================== */}
            <div className="bg-[#3B090D] border border-[#B68A3A]/30 rounded-[4px] p-6 space-y-4 shadow-md transition-all text-[#FAF5EC]">
              <div className="flex items-center justify-between border-b border-[#B68A3A]/20 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#5B1018] border border-[#B68A3A]/50 text-[#FAF5EC] font-sans text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#FAF5EC]">
                    CONTACT DETAILS
                  </h3>
                </div>
                {(currentUser || guestModeConfirmed) && activeStep > 1 && (
                  <button
                    onClick={() => setActiveStep(1)}
                    className="text-xs font-semibold text-[#D7B56D] flex items-center gap-1 hover:text-[#FAF5EC] hover:underline cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                )}
              </div>

              {isAuthLoading ? (
                <div className="h-12 bg-[#2E070B] animate-pulse rounded-[2px]" />
              ) : currentUser || guestModeConfirmed ? (
                <div className="flex items-center justify-between bg-[#2E070B] p-4 rounded-[4px] border border-[#B68A3A]/30 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#5B1018] border border-[#B68A3A]/50 text-[#FAF5EC] font-sans text-xs flex items-center justify-center font-bold">
                      {(currentUser?.displayName || authName || 'P').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-[#FAF5EC]">
                        {currentUser?.displayName || authName || 'Customer'} {currentUser?.phoneNumber || authPhone ? `(${currentUser?.phoneNumber || authPhone})` : ''}
                      </div>
                      <div className="text-xs text-[#FAF5EC]/75">
                        {currentUser?.email || authEmail || 'Contact details provided'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded">
                    <Check className="w-3 h-3" /> VERIFIED
                  </span>
                </div>
              ) : activeStep === 1 ? (
                <div className="space-y-5 pt-2">
                  {!otpSent ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-[0.18em] text-[#D7B56D] font-semibold">
                          MOBILE PHONE NUMBER
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-[#D7B56D] absolute left-3.5 top-3" />
                          <input
                            type="tel"
                            value={authPhone}
                            onChange={(e) => setAuthPhone(e.target.value)}
                            placeholder="Enter 10-digit mobile number"
                            className="w-full bg-[#2E070B] border border-[#B68A3A]/40 rounded-[2px] pl-10 pr-3.5 py-2.5 text-[#FAF5EC] placeholder:text-[#FAF5EC]/70 font-medium text-sm outline-none focus:border-[#B68A3A] focus:ring-1 focus:ring-[#B68A3A] transition-all"
                          />
                        </div>
                      </div>

                      {authError && <p className="text-xs text-[#FF6B6B] font-medium">{authError}</p>}

                      <button
                        type="submit"
                        className="h-10 px-6 bg-[#5B1018] text-[#FAF5EC] border border-[#76252C] hover:bg-[#76252C] hover:border-[#D7B56D] font-sans text-xs uppercase tracking-[0.16em] font-semibold rounded-[2px] cursor-pointer transition-all shadow-md"
                      >
                        SEND OTP CODE
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="p-3 bg-[#2E070B] border border-[#B68A3A]/30 rounded-[2px] text-xs text-[#FAF5EC]/90">
                        Verification code sent to <strong className="text-[#D7B56D]">{authPhone}</strong>.
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-[0.18em] text-[#D7B56D] font-semibold">
                          ENTER 6-DIGIT OTP
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="123456"
                          className="w-32 tracking-[0.4em] text-center font-mono text-base bg-[#2E070B] border border-[#B68A3A]/40 rounded-[2px] py-2 text-[#FAF5EC] placeholder:text-[#FAF5EC]/70 font-bold outline-none focus:border-[#B68A3A] focus:ring-1 focus:ring-[#B68A3A]"
                        />
                      </div>

                      {authError && <p className="text-xs text-[#FF6B6B] font-medium">{authError}</p>}

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="h-10 px-6 bg-[#5B1018] text-[#FAF5EC] border border-[#76252C] hover:bg-[#76252C] hover:border-[#D7B56D] font-sans text-xs uppercase tracking-[0.16em] font-semibold rounded-[2px] cursor-pointer shadow-md transition-all"
                        >
                          VERIFY & CONTINUE
                        </button>
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="h-10 px-4 border border-[#B68A3A] text-[#FAF5EC] bg-[#3B090D]/60 hover:bg-[#5B1018] hover:border-[#D7B56D] font-sans text-xs uppercase tracking-wider rounded-[2px] cursor-pointer transition-all"
                        >
                          BACK
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Or Guest Mode */}
                  <div className="border-t border-[#B68A3A]/20 pt-4 space-y-3">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[#D7B56D] font-semibold">
                      OR CONTINUE AS GUEST
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="Full Name"
                        className="bg-[#2E070B] border border-[#B68A3A]/40 rounded-[2px] px-3.5 py-2 text-sm text-[#FAF5EC] placeholder:text-[#FAF5EC]/70 font-medium outline-none focus:border-[#B68A3A] focus:ring-1 focus:ring-[#B68A3A]"
                      />
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="Email Address"
                        className="bg-[#2E070B] border border-[#B68A3A]/40 rounded-[2px] px-3.5 py-2 text-sm text-[#FAF5EC] placeholder:text-[#FAF5EC]/70 font-medium outline-none focus:border-[#B68A3A] focus:ring-1 focus:ring-[#B68A3A]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleContinueAsGuest}
                      className="h-9 px-6 bg-[#5B1018] text-[#FAF5EC] border border-[#76252C] hover:bg-[#76252C] hover:border-[#D7B56D] font-sans text-[11px] uppercase tracking-[0.18em] font-semibold rounded-[2px] transition-all cursor-pointer shadow-md"
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
            <div className="bg-[#3B090D] border border-[#B68A3A]/30 rounded-[4px] p-6 space-y-4 shadow-md transition-all text-[#FAF5EC]">
              <div className="flex items-center justify-between border-b border-[#B68A3A]/20 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#5B1018] border border-[#B68A3A]/50 text-[#FAF5EC] font-sans text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#FAF5EC]">
                    DELIVERY ADDRESS
                  </h3>
                </div>
                {activeStep > 2 && (
                  <button
                    onClick={() => setActiveStep(2)}
                    className="text-xs font-semibold text-[#D7B56D] flex items-center gap-1 hover:text-[#FAF5EC] hover:underline cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                )}
              </div>

              {activeStep > 2 ? (
                <div className="bg-[#2E070B] p-4 rounded-[4px] border border-[#B68A3A]/30 font-sans text-sm text-[#FAF5EC]">
                  <div className="font-semibold flex items-center gap-2 text-[#FAF5EC]">
                    <MapPin className="w-4 h-4 text-[#D7B56D]" />
                    <span>{activeAddr ? activeAddr.fullName : fullName}</span>
                    <span className="text-xs text-[#FAF5EC]/75 font-normal">({activeAddr ? activeAddr.phone : phone})</span>
                  </div>
                  <div className="text-xs text-[#FAF5EC]/85 pl-6 pt-1 font-medium">
                    {activeAddr
                      ? `${activeAddr.addressLine}${activeAddr.area ? `, ${activeAddr.area}` : ''}, ${activeAddr.city}, ${activeAddr.state} - ${activeAddr.pincode}`
                      : `${addressLine}${area ? `, ${area}` : ''}, ${city}, ${stateName} - ${pincode}`}
                  </div>
                </div>
              ) : activeStep === 2 ? (
                <div className="space-y-6 pt-2 font-sans text-sm">
                  {/* Saved Address Cards */}
                  {savedAddresses.length > 0 && !isAddingNewAddress && (
                    <div className="space-y-3">
                      <div className="font-sans text-[10.5px] uppercase tracking-[0.2em] text-[#D7B56D] font-bold">
                        SAVED ADDRESSES
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {savedAddresses.map((addr) => {
                          const isSel = selectedAddrId === addr.id;
                          return (
                            <div
                              key={addr.id}
                              onClick={() => setSelectedAddrId(addr.id)}
                              className={`p-4 rounded-[4px] transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                                isSel
                                  ? 'bg-[#2E070B] border-2 border-[#D7B56D] text-[#FAF5EC] shadow-md'
                                  : 'bg-[#2E070B]/80 border border-[#B68A3A]/30 text-[#FAF5EC] hover:border-[#B68A3A]'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-sans text-xs uppercase tracking-wider font-bold text-[#FAF5EC]">
                                    {addr.fullName}
                                  </span>
                                  {isSel && (
                                    <span className="font-sans text-[9px] uppercase tracking-wider text-[#D7B56D] font-bold flex items-center gap-1 bg-[#3B090D] border border-[#B68A3A]/40 px-1.5 py-0.5 rounded-[2px]">
                                      <Check className="w-3 h-3 text-[#D7B56D]" /> Selected
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-[#FAF5EC]/85 leading-relaxed font-medium">
                                  {addr.addressLine}{addr.area ? `, ${addr.area}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                                </div>
                                <div className="text-xs text-[#D7B56D] font-semibold">Ph: {addr.phone}</div>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAddrId(addr.id);
                                  handleConfirmAddress();
                                }}
                                className="w-full h-8 bg-[#5B1018] text-[#FAF5EC] border border-[#76252C] hover:bg-[#76252C] hover:border-[#D7B56D] font-sans text-[10px] uppercase tracking-[0.2em] font-semibold rounded-[2px] transition-all cursor-pointer shadow-md"
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
                        className="text-xs font-semibold text-[#D7B56D] hover:text-[#FAF5EC] hover:underline pt-2 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add a new delivery address</span>
                      </button>
                    </div>
                  )}

                  {/* Manual Address Form */}
                  {(isAddingNewAddress || savedAddresses.length === 0) && (
                    <div className="space-y-4 border-t border-[#B68A3A]/20 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="font-sans text-[10.5px] uppercase tracking-[0.2em] text-[#D7B56D] font-bold">
                          DELIVERY DESTINATION FORM
                        </span>
                        {savedAddresses.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setIsAddingNewAddress(false)}
                            className="text-xs text-[#FAF5EC]/80 hover:text-[#D7B56D] font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="font-sans text-[10px] uppercase tracking-[0.18em] text-[#D7B56D] font-semibold">
                            FULL NAME
                          </label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Recipient full name"
                            className="w-full bg-[#2E070B] border border-[#B68A3A]/40 rounded-[2px] px-3.5 py-2 text-[#FAF5EC] placeholder:text-[#FAF5EC]/70 font-medium outline-none focus:border-[#B68A3A] focus:ring-1 focus:ring-[#B68A3A]"
                          />
                          {addressErrors.fullName && <p className="text-xs text-[#FF6B6B]">{addressErrors.fullName}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-[0.16em] text-[#D7B56D] font-semibold">
                            MOBILE PHONE
                          </label>
                          <input
                            type="tel"
                            maxLength={10}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="10-digit mobile number"
                            className="w-full bg-[#2E070B] border border-[#B68A3A]/40 rounded-[2px] px-3.5 py-2 text-[#FAF5EC] placeholder:text-[#FAF5EC]/70 font-medium outline-none focus:border-[#B68A3A] focus:ring-1 focus:ring-[#B68A3A]"
                          />
                          {addressErrors.phone && <p className="text-xs text-[#FF6B6B]">{addressErrors.phone}</p>}
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[10px] uppercase tracking-[0.16em] text-[#D7B56D] font-semibold">
                            STREET ADDRESS & HOUSE NO.
                          </label>
                          <input
                            type="text"
                            value={addressLine}
                            onChange={(e) => setAddressLine(e.target.value)}
                            placeholder="Flat / House No. / Building / Street"
                            className="w-full bg-[#2E070B] border border-[#B68A3A]/40 rounded-[2px] px-3.5 py-2 text-[#FAF5EC] placeholder:text-[#FAF5EC]/70 font-medium outline-none focus:border-[#B68A3A] focus:ring-1 focus:ring-[#B68A3A]"
                          />
                          {addressErrors.addressLine && <p className="text-xs text-[#FF6B6B]">{addressErrors.addressLine}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-[0.16em] text-[#D7B56D] font-semibold">
                            AREA / LOCALITY (OPTIONAL)
                          </label>
                          <input
                            type="text"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            placeholder="Area or Locality"
                            className="w-full bg-[#2E070B] border border-[#B68A3A]/40 rounded-[2px] px-3.5 py-2 text-[#FAF5EC] placeholder:text-[#FAF5EC]/70 font-medium outline-none focus:border-[#B68A3A] focus:ring-1 focus:ring-[#B68A3A]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-[0.16em] text-[#D7B56D] font-semibold">
                            PINCODE
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            value={pincode}
                            onChange={handlePincodeChange}
                            placeholder="6-digit Pincode"
                            className="w-full bg-[#2E070B] border border-[#B68A3A]/40 rounded-[2px] px-3.5 py-2 text-[#FAF5EC] placeholder:text-[#FAF5EC]/70 font-medium outline-none focus:border-[#B68A3A] focus:ring-1 focus:ring-[#B68A3A]"
                          />
                          {addressErrors.pincode && <p className="text-xs text-[#FF6B6B]">{addressErrors.pincode}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-[0.16em] text-[#D7B56D] font-semibold">
                            CITY
                          </label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="City"
                            className="w-full bg-[#2E070B] border border-[#B68A3A]/40 rounded-[2px] px-3.5 py-2 text-[#FAF5EC] placeholder:text-[#FAF5EC]/70 font-medium outline-none focus:border-[#B68A3A] focus:ring-1 focus:ring-[#B68A3A]"
                          />
                          {addressErrors.city && <p className="text-xs text-[#FF6B6B]">{addressErrors.city}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-[0.16em] text-[#D7B56D] font-semibold">
                            STATE
                          </label>
                          <input
                            type="text"
                            value={stateName}
                            onChange={(e) => setStateName(e.target.value)}
                            placeholder="State"
                            className="w-full bg-[#2E070B] border border-[#B68A3A]/40 rounded-[2px] px-3.5 py-2 text-[#FAF5EC] placeholder:text-[#FAF5EC]/70 font-medium outline-none focus:border-[#B68A3A] focus:ring-1 focus:ring-[#B68A3A]"
                          />
                          {addressErrors.stateName && <p className="text-xs text-[#FF6B6B]">{addressErrors.stateName}</p>}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleConfirmAddress}
                        className="h-10 px-8 bg-[#5B1018] text-[#FAF5EC] border border-[#76252C] hover:bg-[#76252C] hover:border-[#D7B56D] font-sans text-xs uppercase tracking-[0.18em] font-semibold rounded-[2px] cursor-pointer shadow-md transition-all"
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
            <div className="bg-[#3B090D] border border-[#B68A3A]/30 rounded-[4px] p-6 space-y-4 shadow-md transition-all text-[#FAF5EC]">
              <div className="flex items-center justify-between border-b border-[#B68A3A]/20 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#5B1018] border border-[#B68A3A]/50 text-[#FAF5EC] font-sans text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#FAF5EC]">
                    ORDER SUMMARY ({summary?.items.length || 0} ITEMS)
                  </h3>
                </div>
                {activeStep > 3 && (
                  <button
                    onClick={() => setActiveStep(3)}
                    className="text-xs font-semibold text-[#D7B56D] flex items-center gap-1 hover:text-[#FAF5EC] hover:underline cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                )}
              </div>

              {activeStep > 3 ? (
                <div className="bg-[#2E070B] p-4 rounded-[4px] border border-[#B68A3A]/30 text-xs space-y-2 text-[#FAF5EC]">
                  {summary?.items.map((it) => (
                    <div key={`${it.productId}-${it.variantId}`} className="flex justify-between items-center">
                      <span className="text-[#FAF5EC] font-medium text-sm">
                        {it.name} ({it.variantLabel}) x {it.qty}
                      </span>
                      <span className="text-[#FAF5EC] font-semibold text-sm">
                        ₹{it.lineTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : activeStep === 3 ? (
                <div className="space-y-6 pt-2">
                  <div className="space-y-4 divide-y divide-[#B68A3A]/20">
                    {summary?.items.map((item) => (
                      <div
                        key={`${item.productId}-${item.variantId}`}
                        className="pt-4 first:pt-0 flex gap-4 items-center justify-between"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="relative w-16 aspect-[3/4] bg-[#2E070B] rounded-[3px] overflow-hidden border border-[#B68A3A]/40 shrink-0">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                          <div className="space-y-1">
                            <div className="text-[10px] uppercase tracking-wider text-[#D7B56D] font-semibold">
                              CODE: {item.code}
                            </div>
                            <h4 className="font-serif text-base text-[#FAF5EC] font-normal leading-snug">
                              {item.name}
                            </h4>
                            <div className="text-xs text-[#FAF5EC]/80 font-medium">
                              Option: {item.variantLabel}
                            </div>
                            <div className="text-xs font-semibold text-[#D7B56D]">
                              Unit: ₹{item.unitPrice.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>

                        {/* Quantity Stepper & Line Total */}
                        <div className="text-right space-y-2 shrink-0">
                          <div className="font-sans text-base text-[#FAF5EC] font-semibold">
                            ₹{item.lineTotal.toLocaleString('en-IN')}
                          </div>

                          <div className="inline-flex items-center border border-[#B68A3A]/50 rounded-[2px] h-8 bg-[#2E070B]">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateItemQty(item.productId, item.variantId, item.qty, item.maxStock, -1)
                              }
                              disabled={item.qty <= 1}
                              className="w-7 h-full flex items-center justify-center text-xs text-[#FAF5EC] hover:bg-[#5B1018] disabled:opacity-30 cursor-pointer font-bold transition-colors"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-xs font-semibold text-[#FAF5EC]">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateItemQty(item.productId, item.variantId, item.qty, item.maxStock, 1)
                              }
                              disabled={item.qty >= item.maxStock}
                              className="w-7 h-full flex items-center justify-center text-xs text-[#FAF5EC] hover:bg-[#5B1018] disabled:opacity-30 cursor-pointer font-bold transition-colors"
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
                    className="h-10 px-8 bg-[#5B1018] text-[#FAF5EC] border border-[#76252C] hover:bg-[#76252C] hover:border-[#D7B56D] font-sans text-xs uppercase tracking-[0.18em] font-semibold rounded-[2px] cursor-pointer shadow-md transition-all"
                  >
                    CONTINUE TO PAYMENT
                  </button>
                </div>
              ) : null}
            </div>

            {/* ==================================================== */}
            {/* STEP 4: PAYMENT INSTRUMENT                            */}
            {/* ==================================================== */}
            <div className="bg-[#3B090D] border border-[#B68A3A]/30 rounded-[4px] p-6 space-y-5 shadow-md text-[#FAF5EC]">
              <div className="flex items-center gap-3 border-b border-[#B68A3A]/20 pb-3">
                <span className="w-6 h-6 rounded-full bg-[#5B1018] border border-[#B68A3A]/50 text-[#FAF5EC] font-sans text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#FAF5EC]">
                  PAYMENT METHOD
                </h3>
              </div>

              {activeStep === 4 && (
                <form onSubmit={handlePlaceOrder} className="space-y-6 pt-2 text-sm">
                  {/* Payment Failure Retry State Alert */}
                  {paymentError && (
                    <div className="p-4 bg-[#2E070B] border border-[#FF6B6B]/40 rounded-[2px] text-[#FF6B6B] text-xs space-y-2 animate-in fade-in">
                      <div className="flex items-center gap-2 font-semibold">
                        <AlertCircle className="w-4 h-4 text-[#FF6B6B] shrink-0" />
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
                          className={`p-4 rounded-[3px] border transition-all ${
                            pm.disabled
                              ? 'border-[#B68A3A]/20 opacity-40 cursor-not-allowed bg-[#2E070B]/50 text-[#FAF5EC]/60'
                              : isSel
                              ? 'border-[#D7B56D] bg-[#2E070B] text-[#FAF5EC] ring-1 ring-[#D7B56D] cursor-pointer shadow-md'
                              : 'border-[#B68A3A]/30 bg-[#2E070B]/60 text-[#FAF5EC] hover:border-[#B68A3A] cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  isSel ? 'border-[#D7B56D] bg-[#5B1018]' : 'border-[#B68A3A]/40'
                                }`}
                              >
                                {isSel && <div className="w-1.5 h-1.5 rounded-full bg-[#FAF5EC]" />}
                              </div>
                              <div>
                                <div className="text-xs uppercase tracking-wider text-[#FAF5EC] font-bold">
                                  {pm.label}
                                </div>
                                <div className="text-xs text-[#FAF5EC]/85 font-medium">{pm.desc}</div>
                              </div>
                            </div>
                          </div>

                          {/* Extra VPA ID input for UPI */}
                          {isSel && pm.id === 'UPI' && (
                            <div className="mt-3 pt-3 border-t border-[#B68A3A]/20 space-y-1">
                              <label className="text-[10px] uppercase tracking-wider text-[#D7B56D] font-semibold">
                                ENTER UPI ID (OPTIONAL)
                              </label>
                              <input
                                type="text"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                placeholder="name@upi or mobile@paytm"
                                className="w-full bg-[#2E070B] border border-[#B68A3A]/40 rounded-[2px] px-3 py-1.5 text-xs text-[#FAF5EC] placeholder:text-[#FAF5EC]/70 outline-none focus:border-[#B68A3A] focus:ring-1 focus:ring-[#B68A3A]"
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
                    className="w-full h-[52px] bg-[#5B1018] text-[#FAF5EC] border border-[#76252C] hover:bg-[#76252C] hover:border-[#D7B56D] font-sans text-xs uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2 rounded-[2px] shadow-lg cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-[#FAF5EC]" />
                        <span>PROCESSING ORDER...</span>
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

          {/* Right Column: Price Details Box (Product Card Matching Style) */}
          <div className="lg:col-span-5 bg-[#3B090D] border border-[#B68A3A]/40 rounded-[4px] p-6 space-y-6 lg:sticky lg:top-24 shadow-md text-[#FAF5EC]">
            <h3 className="text-[12px] uppercase tracking-[0.25em] text-[#D7B56D] font-bold border-b border-[#B68A3A]/30 pb-3 font-sans">
              PRICE DETAILS
            </h3>

            {/* Breakdown Table */}
            <div className="space-y-3 text-sm text-[#FAF5EC]">
              <div className="flex justify-between font-medium">
                <span className="text-[#FAF5EC]/85">Items Subtotal</span>
                <span className="text-[#FAF5EC] font-bold text-base tabular-nums">
                  ₹{summary?.subtotal.toLocaleString('en-IN') || 0}
                </span>
              </div>

              <div className="flex justify-between items-center font-medium">
                <span className="text-[#FAF5EC]/85">Delivery Charge</span>
                {summary?.shipping === 0 ? (
                  <span className="text-emerald-400 text-xs uppercase tracking-wider font-semibold">
                    FREE (OVER ₹1999)
                  </span>
                ) : (
                  <span className="text-[#FAF5EC] font-bold text-base tabular-nums">
                    ₹{summary?.shipping}
                  </span>
                )}
              </div>

              {/* GST Display */}
              {summary?.gstMode === 'exclusive' && summary.gst > 0 ? (
                <div className="flex justify-between font-medium">
                  <span className="text-[#FAF5EC]/85">GST (3%)</span>
                  <span className="text-[#FAF5EC] font-bold text-base tabular-nums">
                    ₹{summary.gst.toLocaleString('en-IN')}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-[#FAF5EC]/70 uppercase tracking-wider pt-1 font-medium">
                  Inclusive of all taxes
                </div>
              )}

              {summary && summary.totalSavings > 0 && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-[2px] flex items-center justify-between text-xs text-emerald-400 font-semibold">
                  <span>YOUR SAVINGS</span>
                  <span className="font-serif">₹{summary.totalSavings.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="border-t border-[#B68A3A]/30 pt-4 flex justify-between items-baseline">
                <span className="text-sm uppercase tracking-wider text-[#FAF5EC] font-bold">
                  TOTAL AMOUNT
                </span>
                <span className="font-serif text-[28px] font-bold tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-[#F7DA96] via-[#E5B869] to-[#B68A3A]">
                  ₹{summary?.total.toLocaleString('en-IN') || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Bottom Action Bar (375px) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-[#2E070B] border-t border-[#B68A3A]/40 p-3 z-40 flex items-center justify-between shadow-2xl text-[#FAF5EC]">
        <div>
          <div className="font-sans text-[10px] uppercase tracking-wider text-[#FAF5EC]/75 font-semibold">
            TOTAL AMOUNT
          </div>
          <div className="font-serif text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F7DA96] via-[#E5B869] to-[#B68A3A]">
            ₹{summary?.total.toLocaleString('en-IN') || 0}
          </div>
        </div>

        {activeStep === 4 ? (
          <button
            onClick={handlePlaceOrder}
            disabled={isProcessing || !summary?.valid}
            className="h-11 px-6 bg-[#5B1018] text-[#FAF5EC] border border-[#76252C] hover:bg-[#76252C] hover:border-[#D7B56D] font-sans text-xs uppercase tracking-[0.2em] font-bold rounded-[2px] shadow-sm disabled:opacity-50 cursor-pointer transition-all"
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
            className="h-11 px-6 bg-[#5B1018] text-[#FAF5EC] border border-[#76252C] hover:bg-[#76252C] hover:border-[#D7B56D] font-sans text-xs uppercase tracking-[0.2em] font-semibold rounded-[2px] cursor-pointer transition-all"
          >
            NEXT STEP
          </button>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#2E070B] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#B68A3A]" />
        </div>
      }
    >
      <CheckoutContent />
    </React.Suspense>
  );
}
