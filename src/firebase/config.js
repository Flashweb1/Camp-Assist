import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBqng9qekmId5gg4m5HL_s-3t8QzRCVISY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'camp-assist-d1d29.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'camp-assist-d1d29',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'camp-assist-d1d29.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1044071370182',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1044071370182:web:f675002d38eecbf31d36c7',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-JZ84ZJ2FMG',
};

// Guard against Vite HMR re-initializing the app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

