"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import loadFirebase from "../lib/firebaseClient";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function AuthHeader() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const { auth } = loadFirebase();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function handleLogout() {
    try {
      const { auth } = loadFirebase();
      await signOut(auth);
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  if (loading) return null;

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-teal-600"></div>

        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition text-sm"
            >
              Logout
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={() => alert('Coming soon — sign in temporarily disabled')}
              className="px-4 py-2 bg-teal-600 hover:bg-emerald-600 text-white rounded-lg font-medium transition text-sm"
            >
              Login
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
