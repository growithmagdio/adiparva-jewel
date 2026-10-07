/**
 * Script: Set Admin Custom Claims
 * Usage: node scripts/set-admin.mjs <user-email>
 * Example: node scripts/set-admin.mjs admin@adiparva.com
 */

import * as admin from 'firebase-admin';

const targetEmail = process.argv[2];

if (!targetEmail) {
  console.error('Usage: node scripts/set-admin.mjs <user-email>');
  process.exit(1);
}

// Initialize Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "adiparva-jewel",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk@adiparva-jewel.iam.gserviceaccount.com",
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, '\n'),
    }),
  });
}

async function setAdminClaims() {
  try {
    const user = await admin.auth().getUserByEmail(targetEmail);
    const customClaims = {
      admin: true,
      role: 'Chief Curator',
    };

    await admin.auth().setCustomUserClaims(user.uid, customClaims);
    console.log(`[Success] Custom claims { admin: true, role: 'Chief Curator' } set for user: ${targetEmail} (UID: ${user.uid})`);
    process.exit(0);
  } catch (error) {
    console.error(`[Error] Failed to set custom claims for ${targetEmail}:`, error.message);
    process.exit(1);
  }
}

setAdminClaims();
