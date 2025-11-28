"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  // Login/sign-up temporarily disabled. Keep UI as placeholder but show "Coming soon" on actions.
  const [isSignUp, setIsSignUp] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    alert("Coming soon — sign in/sign up is temporarily disabled.");
  }

  return (
    <main className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => {
          const initialX = typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1920;
          const initialY = typeof window !== 'undefined' ? Math.random() * window.innerHeight : Math.random() * 1080;
          
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-30"
              initial={{ x: initialX, y: initialY }}
              animate={{
                y: [initialY, initialY - 50, initialY],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo/Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.h1
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl font-bold text-white mb-2 drop-shadow-2xl"
          >
            U
          </motion.h1>
          <p className="text-purple-200">Every person has a story</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {isSignUp ? "Create Your Account" : "Welcome Back"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-purple-200 font-medium mb-2">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-purple-300/50 backdrop-blur-sm transition"
              />
            </div>

            <div>
              <label className="block text-purple-200 font-medium mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-purple-300/50 backdrop-blur-sm transition"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium py-3 rounded-xl transition shadow-lg hover:shadow-purple-500/50 mt-6"
            >
              {isSignUp ? "Sign Up" : "Sign In"}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-purple-200/80 text-sm">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-2 text-purple-300 hover:text-white font-medium transition"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </motion.div>

        {/* Back Home Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <Link href="/" className="text-purple-300 hover:text-white transition flex items-center justify-center gap-2">
            <span>←</span>
            <span>Back to Portal</span>
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
