import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBqng9qekmId5gg4m5HL_s-3t8QzRCVISY",
  authDomain: "camp-assist-d1d29.firebaseapp.com",
  projectId: "camp-assist-d1d29",
  storageBucket: "camp-assist-d1d29.firebasestorage.app",
  messagingSenderId: "1044071370182",
  appId: "1:1044071370182:web:f675002d38eecbf31d36c7",
  measurementId: "G-JZ84ZJ2FMG"
};

// Guard against Vite HMR re-initializing the app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

