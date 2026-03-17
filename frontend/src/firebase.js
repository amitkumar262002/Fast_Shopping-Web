/**
 * Fast Shopping — Firebase v4.0
 * Auth: Email/Password + Google Sign-In
 * Realtime DB: Order tracking, notifications
 */
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
    sendPasswordResetEmail,
    onAuthStateChanged
} from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDkr6wYBUm8uRJjmukMSzwOPBivdOS2314",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fast-shopping-76cff.firebaseapp.com",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://fast-shopping-76cff-default-rtdb.firebaseio.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fast-shopping-76cff",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "fast-shopping-76cff.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "712353400797",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:712353400797:web:03b6ebab166a3ceede1834"
};

const app = initializeApp(firebaseConfig);

// ─── EXPORTS ──────────────────────────────────────────────────────────────────
export const rtdb = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: 'select_account' });

// ─── AUTH HELPERS ─────────────────────────────────────────────────────────────
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const signInWithEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

export const registerWithEmail = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

export const updateFirebaseProfile = (displayName, photoURL) =>
    updateProfile(auth.currentUser, { displayName, photoURL });

export const firebaseSignOut = () => signOut(auth);

export const resetPassword = (email) => sendPasswordResetEmail(auth, email);

export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

export default app;
