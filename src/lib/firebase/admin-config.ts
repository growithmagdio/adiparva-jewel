import { getApps, getApp, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "adiparva-jewel";
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk@adiparva-jewel.iam.gserviceaccount.com";
const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY || "";
const privateKey = rawPrivateKey.replace(/\\n/g, '\n');
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "adiparva-jewel.firebasestorage.app";

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  const isValidPrivateKey =
    privateKey.includes('-----BEGIN PRIVATE KEY-----') &&
    !privateKey.includes('...') &&
    privateKey.length > 100;

  try {
    if (isValidPrivateKey) {
      return initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket,
      });
    } else {
      return initializeApp({
        projectId,
        storageBucket,
      });
    }
  } catch (err) {
    console.warn('Firebase Admin SDK fallback initialization:', err);
    return initializeApp({ projectId }, 'fallback-app-' + Date.now());
  }
}

const app = getAdminApp();

export function isAdminConfigured(): boolean {
  return Boolean(
    privateKey.includes('-----BEGIN PRIVATE KEY-----') &&
    !privateKey.includes('...') &&
    privateKey.length > 100
  );
}

export const adminDb: Firestore = getFirestore(app);
export const adminAuth: Auth = getAuth(app);
export const adminStorage: Storage = getStorage(app);
