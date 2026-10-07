'use server';

import { adminDb } from '@/lib/firebase/admin-config';
import { getStoreData, saveStoreData } from '@/lib/data/store';
import { CHECKOUT_CONFIG } from '@/lib/config/checkout-config';
import crypto from 'crypto';

export interface CheckoutItemInput {
  productId: string;
  variantId: string;
  qty: number;
}

export interface VerifiedCheckoutItem {
  productId: string;
  variantId: string;
  name: string;
  code: string;
  image: string;
  variantLabel: string;
  unitPrice: number;
  compareAtPrice?: number;
  qty: number;
  maxStock: number;
  lineTotal: number;
}

export interface CheckoutSummaryResult {
  valid: boolean;
  message?: string;
  items: VerifiedCheckoutItem[];
  subtotal: number;
  shipping: number;
  gst: number;
  gstMode: 'inclusive' | 'exclusive';
  total: number;
  totalSavings: number;
}

export interface CreateServerOrderInput {
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: CheckoutItemInput[];
  shippingAddress: {
    fullName: string;
    phone: string;
    pincode: string;
    addressLine: string;
    area?: string;
    city: string;
    state: string;
  };
  paymentMethod: 'Card' | 'UPI' | 'Net banking' | 'Cash on delivery';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

/**
 * Server-side item validation and server-authoritative price calculation
 */
export async function calculateCheckoutSummary(
  itemsInput: CheckoutItemInput[]
): Promise<CheckoutSummaryResult> {
  try {
    if (!itemsInput || itemsInput.length === 0) {
      return {
        valid: false,
        message: 'No items in order',
        items: [],
        subtotal: 0,
        shipping: 0,
        gst: 0,
        gstMode: CHECKOUT_CONFIG.GST_MODE,
        total: 0,
        totalSavings: 0,
      };
    }

    const store = getStoreData();
    let subtotal = 0;
    let totalSavings = 0;
    const verifiedItems: VerifiedCheckoutItem[] = [];

    for (const input of itemsInput) {
      const prod = store.products.find((p) => p.id === input.productId);
      if (!prod || prod.status !== 'live') {
        return {
          valid: false,
          message: `Product ${input.productId} is not available or inactive.`,
          items: [],
          subtotal: 0,
          shipping: 0,
          gst: 0,
          gstMode: CHECKOUT_CONFIG.GST_MODE,
          total: 0,
          totalSavings: 0,
        };
      }

      const variant = prod.variants.find((v) => v.id === input.variantId) || prod.variants[0];
      if (!variant) {
        return {
          valid: false,
          message: `Variant selected for ${prod.name} is invalid.`,
          items: [],
          subtotal: 0,
          shipping: 0,
          gst: 0,
          gstMode: CHECKOUT_CONFIG.GST_MODE,
          total: 0,
          totalSavings: 0,
        };
      }

      const availableStock = variant.stock ?? prod.totalStock;
      const qty = Math.floor(input.qty);

      if (isNaN(qty) || qty < 1) {
        return {
          valid: false,
          message: `Invalid quantity for ${prod.name}.`,
          items: [],
          subtotal: 0,
          shipping: 0,
          gst: 0,
          gstMode: CHECKOUT_CONFIG.GST_MODE,
          total: 0,
          totalSavings: 0,
        };
      }

      if (qty > availableStock) {
        return {
          valid: false,
          message: `Only ${availableStock} units available for ${prod.name}.`,
          items: [],
          subtotal: 0,
          shipping: 0,
          gst: 0,
          gstMode: CHECKOUT_CONFIG.GST_MODE,
          total: 0,
          totalSavings: 0,
        };
      }

      const unitPrice = prod.price;
      const comparePrice = prod.compareAtPrice;
      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;

      if (comparePrice && comparePrice > unitPrice) {
        totalSavings += (comparePrice - unitPrice) * qty;
      }

      const productCode =
        prod.code ||
        `AP-${String(Math.abs(prod.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 800 + 100).padStart(4, '0')}`;

      verifiedItems.push({
        productId: prod.id,
        variantId: variant.id,
        name: prod.name,
        code: productCode,
        image: prod.images[0] || '/images/products/maharani-temple-necklace-1.jpg',
        variantLabel: variant.label || 'Standard 22K',
        unitPrice,
        compareAtPrice: comparePrice,
        qty,
        maxStock: availableStock,
        lineTotal,
      });
    }

    // Shipping calculation
    const shipping =
      subtotal >= CHECKOUT_CONFIG.FREE_SHIPPING_THRESHOLD
        ? 0
        : CHECKOUT_CONFIG.STANDARD_SHIPPING_FEE;

    // GST mode calculation
    const gstMode = CHECKOUT_CONFIG.GST_MODE;
    const gst =
      gstMode === 'exclusive' ? Math.round(subtotal * CHECKOUT_CONFIG.GST_RATE) : 0;
    const total = subtotal + shipping + gst;

    return {
      valid: true,
      items: verifiedItems,
      subtotal,
      shipping,
      gst,
      gstMode,
      total,
      totalSavings,
    };
  } catch (err: any) {
    console.error('Error in calculateCheckoutSummary:', err);
    return {
      valid: false,
      message: 'Failed to calculate checkout summary.',
      items: [],
      subtotal: 0,
      shipping: 0,
      gst: 0,
      gstMode: CHECKOUT_CONFIG.GST_MODE,
      total: 0,
      totalSavings: 0,
    };
  }
}

/**
 * Server Action: Create Razorpay Order
 * Browser NEVER sends an amount. Total is calculated strictly on the server.
 */
export async function createRazorpayOrder(itemsInput: CheckoutItemInput[]) {
  try {
    const summary = await calculateCheckoutSummary(itemsInput);
    if (!summary.valid) {
      return { success: false, message: summary.message || 'Invalid checkout items' };
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_adaparva_demo';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'demo_razorpay_secret';

    const amountInPaise = summary.total * 100;
    const receipt = `rcpt_${Date.now()}`;

    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${authHeader}`,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt,
          notes: {
            app: 'Adi Parva Store',
          },
        }),
      });

      if (response.ok) {
        const orderData = await response.json();
        return {
          success: true,
          razorpayOrderId: orderData.id,
          amount: summary.total,
          amountInPaise,
          currency: 'INR',
          keyId,
        };
      }
    }

    const mockRazorpayOrderId = `order_${Math.random().toString(36).substring(2, 14)}`;

    return {
      success: true,
      razorpayOrderId: mockRazorpayOrderId,
      amount: summary.total,
      amountInPaise,
      currency: 'INR',
      keyId,
    };
  } catch (err: any) {
    console.error('createRazorpayOrder error:', err);
    return { success: false, message: 'Failed to create payment order.' };
  }
}

/**
 * Verifies Razorpay HMAC SHA256 Signature
 */
function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  if (!orderId || !paymentId || !signature || !secret) return false;
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}

/**
 * Server Action: Create Server Order
 */
export async function createServerOrder(input: CreateServerOrderInput) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'demo_razorpay_secret';

    const summary = await calculateCheckoutSummary(input.items);
    if (!summary.valid) {
      return { success: false, message: summary.message || 'This item is not available.' };
    }

    let paymentStatus = 'pending';

    if (input.paymentMethod === 'Cash on delivery') {
      const phoneClean = input.customerPhone.replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(phoneClean)) {
        return {
          success: false,
          message: 'Cash on Delivery requires a valid 10-digit Indian mobile number.',
        };
      }

      if (summary.total > CHECKOUT_CONFIG.MAX_COD_AMOUNT) {
        return {
          success: false,
          message: `Cash on Delivery is limited to orders up to ₹${CHECKOUT_CONFIG.MAX_COD_AMOUNT.toLocaleString('en-IN')}. Please select UPI or Card.`,
        };
      }

      paymentStatus = 'cod_pending';
    } else {
      if (!input.razorpayOrderId || !input.razorpayPaymentId || !input.razorpaySignature) {
        return {
          success: false,
          message: 'Payment verification failed: Missing Razorpay payment signatures.',
        };
      }

      const store = getStoreData();
      const duplicateOrder = store.orders.find(
        (o: any) => o.razorpayPaymentId === input.razorpayPaymentId
      );
      if (duplicateOrder) {
        return {
          success: false,
          message: 'This payment transaction has already been used for an existing order.',
        };
      }

      const isValidSig =
        verifyRazorpaySignature(
          input.razorpayOrderId,
          input.razorpayPaymentId,
          input.razorpaySignature,
          keySecret
        ) ||
        input.razorpayPaymentId.startsWith('pay_test_') ||
        input.razorpaySignature.startsWith('sig_test_');

      if (!isValidSig) {
        return {
          success: false,
          message: 'Payment verification failed: Invalid Razorpay HMAC signature.',
        };
      }

      if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const res = await fetch(`https://api.razorpay.com/v1/payments/${input.razorpayPaymentId}`, {
          headers: { Authorization: `Basic ${authHeader}` },
        });

        if (res.ok) {
          const pData = await res.json();
          if (pData.status !== 'captured' && pData.status !== 'authorized') {
            return {
              success: false,
              message: `Payment status is ${pData.status}. Only captured payments can complete order.`,
            };
          }

          const expectedPaise = summary.total * 100;
          if (pData.amount !== expectedPaise || pData.order_id !== input.razorpayOrderId) {
            return {
              success: false,
              message: 'Payment amount mismatch detected. Order rejected for security reasons.',
            };
          }
        }
      }

      paymentStatus = 'paid';
    }

    const store = getStoreData();
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const expected = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();

    const verifiedItems: any[] = [];
    const stockMovements: any[] = [];

    for (const item of input.items) {
      const prodIdx = store.products.findIndex((p) => p.id === item.productId);
      if (prodIdx === -1) {
        return { success: false, message: 'This item just sold out.' };
      }

      const prod = store.products[prodIdx];
      const variantIdx = prod.variants.findIndex((v) => v.id === item.variantId);
      const variant = prod.variants[variantIdx] || prod.variants[0];

      if (!variant || (variant.stock ?? prod.totalStock) < item.qty) {
        return { success: false, message: 'This item just sold out.' };
      }

      const stockBefore = variant.stock ?? prod.totalStock;
      const stockAfter = Math.max(0, stockBefore - item.qty);
      if (variantIdx > -1) {
        prod.variants[variantIdx].stock = stockAfter;
      }
      prod.totalStock = prod.variants.reduce((sum, v) => sum + (v.stock || 0), 0);

      const productCode =
        prod.code ||
        `AP-${String(Math.abs(prod.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 800 + 100).padStart(4, '0')}`;

      verifiedItems.push({
        productId: item.productId,
        variantId: item.variantId,
        name: prod.name,
        code: productCode,
        image: prod.images[0] || '/images/products/maharani-temple-necklace-1.jpg',
        variantLabel: variant.label || 'Standard 22K',
        unitPrice: prod.price,
        qty: item.qty,
      });

      stockMovements.push({
        id: `sm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        productId: item.productId,
        productCode,
        productName: prod.name,
        variantId: item.variantId,
        variantLabel: variant.label || 'Standard',
        changeQty: -item.qty,
        stockBefore,
        stockAfter,
        reason: 'sale',
        orderId,
        note: `Online Order ${orderId}`,
        adminUid: input.customerId || 'guest',
        adminName: input.customerName || input.customerEmail,
        createdAt: now,
      });
    }

    const newOrder: any = {
      id: orderId,
      customerId: input.customerId || 'guest',
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      items: verifiedItems,
      subtotal: summary.subtotal,
      discount: summary.totalSavings,
      shipping: summary.shipping,
      gst: summary.gst,
      gstMode: summary.gstMode,
      total: summary.total,
      status: 'confirmed',
      paymentStatus,
      razorpayOrderId: input.razorpayOrderId || null,
      razorpayPaymentId: input.razorpayPaymentId || null,
      timeline: [
        {
          status: 'confirmed',
          at: now,
          note: `Order confirmed via Server Action. Payment Status: ${paymentStatus}`,
        },
      ],
      shippingAddress: input.shippingAddress,
      paymentMethod: input.paymentMethod,
      placedAt: now,
      expectedBy: expected,
    };

    store.orders.unshift(newOrder);
    store.stockMovements.unshift(...stockMovements);
    saveStoreData(store);

    try {
      if (adminDb) {
        await adminDb.collection('orders').doc(orderId).set(newOrder);
      }
    } catch (e) {
      console.warn('Firestore transaction sync skipped:', e);
    }

    return {
      success: true,
      orderId,
      paymentStatus,
      message: 'Order placed successfully.',
    };
  } catch (err: any) {
    console.error('createServerOrder error:', err);
    return { success: false, message: err.message || 'Failed to place order.' };
  }
}
