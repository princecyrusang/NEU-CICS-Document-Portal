'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Manual bucket override is maintained for reference, but Storage use is being removed from logic
const finalConfig = {
  ...firebaseConfig,
  storageBucket: "studio-998152409-fbf64.firebasestorage.app"
};

// Initialize Firebase App instance safely for SSR and CSR
let firebaseApp: FirebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(finalConfig);
} else {
  firebaseApp = getApp();
}

// Export standard service instances
export const auth: Auth = getAuth(firebaseApp);
export const db: Firestore = getFirestore(firebaseApp);
// Storage export is kept for types/initialization safety but its usage is removed from UI
export const googleProvider = new GoogleAuthProvider();

// Standard initialization function for the provider
export function initializeFirebase() {
  return { firebaseApp, auth, firestore: db };
}

// Barrel re-exports
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';

// Use the specialized useUser hook that returns { user, loading }
export { useUser } from './auth/use-user';
