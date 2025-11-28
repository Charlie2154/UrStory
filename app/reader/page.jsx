"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ReaderPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = [
    { id: "trending", emoji: "🔥", label: "Trending Stories (coming soon)" },
    { id: "upvoted", emoji: "⭐", label: "Most Upvoted" },
    { id: "new", emoji: "📖", label: "New Chapters" },
    { id: "characters", emoji: "👥", label: "Stories with Most Characters" },
    { id: "famous", emoji: "👑", label: "Famous Personalities" },
  ];

  useEffect(() => {
    async function load() {
      try {
        const loadFirebase = (await import("../../lib/firebaseClient")).default;
        const { db } = await loadFirebase();

        const { collection, query, orderBy, getDocs } =
          await import("firebase/firestore");

        const q = query(collection(db, "stories"), orderBy("timestamp", "asc"));
        const snapshot = await getDocs(q);

        setStories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error loading stories:", err);
      }

      setLoading(false);
    }

    load();
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Constellation background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => {
          const size = Math.random() > 0.7 ? 'w-1.5 h-1.5' : 'w-1 h-1';
          const initialX = typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1920;
          const initialY = typeof window !== 'undefined' ? Math.random() * window.innerHeight : Math.random() * 1080;
          
          return (
            <motion.div
              key={i}
              className={`absolute ${size} bg-white rounded-full`}
              style={{ left: initialX, top: initialY }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 3 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2
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
          <Link href="/" className="text-blue-300 hover:text-blue-200 font-medium transition flex items-center gap-2">
            <span>←</span> Back to Portal
          </Link>
          <Link href="/write" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-medium transition shadow-lg hover:shadow-blue-500/50">
            ✍️ Write Your Story
          </Link>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            The Constellation of Stories
          </h1>
          <p className="text-blue-200/80 text-lg md:text-xl max-w-3xl mx-auto">
            Each star is a soul who found their voice. Find the stories that echo your own unspoken truths.
          </p>
        </motion.div>
      
        {/* Connection message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12 p-8 rounded-2xl bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-400/30 backdrop-blur-sm"
        >
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <span className="text-3xl">🤝</span>
            <span>Connect Beyond the Surface</span>
          </h2>
          <p className="text-blue-200/80 leading-relaxed mb-4">
            Your connection here is with the <strong className="text-blue-100">unfiltered human spirit</strong>—with someone's honest story, not their professional title, social status, or appearance.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl mb-2">💫</div>
              <h3 className="text-white font-semibold mb-1">Deep Connection</h3>
              <p className="text-blue-200/60 text-sm">See their struggles and victories first</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl mb-2">🌈</div>
              <h3 className="text-white font-semibold mb-1">No Bias</h3>
              <p className="text-blue-200/60 text-sm">Connect free from judgment</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl mb-2">✨</div>
              <h3 className="text-white font-semibold mb-1">Shared Truth</h3>
              <p className="text-blue-200/60 text-sm">Bonds through emotional experience</p>
            </div>
          </div>
        </motion.div>

        {/* Category Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-12"
        >
          {categories.map((cat, index) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`p-4 rounded-xl font-medium text-center transition-all duration-300 ${
                selectedCategory === cat.id
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50 scale-105"
                  : "bg-white/10 backdrop-blur-sm text-blue-200 hover:bg-white/20 border border-white/10"
              }`}
            >
              <span className="text-2xl mr-2">{cat.emoji}</span>
              {cat.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Stories List */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="inline-block animate-pulse text-blue-300 text-lg">Loading constellation of stories...</div>
          </motion.div>
        )}

        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            {stories.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="text-6xl mb-4">✨</div>
                <p className="text-blue-200 text-lg mb-4">No stories yet in this constellation.</p>
                <Link
                  href="/write"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-medium transition shadow-lg"
                >
                  Be the First Star →
                </Link>
              </div>
            ) : (
              stories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <Link
                    href={`/story/${story.id}`}
                    className="group block p-6 rounded-2xl bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-400/30 hover:border-blue-400/60 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-yellow-400">⭐</span>
                          <h2 className="text-xl font-semibold text-white group-hover:text-blue-200 transition">
                            {story.title || "Untitled Story"}
                          </h2>
                        </div>
                        <p className="text-blue-200/70 line-clamp-2">
                          {story.text?.slice(0, 150)}...
                        </p>
                      </div>
                      <div className="text-blue-300 group-hover:translate-x-1 transition-transform">
                        →
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
}
