"use client";

import { useEffect, useState } from "react";
import loadFirebase from "../../lib/firebaseClient";

function mask(v) {
  if (!v) return "<<missing>>";
  try {
    if (v.length <= 10) return v;
    return `${v.slice(0, 6)}...${v.slice(-4)}`;
  } catch {
    return "<<invalid>>";
  }
}

export default function DebugPage() {
  const [cfg, setCfg] = useState({});
  const [initStatus, setInitStatus] = useState("");

  useEffect(() => {
    const raw = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    setCfg({
      apiKey: mask(raw.apiKey),
      authDomain: raw.authDomain || "<<missing>>",
      projectId: raw.projectId || "<<missing>>",
      storageBucket: raw.storageBucket || "<<missing>>",
      messagingSenderId: raw.messagingSenderId || "<<missing>>",
      appId: raw.appId || "<<missing>>",
    });

    // Try to initialize firebase and report result
    try {
      const inst = loadFirebase();
      if (inst && inst.app) {
        setInitStatus("Firebase initialized successfully (client)");
      } else {
        setInitStatus("Firebase did not return an app instance");
      }
    } catch (err) {
      setInitStatus(`Initialization error: ${err.message}`);
    }
  }, []);

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug: Firebase Client</h1>

      <p className="mb-4 text-sm text-slate-600">
        This page shows masked values for your public Firebase environment variables and whether the client initialization succeeded.
        The full API key is not displayed for safety.
      </p>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="font-semibold mb-2">Masked Config</h2>
        <dl className="grid grid-cols-1 gap-y-2 text-sm text-slate-700">
          <div><strong>API Key:</strong> <span className="ml-2">{cfg.apiKey}</span></div>
          <div><strong>Auth Domain:</strong> <span className="ml-2">{cfg.authDomain}</span></div>
          <div><strong>Project ID:</strong> <span className="ml-2">{cfg.projectId}</span></div>
          <div><strong>Storage Bucket:</strong> <span className="ml-2">{cfg.storageBucket}</span></div>
          <div><strong>Messaging Sender ID:</strong> <span className="ml-2">{cfg.messagingSenderId}</span></div>
          <div><strong>App ID:</strong> <span className="ml-2">{cfg.appId}</span></div>
        </dl>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="font-semibold mb-2">Initialization Status</h2>
        <p className="text-sm text-slate-700">{initStatus}</p>
      </div>

      <p className="mt-6 text-xs text-slate-500">Remember to not share your full API key publicly. If the API key shows as &lt;&lt;missing&gt;&gt;, your `.env.local` value is not loaded client-side.</p>
    </main>
  );
}
