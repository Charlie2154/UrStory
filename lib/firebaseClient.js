"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

let firebaseInstance = null;

export default function loadFirebase() {
  if (firebaseInstance) return firebaseInstance;

  // Reuse app if already initialized
  // Build config object so we can log masked values when debugging
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // In development, log a masked API key and whether values are present.
  if (process.env.NODE_ENV !== "production") {
    const mask = (v) => {
      if (!v) return "<<missing>>";
      try {
        if (v.length <= 10) return v;
        return `${v.slice(0, 6)}...${v.slice(-4)}`;
      } catch {
        return "<<invalid>>";
      }
    };

    // Use safe logging — mask most of the key
    // These logs appear in the browser console for client builds
    // (NEXT_PUBLIC_ variables are exposed to the client).
    // Only enable in development.
    // eslint-disable-next-line no-console
    console.info("[debug] Firebase config:", {
      apiKey: mask(firebaseConfig.apiKey),
      authDomain: firebaseConfig.authDomain || "<<missing>>",
      projectId: firebaseConfig.projectId || "<<missing>>",
    });
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

  const auth = getAuth(app);
  const db = getFirestore(app);

  firebaseInstance = { app, auth, db };
  return firebaseInstance;
}
