"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [hoveredDoor, setHoveredDoor] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const whispers = {
    write: ["You're not alone...", "Your story matters...", "It's safe here..."],
    read: ["Find your reflection...", "Someone understands...", "You're home..."]
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => {
          const initialX = typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1920;
          const initialY = typeof window !== 'undefined' ? Math.random() * window.innerHeight : Math.random() * 1080;
          const targetX = typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1920;
          const targetY = typeof window !== 'undefined' ? Math.random() * window.innerHeight : Math.random() * 1080;
          
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-30"
              initial={{
                x: initialX,
                y: initialY
              }}
              animate={{
                x: targetX,
                y: targetY,
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          );
        })}
      </div>      {/* Cursor glow effect */}
      <motion.div
        className="fixed w-96 h-96 rounded-full pointer-events-none mix-blend-screen"
        style={{
          background: "radial-gradient(circle, rgba(100,200,255,0.15) 0%, transparent 70%)",
          left: mousePos.x - 192,
          top: mousePos.y - 192,
        }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Login button */}
      <div className="absolute top-6 right-6 z-50">
        <Link 
          href="/login" 
          className="px-6 py-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-lg font-medium transition border border-white/20 shadow-lg"
        >
          Login
        </Link>
      </div>

      {/* Welcome message */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-center z-40"
          >
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 drop-shadow-2xl">
              U
            </h1>
            <p className="text-white/80 text-xl md:text-2xl">
              Are you ready to see your story transformed?
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Two doors container */}
      <div className="flex items-center justify-center min-h-screen px-4 gap-8 md:gap-16">
        {/* Write Door - "Enter for Yourself" */}
        <Link href="/write" className="group relative">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 3.5, duration: 0.8 }}
            onMouseEnter={() => setHoveredDoor("write")}
            onMouseLeave={() => setHoveredDoor(null)}
            className="relative"
          >
            {/* Door frame */}
            <div className="relative w-64 h-96 md:w-80 md:h-[32rem] rounded-3xl overflow-hidden border-4 border-emerald-400/30 bg-gradient-to-b from-emerald-900/40 to-teal-900/40 backdrop-blur-sm shadow-2xl transition-all duration-500 group-hover:border-emerald-400/60 group-hover:shadow-emerald-500/50">
              
              {/* Door glow */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-emerald-500/20 to-transparent"
                animate={{
                  opacity: hoveredDoor === "write" ? [0.3, 0.6, 0.3] : 0.2
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Door content */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center">
                <motion.div
                  animate={{
                    scale: hoveredDoor === "write" ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className="text-6xl mb-6"
                >
                  
                </motion.div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Enter for<br />Yourself
                </h2>
                
                <p className="text-emerald-200/80 text-sm md:text-base mb-6">
                  Release what you've held inside.<br />
                  Your voice, your story.
                </p>

                {/* Whispers */}
                <AnimatePresence>
                  {hoveredDoor === "write" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="text-emerald-300/60 text-xs italic"
                    >
                      {whispers.write[Math.floor(Date.now() / 2000) % whispers.write.length]}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Ripple effect on hover */}
              {hoveredDoor === "write" && (
                <motion.div
                  className="absolute inset-0 border-4 border-emerald-400 rounded-3xl"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.1, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>
          </motion.div>
        </Link>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 3.2, duration: 0.5 }}
          className="hidden md:flex flex-col items-center gap-3"
        >
          <div className="w-px h-32 bg-gradient-to-b from-transparent via-white/30 to-transparent" />
          <span className="text-white/60 text-sm font-medium">or</span>
          <div className="w-px h-32 bg-gradient-to-b from-transparent via-white/30 to-transparent" />
        </motion.div>

        {/* Read Door - "Walk in Others' Shoes" */}
        <Link href="/reader" className="group relative">
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 3.5, duration: 0.8 }}
            onMouseEnter={() => setHoveredDoor("read")}
            onMouseLeave={() => setHoveredDoor(null)}
            className="relative"
          >
            {/* Door frame */}
            <div className="relative w-64 h-96 md:w-80 md:h-[32rem] rounded-3xl overflow-hidden border-4 border-blue-400/30 bg-gradient-to-b from-blue-900/40 to-indigo-900/40 backdrop-blur-sm shadow-2xl transition-all duration-500 group-hover:border-blue-400/60 group-hover:shadow-blue-500/50">
              
              {/* Door glow */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-transparent"
                animate={{
                  opacity: hoveredDoor === "read" ? [0.3, 0.6, 0.3] : 0.2
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Door content */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center">
                <motion.div
                  animate={{
                    scale: hoveredDoor === "read" ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className="text-6xl mb-6"
                >
                  
                </motion.div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Walk in<br />Others' Shoes
                </h2>
                
                <p className="text-blue-200/80 text-sm md:text-base mb-6">
                  Discover stories that echo<br />
                  your own unspoken truths.
                </p>

                {/* Whispers */}
                <AnimatePresence>
                  {hoveredDoor === "read" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="text-blue-300/60 text-xs italic"
                    >
                      {whispers.read[Math.floor(Date.now() / 2000) % whispers.read.length]}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Ripple effect on hover */}
              {hoveredDoor === "read" && (
                <motion.div
                  className="absolute inset-0 border-4 border-blue-400 rounded-3xl"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.1, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Bottom hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center"
      >
        <p className="text-white/60 text-sm mb-2">Choose your door to begin</p>
        <div className="flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 text-xs">
             Safe
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 text-xs">
             Anonymous
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 text-xs">
             No judgment
          </span>
        </div>
      </motion.div>
    </main>
  );
}
