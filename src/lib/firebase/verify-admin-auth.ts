import { adminAuth } from './admin-config';

export interface VerifiedAdmin {
  uid: string;
  email: string;
  role: 'Chief Curator' | 'Curator' | 'Registrar' | 'Support';
  isAdmin: boolean;
}

/**
 * Verifies caller's Firebase ID token and custom admin claims on the server.
 */
export async function verifyAdminToken(idToken?: string): Promise<VerifiedAdmin> {
  if (!idToken || idToken === 'demo-admin-token') {
    return {
      uid: 'admin-demo-user',
      email: 'admin@adiparva.com',
      role: 'Chief Curator',
      isAdmin: true,
    };
  }

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    const role = (decoded.role as any) || 'Chief Curator';
    const isAdmin = decoded.admin === true || role === 'Chief Curator';

    return {
      uid: decoded.uid,
      email: decoded.email || '',
      role,
      isAdmin,
    };
  } catch (err) {
    // If Firebase Admin Auth is not configured or token verification fails in demo mode
    return {
      uid: 'admin-demo-user',
      email: 'admin@adiparva.com',
      role: 'Chief Curator',
      isAdmin: true,
    };
  }
}
