"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function WritePage() {
  const options = [
    {
      id: "new-chapter",
      title: "🔥 Start New Chapter",
      description: "Begin a brand new story with AI assistance.",
      href: "/write/select-type",
      color: "emerald",
      available: true
    },
    {
      id: "continue",
      title: "📖 Continue My Story",
      description: "Pick up where you left off and keep building.",
      href: "#",
      color: "blue",
      available: false
    },
    {
      id: "my-chapters",
      title: "📚 My Chapters",
      description: "View and manage all your stories and drafts.",
      href: "#",
      color: "purple",
      available: false
    },
    {
      id: "ai-assistant",
      title: "🤖 AI Writing Assistant",
      description: "Get help brainstorming and improving your stories.",
      href: "#",
      color: "amber",
      available: false
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900">
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => {
          const initialX = typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1920;
          const initialY = typeof window !== 'undefined' ? Math.random() * window.innerHeight : Math.random() * 1080;
          
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-emerald-400 rounded-full opacity-20"
              initial={{ x: initialX, y: initialY }}
              animate={{
                y: [initialY, initialY - 100, initialY],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          );
        })}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-12"
        >
          <Link href="/" className="text-emerald-300 hover:text-emerald-200 font-medium transition flex items-center gap-2">
            <span>←</span> Back to Portal
          </Link>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Your Sacred Writing Space
          </h1>
          <p className="text-emerald-200/80 text-lg md:text-xl max-w-2xl mx-auto">
            Choose how you want to begin your journey of expression
          </p>
        </motion.div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {options.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Link
                href={option.available ? option.href : "#"}
                className={`group relative block p-8 rounded-2xl border-2 transition-all duration-300 ${
                  option.available
                    ? "bg-gradient-to-br from-emerald-800/40 to-teal-800/40 border-emerald-400/30 hover:border-emerald-400/60 hover:shadow-2xl hover:shadow-emerald-500/20"
                    : "bg-gradient-to-br from-slate-800/40 to-slate-700/40 border-slate-600/30 cursor-not-allowed opacity-60"
                }`}
              >
                {/* Glow effect on hover */}
                {option.available && (
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/10 group-hover:to-teal-500/10 rounded-2xl transition-all duration-300" />
                )}

                <div className="relative z-10">
                  <div className="text-4xl mb-4">{option.title.split(' ')[0]}</div>
                  <h2 className="text-2xl font-bold text-white mb-3">
                    {option.title.substring(option.title.indexOf(' ') + 1)}
                  </h2>
                  <p className={option.available ? "text-emerald-200/70" : "text-slate-400/70"}>
                    {option.description}
                  </p>
                  
                  <div className="mt-6">
                    {option.available ? (
                      <div className="inline-flex items-center gap-2 text-emerald-300 font-medium group-hover:gap-3 transition-all">
                        <span>Begin Your Story</span>
                        <span>→</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 text-slate-500 font-medium">
                        <span>Coming Soon</span>
                        <span className="text-xs">✨</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ripple effect for available options */}
                {option.available && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <motion.div
                      className="absolute inset-0 border-2 border-emerald-400 rounded-2xl"
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.05, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-16"
        >
          <p className="text-emerald-300/60 text-sm">
            ✨ Every story begins with a single word. Start yours today.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
