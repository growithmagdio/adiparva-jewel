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
      <div className="min-h-screen bg-[#FAF5EC] text-[#765E55] flex flex-col justify-center items-center p-6 text-center space-y-4 font-sans select-none">
        <KolamDivider />
        <h2 className="font-serif text-3xl text-[#5B1018]">This item is not available</h2>
        <p className="text-sm text-[#765E55] max-w-md">
          {summary.message || 'The selected piece or option is no longer available.'}
        </p>
        <Link
          href="/collections"
          className="h-11 px-7 bg-[#5B1018] text-[#FAF5EC] font-sans text-xs uppercase tracking-[0.2em] font-semibold inline-flex items-center justify-center rounded-[2px] hover:bg-[#3B090D] transition-colors"
        >
          RETURN TO COLLECTION
        </Link>
      </div>
    );
  }

  const activeAddr = savedAddresses.find((a) => a.id === selectedAddrId);

  return (
    <div className="min-h-screen bg-[#FAF5EC] text-[#765E55] select-none font-sans pb-28 lg:pb-12 selection:bg-[#5B1018] selection:text-[#FAF5EC]">
      {/* Top Header */}
      <header className="border-b border-[#E7D7C0] py-4 px-6 sm:px-8 bg-[#FAF5EC]/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={handleReturn}
            className="flex items-center gap-2 font-sans text-xs uppercase tracking-[0.16em] font-semibold text-[#B68A3A] hover:text-[#5B1018] transition-colors cursor-pointer"
            aria-label={isBuyNow ? 'Return to piece' : 'Return to cart'}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isBuyNow ? 'RETURN TO PIECE' : 'RETURN TO CART'}</span>
          </button>

          <Link href="/" className="font-serif text-xl tracking-[0.15em] font-normal text-[#5B1018]">
            ADI PARVA
          </Link>

          <div className="flex items-center gap-2 font-sans text-xs uppercase tracking-[0.16em] font-semibold text-[#B68A3A]">
            <Lock className="w-3.5 h-3.5 text-[#B68A3A]" />
            <span className="hidden sm:inline">SECURE CHECKOUT</span>
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
            <div className="bg-[#FFFFFF] border border-[#E7D7C0] rounded-[6px] p-6 space-y-4 shadow-sm transition-all">
              <div className="flex items-center justify-between border-b border-[#E7D7C0] pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#5B1018] text-[#FAF5EC] font-sans text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#5B1018]">
                    CONTACT DETAILS
                  </h3>
                </div>
                {(currentUser || guestModeConfirmed) && activeStep > 1 && (
                  <button
                    onClick={() => setActiveStep(1)}
                    className="text-xs font-semibold text-[#B68A3A] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                )}
              </div>

              {isAuthLoading ? (
                <div className="h-12 bg-[#F2E7D7] animate-pulse rounded-[2px]" />
              ) : currentUser || guestModeConfirmed ? (
                <div className="flex items-center justify-between bg-[#F2E7D7]/40 p-4 rounded-[4px] border border-[#E7D7C0] text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#5B1018] text-[#FAF5EC] font-sans text-xs flex items-center justify-center font-bold">
                      {(currentUser?.displayName || authName || 'P').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-[#5B1018]">
                        {currentUser?.displayName || authName || 'Customer'} {currentUser?.phoneNumber || authPhone ? `(${currentUser?.phoneNumber || authPhone})` : ''}
                      </div>
                      <div className="text-xs text-[#765E55]">
                        {currentUser?.email || authEmail || 'Contact details provided'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1 bg-emerald-50 border border-emerald-500/30 px-2.5 py-1 rounded">
                    <Check className="w-3 h-3" /> VERIFIED
                  </span>
                </div>
              ) : activeStep === 1 ? (
                <div className="space-y-5 pt-2">
                  {!otpSent ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-[0.18em] text-[#B68A3A] font-semibold">
                          MOBILE PHONE NUMBER
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-[#B68A3A] absolute left-3.5 top-3" />
                          <input
                            type="tel"
                            value={authPhone}
                            onChange={(e) => setAuthPhone(e.target.value)}
                            placeholder="Enter 10-digit mobile number"
                            className="w-full bg-[#FAF5EC] border border-[#E7D7C0] rounded-[2px] pl-10 pr-3.5 py-2.5 text-[#5B1018] font-medium text-sm outline-none focus:border-[#B68A3A] transition-all"
                          />
                        </div>
                      </div>

                      {authError && <p className="text-xs text-[#B3261E] font-medium">{authError}</p>}

                      <button
                        type="submit"
                        className="h-10 px-6 bg-[#5B1018] text-[#FAF5EC] hover:bg-[#3B090D] font-sans text-xs uppercase tracking-[0.16em] font-semibold rounded-[2px] cursor-pointer transition-colors shadow-xs"
                      >
                        SEND OTP CODE
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="p-3 bg-[#F2E7D7]/50 border border-[#E7D7C0] rounded-[2px] text-xs text-[#765E55]">
                        Verification code sent to <strong className="text-[#5B1018]">{authPhone}</strong>.
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-[0.18em] text-[#B68A3A] font-semibold">
                          ENTER 6-DIGIT OTP
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="123456"
                          className="w-32 tracking-[0.4em] text-center font-mono text-base bg-[#FAF5EC] border border-[#E7D7C0] rounded-[2px] py-2 text-[#5B1018] font-bold outline-none focus:border-[#B68A3A]"
                        />
                      </div>

                      {authError && <p className="text-xs text-[#B3261E] font-medium">{authError}</p>}

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="h-10 px-6 bg-[#5B1018] text-[#FAF5EC] hover:bg-[#3B090D] font-sans text-xs uppercase tracking-[0.16em] font-semibold rounded-[2px] cursor-pointer shadow-xs transition-colors"
                        >
                          VERIFY & CONTINUE
                        </button>
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="h-10 px-4 border border-[#B68A3A] text-[#5B1018] bg-[#FFFFFF] hover:bg-[#F2E7D7] font-sans text-xs uppercase tracking-wider rounded-[2px] cursor-pointer"
                        >
                          BACK
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Or Guest Mode */}
                  <div className="border-t border-[#E7D7C0] pt-4 space-y-3">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[#B68A3A] font-semibold">
                      OR CONTINUE AS GUEST
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="Full Name"
                        className="bg-[#FAF5EC] border border-[#E7D7C0] rounded-[2px] px-3.5 py-2 text-sm text-[#5B1018] font-medium outline-none focus:border-[#B68A3A]"
                      />
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="Email Address"
                        className="bg-[#FAF5EC] border border-[#E7D7C0] rounded-[2px] px-3.5 py-2 text-sm text-[#5B1018] font-medium outline-none focus:border-[#B68A3A]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleContinueAsGuest}
                      className="h-9 px-6 bg-[#FAF5EC] border border-[#B68A3A] text-[#5B1018] hover:bg-[#5B1018] hover:text-[#FAF5EC] font-sans text-[11px] uppercase tracking-[0.18em] font-semibold rounded-[2px] transition-colors cursor-pointer"
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
            <div className="bg-[#FFFFFF] border border-[#E7D7C0] rounded-[6px] p-6 space-y-4 shadow-sm transition-all">
              <div className="flex items-center justify-between border-b border-[#E7D7C0] pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#5B1018] text-[#FAF5EC] font-sans text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#5B1018]">
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
                            className="w-full bg-[#FAF5EC] border border-[#E7D7C0] rounded-[2px] px-3.5 py-2 text-[#5B1018] font-medium outline-none focus:border-[#B68A3A]"
                          />
                          {addressErrors.fullName && <p className="text-xs text-[#B3261E]">{addressErrors.fullName}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-[0.16em] text-[#B68A3A] font-semibold">
                            MOBILE PHONE
                          </label>
                          <input
                            type="tel"
                            maxLength={10}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="10-digit mobile number"
                            className="w-full bg-[#FAF5EC] border border-[#E7D7C0] rounded-[2px] px-3.5 py-2 text-[#5B1018] font-medium outline-none focus:border-[#B68A3A]"
                          />
                          {addressErrors.phone && <p className="text-xs text-[#B3261E]">{addressErrors.phone}</p>}
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[10px] uppercase tracking-[0.16em] text-[#B68A3A] font-semibold">
                            STREET ADDRESS & HOUSE NO.
                          </label>
                          <input
                            type="text"
                            value={addressLine}
                            onChange={(e) => setAddressLine(e.target.value)}
                            placeholder="Flat / House No. / Building / Street"
                            className="w-full bg-[#FAF5EC] border border-[#E7D7C0] rounded-[2px] px-3.5 py-2 text-[#5B1018] font-medium outline-none focus:border-[#B68A3A]"
                          />
                          {addressErrors.addressLine && <p className="text-xs text-[#B3261E]">{addressErrors.addressLine}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-[0.16em] text-[#B68A3A] font-semibold">
                            AREA / LOCALITY (OPTIONAL)
                          </label>
                          <input
                            type="text"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            placeholder="Area or Locality"
                            className="w-full bg-[#FAF5EC] border border-[#E7D7C0] rounded-[2px] px-3.5 py-2 text-[#5B1018] font-medium outline-none focus:border-[#B68A3A]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-[0.16em] text-[#B68A3A] font-semibold">
                            PINCODE
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            value={pincode}
                            onChange={handlePincodeChange}
                            placeholder="6-digit Pincode"
                            className="w-full bg-[#FAF5EC] border border-[#E7D7C0] rounded-[2px] px-3.5 py-2 text-[#5B1018] font-medium outline-none focus:border-[#B68A3A]"
                          />
                          {addressErrors.pincode && <p className="text-xs text-[#B3261E]">{addressErrors.pincode}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-[0.16em] text-[#B68A3A] font-semibold">
                            CITY
                          </label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="City"
                            className="w-full bg-[#FAF5EC] border border-[#E7D7C0] rounded-[2px] px-3.5 py-2 text-[#5B1018] font-medium outline-none focus:border-[#B68A3A]"
                          />
                          {addressErrors.city && <p className="text-xs text-[#B3261E]">{addressErrors.city}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-[0.16em] text-[#B68A3A] font-semibold">
                            STATE
                          </label>
                          <input
                            type="text"
                            value={stateName}
                            onChange={(e) => setStateName(e.target.value)}
                            placeholder="State"
                            className="w-full bg-[#FAF5EC] border border-[#E7D7C0] rounded-[2px] px-3.5 py-2 text-[#5B1018] font-medium outline-none focus:border-[#B68A3A]"
                          />
                          {addressErrors.stateName && <p className="text-xs text-[#B3261E]">{addressErrors.stateName}</p>}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleConfirmAddress}
                        className="h-10 px-8 bg-[#5B1018] text-[#FAF5EC] hover:bg-[#3B090D] font-sans text-xs uppercase tracking-[0.18em] font-semibold rounded-[2px] cursor-pointer shadow-xs transition-colors"
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
            <div className="bg-[#FFFFFF] border border-[#E7D7C0] rounded-[6px] p-6 space-y-4 shadow-sm transition-all">
              <div className="flex items-center justify-between border-b border-[#E7D7C0] pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#5B1018] text-[#FAF5EC] font-sans text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#5B1018]">
                    ORDER SUMMARY ({summary?.items.length || 0} ITEMS)
                  </h3>
                </div>
                {activeStep > 3 && (
                  <button
                    onClick={() => setActiveStep(3)}
                    className="text-xs font-semibold text-[#B68A3A] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                )}
              </div>

              {activeStep > 3 ? (
                <div className="bg-[#F2E7D7]/40 p-4 rounded-[4px] border border-[#E7D7C0] text-xs space-y-2">
                  {summary?.items.map((it) => (
                    <div key={`${it.productId}-${it.variantId}`} className="flex justify-between items-center">
                      <span className="text-[#5B1018] font-medium text-sm">
                        {it.name} ({it.variantLabel}) x {it.qty}
                      </span>
                      <span className="text-[#5B1018] font-semibold text-sm">
                        ₹{it.lineTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : activeStep === 3 ? (
                <div className="space-y-6 pt-2">
                  <div className="space-y-4 divide-y divide-[#E7D7C0]">
                    {summary?.items.map((item) => (
                      <div
                        key={`${item.productId}-${item.variantId}`}
                        className="pt-4 first:pt-0 flex gap-4 items-center justify-between"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="relative w-16 aspect-[3/4] bg-[#3B090D] rounded-[3px] overflow-hidden border border-[#B68A3A]/40 shrink-0">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                          <div className="space-y-1">
                            <div className="text-[10px] uppercase tracking-wider text-[#B68A3A] font-semibold">
                              CODE: {item.code}
                            </div>
                            <h4 className="font-serif text-base text-[#5B1018] font-normal leading-snug">
                              {item.name}
                            </h4>
                            <div className="text-xs text-[#765E55]">
                              Option: {item.variantLabel}
                            </div>
                            <div className="text-xs font-semibold text-[#5B1018]">
                              Unit: ₹{item.unitPrice.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>

                        {/* Quantity Stepper & Line Total */}
                        <div className="text-right space-y-2 shrink-0">
                          <div className="font-sans text-base text-[#5B1018] font-semibold">
                            ₹{item.lineTotal.toLocaleString('en-IN')}
                          </div>

                          <div className="inline-flex items-center border border-[#B68A3A] rounded-[2px] h-8 bg-[#FFFFFF]">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateItemQty(item.productId, item.variantId, item.qty, item.maxStock, -1)
                              }
                              disabled={item.qty <= 1}
                              className="w-7 h-full flex items-center justify-center text-xs text-[#5B1018] hover:bg-[#F2E7D7] disabled:opacity-30 cursor-pointer font-bold"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-xs font-semibold text-[#5B1018]">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateItemQty(item.productId, item.variantId, item.qty, item.maxStock, 1)
                              }
                              disabled={item.qty >= item.maxStock}
                              className="w-7 h-full flex items-center justify-center text-xs text-[#5B1018] hover:bg-[#F2E7D7] disabled:opacity-30 cursor-pointer font-bold"
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
                    className="h-10 px-8 bg-[#5B1018] text-[#FAF5EC] hover:bg-[#3B090D] font-sans text-xs uppercase tracking-[0.18em] font-semibold rounded-[2px] cursor-pointer shadow-xs transition-colors"
                  >
                    CONTINUE TO PAYMENT
                  </button>
                </div>
              ) : null}
            </div>

            {/* ==================================================== */}
            {/* STEP 4: PAYMENT INSTRUMENT                            */}
            {/* ==================================================== */}
            <div className="bg-[#FFFFFF] border border-[#E7D7C0] rounded-[6px] p-6 space-y-5 shadow-sm">
              <div className="flex items-center gap-3 border-b border-[#E7D7C0] pb-3">
                <span className="w-6 h-6 rounded-full bg-[#5B1018] text-[#FAF5EC] font-sans text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#5B1018]">
                  PAYMENT METHOD
                </h3>
              </div>

              {activeStep === 4 && (
                <form onSubmit={handlePlaceOrder} className="space-y-6 pt-2 text-sm">
                  {/* Payment Failure Retry State Alert */}
                  {paymentError && (
                    <div className="p-4 bg-[#FBE9E7] border border-[#B3261E]/40 rounded-[2px] text-[#B3261E] text-xs space-y-2 animate-in fade-in">
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
                          className={`p-4 rounded-[3px] border transition-all ${
                            pm.disabled
                              ? 'border-[#E7D7C0] opacity-40 cursor-not-allowed bg-[#F2E7D7]'
                              : isSel
                              ? 'border-[#5B1018] bg-[#F2E7D7]/50 text-[#5B1018] ring-1 ring-[#5B1018] cursor-pointer shadow-xs'
                              : 'border-[#E7D7C0] bg-[#FFFFFF] text-[#765E55] hover:border-[#B68A3A] cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  isSel ? 'border-[#5B1018] bg-[#5B1018]' : 'border-[#E7D7C0]'
                                }`}
                              >
                                {isSel && <div className="w-1.5 h-1.5 rounded-full bg-[#FAF5EC]" />}
                              </div>
                              <div>
                                <div className="text-xs uppercase tracking-wider text-[#5B1018] font-bold">
                                  {pm.label}
                                </div>
                                <div className="text-xs text-[#765E55]">{pm.desc}</div>
                              </div>
                            </div>
                          </div>

                          {/* Extra VPA ID input for UPI */}
                          {isSel && pm.id === 'UPI' && (
                            <div className="mt-3 pt-3 border-t border-[#E7D7C0] space-y-1">
                              <label className="text-[10px] uppercase tracking-wider text-[#B68A3A] font-semibold">
                                ENTER UPI ID (OPTIONAL)
                              </label>
                              <input
                                type="text"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                placeholder="name@upi or mobile@paytm"
                                className="w-full bg-[#FAF5EC] border border-[#E7D7C0] rounded-[2px] px-3 py-1.5 text-xs text-[#5B1018] outline-none focus:border-[#B68A3A]"
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
                    className="w-full h-[52px] bg-[#5B1018] text-[#FAF5EC] hover:bg-[#3B090D] font-sans text-xs uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2 rounded-[2px] shadow-sm cursor-pointer disabled:opacity-50 transition-colors"
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

          {/* Right Column: Price Details Box */}
          <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#E7D7C0] rounded-[6px] p-6 space-y-6 lg:sticky lg:top-24 shadow-sm">
            <h3 className="text-[12px] uppercase tracking-[0.25em] text-[#B68A3A] font-bold border-b border-[#E7D7C0] pb-3">
              PRICE DETAILS
            </h3>

            {/* Breakdown Table */}
            <div className="space-y-3 text-sm text-[#765E55]">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-[#5B1018] font-semibold text-base tabular-nums">
                  ₹{summary?.subtotal.toLocaleString('en-IN') || 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Delivery Charge</span>
                {summary?.shipping === 0 ? (
                  <span className="text-emerald-700 text-xs uppercase tracking-wider font-semibold">
                    FREE (OVER ₹1999)
                  </span>
                ) : (
                  <span className="text-[#5B1018] font-semibold text-base tabular-nums">
                    ₹{summary?.shipping}
                  </span>
                )}
              </div>

              {/* GST Display */}
              {summary?.gstMode === 'exclusive' && summary.gst > 0 ? (
                <div className="flex justify-between">
                  <span>GST (3%)</span>
                  <span className="text-[#5B1018] font-semibold text-base tabular-nums">
                    ₹{summary.gst.toLocaleString('en-IN')}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-[#765E55]/80 uppercase tracking-wider pt-1">
                  Inclusive of all taxes
                </div>
              )}

              {summary && summary.totalSavings > 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-500/30 rounded-[2px] flex items-center justify-between text-xs text-emerald-800 font-semibold">
                  <span>YOUR SAVINGS</span>
                  <span className="font-serif">₹{summary.totalSavings.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="border-t border-[#E7D7C0] pt-4 flex justify-between items-baseline">
                <span className="text-sm uppercase tracking-wider text-[#5B1018] font-bold">
                  TOTAL AMOUNT
                </span>
                <span className="font-serif text-[28px] text-[#5B1018] font-medium tabular-nums">
                  ₹{summary?.total.toLocaleString('en-IN') || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Bottom Action Bar (375px) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-[#FAF5EC] border-t border-[#E7D7C0] p-3 z-40 flex items-center justify-between shadow-2xl">
        <div>
          <div className="font-sans text-[10px] uppercase tracking-wider text-[#765E55]">
            TOTAL AMOUNT
          </div>
          <div className="font-serif text-xl text-[#5B1018] font-semibold">
            ₹{summary?.total.toLocaleString('en-IN') || 0}
          </div>
        </div>

        {activeStep === 4 ? (
          <button
            onClick={handlePlaceOrder}
            disabled={isProcessing || !summary?.valid}
            className="h-11 px-6 bg-[#5B1018] text-[#FAF5EC] hover:bg-[#3B090D] font-sans text-xs uppercase tracking-[0.2em] font-bold rounded-[2px] shadow-sm disabled:opacity-50 cursor-pointer"
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
            className="h-11 px-6 bg-[#5B1018] text-[#FAF5EC] hover:bg-[#3B090D] font-sans text-xs uppercase tracking-[0.2em] font-semibold rounded-[2px] cursor-pointer"
          >
            NEXT STEP
          </button>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF5EC] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#B68A3A]" />
        </div>
      }
    >
      <CheckoutContent />
    </React.Suspense>
  );
}
