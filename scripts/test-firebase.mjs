import fs from 'fs';

// Parse .env.local
try {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  envFile.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.substring(0, eqIdx).trim();
        let val = trimmed.substring(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  });
} catch (e) {}

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCESw6gaDH4Qsj3vlz7wLR5lz9UFmw7DNg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "adiparva-jewel.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "adiparva-jewel",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "adiparva-jewel.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "419765087757",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:419765087757:web:e1e4fe262026ba2cb8ef44",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

async function runClientChecks() {
  console.log('\n=== CHECK 4: COUNT FIRESTORE DOCUMENTS (CLIENT SDK) ===');
  try {
    const catsSnap = await getDocs(collection(db, 'categories'));
    const prodsSnap = await getDocs(collection(db, 'products'));
    const ordersSnap = await getDocs(collection(db, 'orders'));
    const stockSnap = await getDocs(collection(db, 'stockMovements'));

    console.log('Categories count in Firestore:', catsSnap.size);
    console.log('Products count in Firestore:', prodsSnap.size);
    console.log('Orders count in Firestore:', ordersSnap.size);
    console.log('StockMovements count in Firestore:', stockSnap.size);
  } catch (err) {
    console.error('Client SDK Firestore Count Error:', err.message);
  }

  console.log('\n=== CHECK 3: STORAGE (CLIENT SDK) ===');
  try {
    const storageRef = ref(storage, 'images/_healthcheck/test-' + Date.now() + '.txt');
    await uploadString(storageRef, 'Adi Parva Client Storage Healthcheck Test');
    const url = await getDownloadURL(storageRef);
    console.log('Client SDK Storage Upload Success. Download URL:', url);
    await deleteObject(storageRef);
    console.log('Client SDK Storage Delete Success.');
  } catch (err) {
    console.error('Client SDK Storage Error:', err.message);
  }
}

runClientChecks();
