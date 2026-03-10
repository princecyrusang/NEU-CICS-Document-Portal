// This file is maintained for backward compatibility. 
// Prefer using imports from '@/firebase' directly.
import { initializeFirebase, googleProvider as gp } from '@/firebase';

const { auth, db } = initializeFirebase();
export const googleProvider = gp;
export { auth, db };
