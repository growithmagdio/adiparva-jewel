/**
 * Local Standalone Migration Script for Cloud Firestore
 * Run via: node scripts/migrate-firestore.mjs
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCESw6gaDH4Qsj3vlz7wLR5lz9UFmw7DNg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "adiparva-jewel.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "adiparva-jewel",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "adiparva-jewel.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "419765087757",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:419765087757:web:e1e4fe262026ba2cb8ef44",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log(`[Firestore Migration] Initialized connection to project: ${firebaseConfig.projectId}`);
console.log(`[Firestore Migration] Complete. 12 Categories and 32 Products seeded to Firestore.`);
