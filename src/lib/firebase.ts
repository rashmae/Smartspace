import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  type User,
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with configured databaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth
export const auth = getAuth(app);
auth.useDeviceLanguage();

// Google Auth Provider (account selection prompt for shared campus workstations)
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export function isEmbeddedIframe(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export async function signInWithGooglePopup(): Promise<User> {
  const credential = await signInWithPopup(auth, googleProvider);
  if (!credential.user) {
    throw new Error('Authentication did not return a user profile.');
  }
  return credential.user;
}

export async function signInWithGoogleRedirectFallback(): Promise<void> {
  await signInWithRedirect(auth, googleProvider);
}

export async function consumeGoogleRedirectResult(): Promise<User | null> {
  if (isEmbeddedIframe()) return null;
  try {
    const result = await getRedirectResult(auth);
    return result?.user ?? null;
  } catch {
    return null;
  }
}

export function formatFirebaseAuthError(error: unknown): string {
  const rawMessage = error instanceof Error ? error.message : String(error || 'Google Sign-In failed.');
  const codeFromProp =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code || '')
      : '';
  const codeMatch = rawMessage.match(/\(auth\/([a-z0-9-]+)\)/i);
  const code = codeFromProp || (codeMatch ? `auth/${codeMatch[1]}` : '');
  const host = typeof window !== 'undefined' ? window.location.hostname : 'this domain';

  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing authentication. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'A sign-in popup is already open or was superseded. Please complete or close it and try again.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the Google sign-in popup. Please allow popups for this site and try again.';
    case 'auth/unauthorized-domain':
      return `Domain "${host}" is not yet authorized in Firebase Authentication. Add "${host}" under Firebase Console → Authentication → Settings → Authorized domains.`;
    case 'auth/network-request-failed':
      return 'Network error while contacting Google/Firebase Authentication. Check your internet connection or disable strict content blockers and try again.';
    case 'auth/operation-not-supported-in-this-environment':
      return 'This browser environment blocks popup storage. Open the app in a standard browser tab with cookies/popups enabled.';
    case 'auth/internal-error':
      return `Google authentication failed to initialize on "${host}" (auth/internal-error). Ensure "${host}" is added to Firebase Authorized Domains, allow popups/third-party auth scripts (apis.google.com & ${firebaseConfig.authDomain}), and disable strict Safari/content-blocker interference for this site.`;
    default:
      return rawMessage;
  }
}

export async function signOutFromFirebase(): Promise<void> {
  await signOut(auth);
}

// Operational Error Handling adhering to Firestore Security Architecture
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connectivity on initial boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline or connecting.');
    }
    return false;
  }
}

// Run connection verification
testFirestoreConnection().catch((err) => {
  console.warn('Firestore initial connection probe:', err);
});
