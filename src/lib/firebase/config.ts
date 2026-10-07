import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCESw6gaDH4Qsj3vlz7wLR5lz9UFmw7DNg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "adiparva-jewel.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "adiparva-jewel",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "adiparva-jewel.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "419765087757",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:419765087757:web:e1e4fe262026ba2cb8ef44",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-Y51JKWVMWF",
};

// Initialize Firebase (Singleton pattern to prevent re-initialization on Next.js HMR)
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Services
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// Analytics initialization (Client-side only guard for Next.js SSR)
let analytics: Promise<Analytics | null> = Promise.resolve(null);
if (typeof window !== 'undefined') {
  analytics = isSupported().then((supported) => (supported ? getAnalytics(app) : null));
}

export { app, firebaseConfig, auth, db, storage, analytics };
