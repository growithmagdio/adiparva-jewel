'use server';

import { adminDb, adminStorage, isAdminConfigured } from '@/lib/firebase/admin-config';
import { verifyAdminToken } from '@/lib/firebase/verify-admin-auth';
import { generateServerProductCode } from './product-code';
import { Transaction } from 'firebase-admin/firestore';
import { StockMovementReason, StockMovement } from '@/lib/data/types';

export interface ExecuteStockMovementInput {
  productId: string;
  variantId: string;
  changeQty: number; // positive or negative
  reason: StockMovementReason;
  orderId?: string;
  note?: string;
}

/**
 * Single Unified Server Action for Every Stock Movement via Admin SDK & Firestore Transaction
 * Enforces role authorization (Chief Curator, Curator, Registrar, admin).
 * Ensures stock can NEVER go below 0.
 */
export async function serverExecuteStockMovement(idToken: string, input: ExecuteStockMovementInput) {
  const adminUser = await verifyAdminToken(idToken);
  if (!adminUser.isAdmin && !['Chief Curator', 'Curator', 'Registrar'].includes(adminUser.role)) {
    throw new Error('Forbidden: Insufficient permissions to manage stock');
  }

  const { productId, variantId, changeQty, reason, orderId, note } = input;
  const now = new Date().toISOString();

  let resultMovement: StockMovement | null = null;
  let updatedTotalStock = 0;

  try {
    await adminDb.runTransaction(async (transaction: Transaction) => {
      const prodRef = adminDb.collection('products').doc(productId);
      const prodDoc = await transaction.get(prodRef);

      if (!prodDoc.exists) {
        throw new Error(`Product ${productId} not found`);
      }

      const prodData = prodDoc.data()!;
      const variants = prodData.variants || [];
      const variantIndex = variants.findIndex((v: any) => v.id === variantId);

      if (variantIndex === -1 && variants.length === 0) {
        throw new Error(`Variant ${variantId} not found in product`);
      }

      const targetVariant = variantIndex > -1 ? variants[variantIndex] : variants[0];
      const stockBefore = targetVariant.stock || 0;
      const stockAfter = stockBefore + changeQty;

      if (stockAfter < 0) {
        throw new Error(`Invalid stock change: stock cannot fall below 0. (Current: ${stockBefore}, Requested change: ${changeQty})`);
      }

      targetVariant.stock = stockAfter;
      updatedTotalStock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);

      transaction.update(prodRef, {
        variants,
        totalStock: updatedTotalStock,
        updatedAt: now,
      });

      const smId = `sm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const movement: StockMovement = {
        id: smId,
        productId,
        productCode: prodData.code || `AP-${productId.slice(-6)}`,
        productName: prodData.name,
        variantId: targetVariant.id,
        variantLabel: targetVariant.label || targetVariant.metal || 'Standard',
        changeQty,
        stockBefore,
        stockAfter,
        reason,
        orderId: orderId || undefined,
        note: note || undefined,
        adminUid: adminUser.uid,
        adminName: adminUser.email || adminUser.role,
        createdAt: now,
      };

      const smRef = adminDb.collection('stockMovements').doc(smId);
      transaction.set(smRef, movement);

      resultMovement = movement;
    });

    return {
      success: true,
      totalStock: updatedTotalStock,
      movement: resultMovement,
      message: 'Stock updated successfully.',
    };
  } catch (err: any) {
    console.error('serverExecuteStockMovement error:', err);
    return {
      success: false,
      message: err.message || 'Failed to update stock.',
    };
  }
}

/**
 * Server Action: Create Product via Admin SDK with Opening Stock Initial Movement
 */
export async function serverCreateProduct(idToken: string, productData: any) {
  const adminUser = await verifyAdminToken(idToken);
  if (!adminUser.isAdmin && !['Chief Curator', 'Curator', 'Registrar'].includes(adminUser.role)) {
    throw new Error('Forbidden: Insufficient permissions to create products');
  }

  const code = productData.code || (await generateServerProductCode(idToken));
  const newId = `prod-${Date.now()}`;
  const now = new Date().toISOString();

  const variants = productData.variants || [
    {
      id: `var-${Date.now()}-1`,
      label: 'Standard Edition',
      metal: '22K gold',
      priceDelta: 0,
      stock: productData.totalStock || 10,
      sku: `${code}-VAR1`,
    },
  ];

  const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);

  const newProduct = {
    ...productData,
    id: newId,
    code,
    variants,
    totalStock,
    lowStockThreshold: productData.lowStockThreshold || 3,
    createdAt: now,
    updatedAt: now,
  };

  await adminDb.collection('products').doc(newId).set(newProduct);

  // Log opening stock "initial" movements for variants
  for (const v of variants) {
    if ((v.stock || 0) > 0) {
      const smId = `sm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      await adminDb.collection('stockMovements').doc(smId).set({
        id: smId,
        productId: newId,
        productCode: code,
        productName: newProduct.name,
        variantId: v.id,
        variantLabel: v.label,
        changeQty: v.stock,
        stockBefore: 0,
        stockAfter: v.stock,
        reason: 'initial',
        note: 'Opening stock on product creation',
        adminUid: adminUser.uid,
        adminName: adminUser.email || adminUser.role,
        createdAt: now,
      });
    }
  }

  // Update Category piece count
  if (productData.categoryId) {
    try {
      const catRef = adminDb.collection('categories').doc(productData.categoryId);
      const catDoc = await catRef.get();
      if (catDoc.exists) {
        const curCount = catDoc.data()?.pieceCount || 0;
        await catRef.update({ pieceCount: curCount + 1, updatedAt: now });
      }
    } catch (e) { }
  }

  revalidatePath('/');
  revalidatePath('/collections');
  revalidatePath('/piece/[slug]', 'page');
  revalidatePath('/admin/products');
  revalidatePath('/admin/inventory');

  return { success: true, product: newProduct };
}

/**
 * Server Action: Edit / Update Product via Admin SDK
 */
export async function serverUpdateProduct(idToken: string, productData: any) {
  const adminUser = await verifyAdminToken(idToken);
  if (!adminUser.isAdmin && !['Chief Curator', 'Curator', 'Registrar'].includes(adminUser.role)) {
    throw new Error('Forbidden: Insufficient permissions to edit products');
  }

  const prodRef = adminDb.collection('products').doc(productData.id);
  const now = new Date().toISOString();

  await prodRef.set(
    {
      ...productData,
      updatedAt: now,
    },
    { merge: true }
  );

  revalidatePath('/');
  revalidatePath('/collections');
  revalidatePath('/piece/[slug]', 'page');
  revalidatePath('/admin/products');
  revalidatePath('/admin/inventory');

  return { success: true, message: 'Product updated successfully' };
}

/**
 * Legacy Adjust Stock Action — Delegates to serverExecuteStockMovement
 */
export async function serverAdjustStock(
  idToken: string,
  productId: string,
  variantId: string,
  newStock: number,
  reasonStr: string
) {
  const prodRef = adminDb.collection('products').doc(productId);
  const prodDoc = await prodRef.get();
  if (!prodDoc.exists) throw new Error('Product not found');

  const prodData = prodDoc.data()!;
  const variant = (prodData.variants || []).find((v: any) => v.id === variantId) || prodData.variants?.[0];
  const oldStock = variant ? variant.stock : 0;
  const changeQty = newStock - oldStock;

  const validReason: StockMovementReason =
    reasonStr === 'damaged' ? 'damaged' : reasonStr === 'restock' ? 'restock' : 'adjustment';

  return serverExecuteStockMovement(idToken, {
    productId,
    variantId,
    changeQty,
    reason: validReason,
    note: reasonStr,
  });
}

import { revalidatePath } from 'next/cache';

/**
 * Server Action: Delete Product via Admin SDK
 * Only Admin or Chief Curator permitted
 */
export async function serverDeleteProduct(idToken: string, productId: string) {
  const adminUser = await verifyAdminToken(idToken);
  if (!adminUser.isAdmin && adminUser.role !== 'Chief Curator') {
    throw new Error('Forbidden: Only Chief Curator or Admin can delete products');
  }

  try {
    const ordersSnap = await adminDb.collection('orders').get();
    let inPastOrders = false;
    ordersSnap.forEach((doc: any) => {
      const data = doc.data();
      if (data.items?.some((i: any) => i.productId === productId)) {
        inPastOrders = true;
      }
    });

    if (inPastOrders) {
      await adminDb.collection('products').doc(productId).update({
        status: 'archived',
        updatedAt: new Date().toISOString(),
      });

      revalidatePath('/');
      revalidatePath('/collections');
      revalidatePath('/piece/[slug]', 'page');
      revalidatePath('/admin/products');
      revalidatePath('/admin/inventory');

      return { success: true, archived: true, message: 'Product appears in past orders and was safely archived.' };
    }

    const prodDoc = await adminDb.collection('products').doc(productId).get();
    if (prodDoc.exists) {
      const prodData = prodDoc.data()!;
      for (const imgUrl of prodData.images || []) {
        if (typeof imgUrl === 'string' && imgUrl.includes('firebasestorage')) {
          try {
            const fileRef = adminStorage.bucket().file(imgUrl);
            await fileRef.delete();
          } catch (e) {
            // Ignore missing storage object error so document delete completes
          }
        }
      }
    }

    await adminDb.collection('products').doc(productId).delete();
  } catch (err: any) {
    console.error('adminDb serverDeleteProduct error:', err);
    return { success: false, archived: false, message: err.message || 'Failed to delete product.' };
  }

  revalidatePath('/');
  revalidatePath('/collections');
  revalidatePath('/piece/[slug]', 'page');
  revalidatePath('/admin/products');
  revalidatePath('/admin/inventory');

  return { success: true, archived: false, message: 'Product deleted successfully.' };
}
