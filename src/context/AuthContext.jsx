/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [role, setRole] = useState(null); // 'corps_member' | 'vendor'
  const [loading, setLoading] = useState(true);

  async function registerCorpsMember(email, password, profileData) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const userData = {
      uid: user.uid,
      role: 'corps_member',
      email,
      ...profileData,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', user.uid), { uid: user.uid, role: 'corps_member', email });
    await setDoc(doc(db, 'corps_members', user.uid), userData);
    return user;
  }

  async function registerVendor(email, password, profileData) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const userData = {
      uid: user.uid,
      role: 'vendor',
      email,
      ...profileData,
      isAvailable: true,
      rating: 0,
      totalRatings: 0,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', user.uid), { uid: user.uid, role: 'vendor', email });
    await setDoc(doc(db, 'vendors', user.uid), userData);
    return user;
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await signOut(auth);
    setUserProfile(null);
    setRole(null);
  }

  async function loadProfile(uid) {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return;
    const userRole = userDoc.data().role;
    setRole(userRole);
    if (userRole === 'admin') {
      setUserProfile({ role: 'admin' });
      return;
    }
    const collection = userRole === 'vendor' ? 'vendors' : 'corps_members';
    const profileDoc = await getDoc(doc(db, collection, uid));
    if (profileDoc.exists()) setUserProfile(profileDoc.data());
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          await loadProfile(user.uid);
        } catch (err) {
          console.error("Failed to load user profile:", err);
        }
      } else {
        setUserProfile(null);
        setRole(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = {
    currentUser,
    userProfile,
    role,
    loading,
    login,
    logout,
    registerCorpsMember,
    registerVendor,
    loadProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
