'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Consolidated configuration with fallback bucket
const finalConfig = {
  ...firebaseConfig,
  storageBucket: firebaseConfig.storageBucket || "studio-998152409-fbf64.firebasestorage.app"
};

// Singleton initialization pattern safe for HMR/Turbopack
const app: FirebaseApp = !getApps().length ? initializeApp(finalConfig) : getApp();
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app as firebaseApp, auth, db, googleProvider };

export function initializeFirebase() {
  return { firebaseApp: app, auth, firestore: db };
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
export { useUser } from './auth/use-user';
