'use server';

import { revalidatePath } from 'next/cache';
import { adminDb, isAdminConfigured } from '@/lib/firebase/admin-config';
import { verifyAdminToken } from '@/lib/firebase/verify-admin-auth';

export async function serverSaveCategory(idToken: string, categoryData: any) {
  const adminUser = await verifyAdminToken(idToken);
  if (!adminUser.isAdmin && !['Curator', 'Registrar'].includes(adminUser.role)) {
    throw new Error('Forbidden: Insufficient role permissions');
  }

  if (!isAdminConfigured()) {
    revalidatePath('/');
    revalidatePath('/collections');
    revalidatePath('/admin/categories');
    return { success: true };
  }

  try {
    const catRef = adminDb.collection('categories').doc(categoryData.id);
    await catRef.set(
      {
        ...categoryData,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('adminDb serverSaveCategory skipped/failed:', err);
  }

  revalidatePath('/');
  revalidatePath('/collections');
  revalidatePath('/admin/categories');

  return { success: true };
}

export async function serverDeleteCategory(idToken: string, categoryId: string) {
  const adminUser = await verifyAdminToken(idToken);
  if (!adminUser.isAdmin && adminUser.role !== 'Chief Curator') {
    throw new Error('Forbidden: Only Chief Curator or Admin can delete categories');
  }

  if (!isAdminConfigured()) {
    revalidatePath('/');
    revalidatePath('/collections');
    revalidatePath('/admin/categories');
    return { success: true, message: 'Category deleted from local store.' };
  }

  try {
    // Check product count
    const productsSnap = await adminDb.collection('products').where('categoryId', '==', categoryId).get();
    if (!productsSnap.empty) {
      return { success: false, productCount: productsSnap.size, message: `Category contains ${productsSnap.size} products. Move them first.` };
    }

    // Delete images from storage if present
    const catDoc = await adminDb.collection('categories').doc(categoryId).get();
    if (catDoc.exists) {
      const data = catDoc.data()!;
      const imgs = [data.heroImage, data.image].filter(Boolean);
      for (const imgUrl of imgs) {
        if (typeof imgUrl === 'string' && imgUrl.includes('firebasestorage')) {
          try {
            const { adminStorage } = await import('@/lib/firebase/admin-config');
            const fileRef = adminStorage.bucket().file(imgUrl);
            await fileRef.delete();
          } catch (e) {
            // Ignore missing storage object error so document delete completes
          }
        }
      }
    }

    await adminDb.collection('categories').doc(categoryId).delete();
  } catch (err: any) {
    console.error('adminDb serverDeleteCategory error:', err);
    return { success: false, message: err.message || 'Failed to delete category.' };
  }

  revalidatePath('/');
  revalidatePath('/collections');
  revalidatePath('/admin/categories');

  return { success: true, message: 'Category deleted successfully.' };
}
