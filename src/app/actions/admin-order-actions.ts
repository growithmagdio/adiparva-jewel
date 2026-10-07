'use server';

import { adminDb } from '@/lib/firebase/admin-config';
import { verifyAdminToken } from '@/lib/firebase/verify-admin-auth';
import { Transaction } from 'firebase-admin/firestore';
import { OrderStatus, StockMovement } from '@/lib/data/types';

/**
 * Server Action: Update Order Status via Admin SDK
 * When order status is changed to 'cancelled' or 'returned',
 * stock is automatically restored with reason 'return' and orderId.
 */
export async function serverUpdateOrderStatus(
  idToken: string,
  orderId: string,
  newStatus: OrderStatus,
  note?: string
) {
  const adminUser = await verifyAdminToken(idToken);
  if (!adminUser.isAdmin && !['Chief Curator', 'Curator', 'Registrar', 'Support'].includes(adminUser.role)) {
    throw new Error('Forbidden: Insufficient permissions to update order status');
  }

  const now = new Date().toISOString();

  try {
    await adminDb.runTransaction(async (transaction: Transaction) => {
      const orderRef = adminDb.collection('orders').doc(orderId);
      const orderDoc = await transaction.get(orderRef);

      if (!orderDoc.exists) {
        throw new Error(`Order ${orderId} not found`);
      }

      const orderData = orderDoc.data()!;
      const oldStatus: OrderStatus = orderData.status;

      // Update Order document
      const timeline = orderData.timeline || [];
      timeline.push({
        status: newStatus,
        at: now,
        note: note || `Status updated to ${newStatus} by ${adminUser.email}`,
      });

      transaction.update(orderRef, {
        status: newStatus,
        timeline,
        updatedAt: now,
      });

      // Stock restoration on cancel/return if previously active
      const isCancellationOrReturn = ['cancelled', 'returned'].includes(newStatus);
      const wasActive = !['cancelled', 'returned'].includes(oldStatus);

      if (isCancellationOrReturn && wasActive && Array.isArray(orderData.items)) {
        for (const item of orderData.items) {
          const prodRef = adminDb.collection('products').doc(item.productId);
          const prodDoc = await transaction.get(prodRef);

          if (prodDoc.exists) {
            const prodData = prodDoc.data()!;
            const variants = prodData.variants || [];
            const targetVariant = variants.find((v: any) => v.id === item.variantId) || variants[0];

            if (targetVariant) {
              const stockBefore = targetVariant.stock || 0;
              const restoreQty = item.qty || 1;
              const stockAfter = stockBefore + restoreQty;

              targetVariant.stock = stockAfter;
              const newTotalStock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);

              transaction.update(prodRef, {
                variants,
                totalStock: newTotalStock,
                updatedAt: now,
              });

              const smId = `sm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
              const movement: StockMovement = {
                id: smId,
                productId: item.productId,
                productCode: prodData.code || `AP-${item.productId.slice(-6)}`,
                productName: prodData.name,
                variantId: targetVariant.id,
                variantLabel: targetVariant.label || 'Standard',
                changeQty: restoreQty,
                stockBefore,
                stockAfter,
                reason: 'return',
                orderId,
                note: `Stock restored on order ${newStatus} (#${orderId})`,
                adminUid: adminUser.uid,
                adminName: adminUser.email || adminUser.role,
                createdAt: now,
              };

              const smRef = adminDb.collection('stockMovements').doc(smId);
              transaction.set(smRef, movement);
            }
          }
        }
      }
    });

    return { success: true, message: `Order status updated to ${newStatus}.` };
  } catch (err: any) {
    console.error('serverUpdateOrderStatus error:', err);
    return { success: false, message: err.message || 'Failed to update order status.' };
  }
}
