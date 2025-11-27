"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  // Login/sign-up temporarily disabled. Keep UI as placeholder but show "Coming soon" on actions.
  const [isSignUp, setIsSignUp] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    alert("Coming soon — sign in/sign up is temporarily disabled.");
  }

  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-teal-600 to-emerald-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">U</h1>
          <p className="text-teal-200">Every person has a story</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            {isSignUp ? "Create Your Account" : "Welcome Back"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-700 font-medium mb-2">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-emerald-600 text-white font-medium py-2 rounded-lg transition mt-6"
            >
              {isSignUp ? "Sign Up" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-slate-600 text-sm">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-2 text-teal-600 hover:text-emerald-600 font-medium"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </div>

        {/* Back Home Link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-teal-200 hover:text-white transition">
            ← Back Home
          </Link>
        </div>
      </div>
    </main>
  );
}
