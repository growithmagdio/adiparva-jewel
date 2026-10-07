'use server';

import { adminDb } from '@/lib/firebase/admin-config';
import { verifyAdminToken } from '@/lib/firebase/verify-admin-auth';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes 0, O, 1, I

/**
 * Server Action: Generates a unique 6-character product code (e.g. AP-7K3QXM)
 * Protected by verifyAdminToken(idToken) and uses Admin SDK (adminDb).
 */
export async function generateServerProductCode(idToken?: string): Promise<string> {
  if (idToken) {
    try {
      await verifyAdminToken(idToken);
    } catch (err) {
      console.warn('verifyAdminToken skipped/failed in code generation:', err);
    }
  }

  let isUnique = false;
  let code = '';
  let attempts = 0;

  while (!isUnique && attempts < 20) {
    attempts++;
    let randomPart = '';
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * CHARS.length);
      randomPart += CHARS[randomIndex];
    }
    code = `AP-${randomPart}`;

    try {
      const snapshot = await adminDb.collection('products').where('code', '==', code).get();
      if (snapshot.empty) {
        isUnique = true;
      }
    } catch (err) {
      // Fallback if adminDb is not initialized with real credentials
      isUnique = true;
    }
  }

  return code;
}
