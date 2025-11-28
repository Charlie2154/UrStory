"use client";

import React, { useState, useEffect, useRef } from "react";
import loadFirebase from "../lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function ChatStoryEditor({ storyTitle = "Untitled Story", user, storyType = "freeform", initialPrompt = null }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [messages, setMessages] = useState([]);
  const [storyText, setStoryText] = useState("");
  const [pendingStoryUpdate, setPendingStoryUpdate] = useState("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const chatRef = useRef(null);

  // Clear localStorage and initialize state only after hydration
  useEffect(() => {
    localStorage.removeItem("cse_messages_v1");
    localStorage.removeItem("cse_story_v1");
    setMessages([]);
    setStoryText("");
    setPendingStoryUpdate("");
    setIsHydrated(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("cse_messages_v1", JSON.stringify(messages));
  }, [messages, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("cse_story_v1", storyText);
  }, [storyText, isHydrated]);

  useEffect(() => scrollChatToBottom(), [messages, isLoading, isHydrated]);

  // Welcome the user on their first sign-in (creationTime === lastSignInTime)
  useEffect(() => {
    const { auth } = loadFirebase();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return;

      try {
        const isFirst =
          currentUser.metadata &&
          currentUser.metadata.creationTime === currentUser.metadata.lastSignInTime;

        if (isFirst) {
          const name = currentUser.displayName || (currentUser.email || "").split("@")[0] || "friend";

          // Add a friendly AI greeting
          const welcomeMsg = {
            id: genId(),
            role: "ai",
            text: `Hi ${name}! 👋 Welcome to U — I'm your writing partner. Tell me about a memory, a feeling, or a scene you'd like to turn into a story, and I'll help shape it with you.`,
            time: Date.now(),
          };
          setMessages((m) => [...m, welcomeMsg]);

          // Also generate a short starter paragraph for the story
          setIsLoading(true);
          try {
            const starter = await generateStory([
              { text: `User ${name} just signed in and would like a warm storytelling introduction.` },
            ]);

            if (starter?.storyText) setPendingStoryUpdate(starter.storyText);
          } catch (e) {
            console.error("Starter generation failed:", e);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error checking first sign-in:", err);
      }
    });

    return () => unsubscribe();
  }, []);

  // If a test/mock user is passed via props, trigger the welcome flow for testing.
  useEffect(() => {
    // Only run when a mock user is provided and there are no existing messages
    if (!user || !user.isMock) return;
    if (messages.length > 0) return;

    (async () => {
      try {
        const name = user.displayName || (user.email || "").split("@")[0] || "friend";

        const welcomeText = initialPrompt || `Hi ${name}! 👋 Welcome to U — I'm your writing partner. Tell me about a memory, a feeling, or a scene you'd like to turn into a story, and I'll help shape it with you.`;

        const welcomeMsg = {
          id: genId(),
          role: "ai",
          text: welcomeText,
          time: Date.now(),
        };
        setMessages((m) => [...m, welcomeMsg]);

        // Don't auto-generate for now on type-specific pages
        // Users will start typing themselves
      } catch (err) {
        console.error("Error in mock welcome flow:", err);
      }
    })();
  }, [user, initialPrompt]);

  function scrollChatToBottom() {
    if (chatRef.current) {
      setTimeout(() => {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }, 0);
    }
  }

  function genId() {
    return Math.random().toString(36).slice(2, 9);
  }

  async function generateStory(conversation) {
    try {
      const response = await fetch("/api/generateStory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation,
          currentStory: storyText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate story");
      }

      const data = await response.json();
      return {
        storyText: data.storyText || "",
        followUp: data.followUp || "",
      };
    } catch (err) {
      console.error("Story generation error:", err);
      throw err;
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || isLoading) return;

    setError("");
    const id = genId();
    // mark the user message with an acknowledgement state
    const userMsg = { id, role: "user", text, time: Date.now(), ack: "pending" };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await generateStory([...messages, userMsg]);
      if (result.storyText) setPendingStoryUpdate(result.storyText);

      // mark this user message as acknowledged (turn tick green)
      setMessages((m) => m.map((mm) => (mm.id === id ? { ...mm, ack: "done" } : mm)));

      // only add the follow-up question from AI (no generic 'Story updated' message)
      if (result.followUp) {
        const follow = { id: genId(), role: "ai", text: result.followUp, time: Date.now() };
        setMessages((m) => [...m, follow]);
      }
    } catch (err) {
      setError("Failed to generate story. Please try again.");

      // clear the pending ack on failure
      setMessages((m) => m.map((mm) => (mm.id === id ? { ...mm, ack: "none" } : mm)));

      const aiMsg = {
        id: genId(),
        role: "ai",
        text: "Sorry, I had trouble generating that. Please try again.",
        time: Date.now(),
      };
      setMessages((m) => [...m, aiMsg]);
    }

    setIsLoading(false);
  }

  function acceptStoryUpdate() {
    if (pendingStoryUpdate) {
      setStoryText((prev) => {
        const combined = prev ? `${prev}\n\n${pendingStoryUpdate}` : pendingStoryUpdate;
        return combined;
      });
      setPendingStoryUpdate("");

      const confirmMsg = {
        id: genId(),
        role: "ai",
        text: "✓ Story update accepted! Ready for more?",
        time: Date.now(),
      };
      setMessages((m) => [...m, confirmMsg]);
    }
  }

  function rejectStoryUpdate() {
    setPendingStoryUpdate("");
    const rejectMsg = {
      id: genId(),
      role: "ai",
      text: "Got it, I'll try something different. What would you like instead?",
      time: Date.now(),
    };
    setMessages((m) => [...m, rejectMsg]);
  }

  async function saveStoryToFirestore() {
    if (!storyText.trim()) {
      alert("Your story is empty. Write something first!");
      return;
    }

    try {
      const { db } = loadFirebase();
      await addDoc(collection(db, "stories"), {
        title: storyTitle,
        text: storyText,
        author: user?.email || "Anonymous",
        timestamp: serverTimestamp(),
      });

      alert("✓ Story saved successfully!");
      setStoryText("");
      setMessages([]);
      setPendingStoryUpdate("");
      localStorage.removeItem("cse_messages_v1");
      localStorage.removeItem("cse_story_v1");
    } catch (err) {
      alert("Error saving story: " + err.message);
    }
  }

  return (
    <div className="h-screen w-full flex overflow-hidden bg-gradient-to-br from-sky-50 to-emerald-50">
      {/* LEFT SIDE — Chat */}
      <div className="w-2/5 flex flex-col border-r border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-teal-600 to-emerald-600">
          <h3 className="text-white font-semibold text-lg">✨ Story Builder</h3>
          <p className="text-teal-100 text-xs mt-1">Chat to create your story</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={chatRef}>
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-400 text-center">
                Start chatting to begin your story...<br />
                <span className="text-xs">Share ideas, scenes, or directions</span>
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "ai" ? (
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm bg-slate-100 text-slate-800 rounded-bl-none`}
                >
                  {msg.text}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg text-sm bg-teal-600 text-white rounded-br-none`}
                  >
                    {msg.text}
                  </div>

                  {/* acknowledgement tick */}
                  <div className="flex-shrink-0">
                    {msg.ack === "pending" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-400">
                        <circle cx="12" cy="12" r="9" stroke="#94a3b8" strokeWidth="1.5" fill="transparent" />
                      </svg>
                    )}

                    {msg.ack === "done" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" fill="#16a34a" />
                        <path d="M7.5 12.5l2.5 2.5 6-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-800 px-4 py-2 rounded-lg rounded-bl-none">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-slate-200 space-y-3 bg-slate-50">
          {error && (
            <p className="text-red-600 text-xs bg-red-50 p-2 rounded">{error}</p>
          )}
          <textarea
            className="w-full p-3 border border-slate-300 rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="What happens next? Add dialogue, emotions, or scenes..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            rows="3"
            disabled={isLoading}
          ></textarea>

          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="w-full bg-teal-600 hover:bg-emerald-600 disabled:bg-slate-300 text-white py-2 rounded-lg font-medium transition"
          >
            {isLoading ? "Generating..." : "Send"}
          </button>

          <button
            onClick={saveStoryToFirestore}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium transition text-sm"
          >
            💾 Save Story
          </button>
        </div>
      </div>

      {/* RIGHT SIDE — Story Preview */}
      <div className="w-3/5 flex flex-col bg-gradient-to-br from-amber-50 to-green-50 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-emerald-200 shadow-sm">
          <h2 className="text-3xl font-bold text-slate-800">{storyTitle}</h2>
          <p className="text-slate-500 text-sm mt-1">Your story unfolds here...</p>
        </div>

        {/* Story Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {storyText && (
            <div className="prose prose-sm max-w-none">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-base">
                {storyText}
              </p>
            </div>
          )}

          {pendingStoryUpdate && (
            <div className="border-l-4 border-teal-500 pl-4 py-3 bg-teal-50 rounded">
              <p className="text-xs font-semibold text-teal-700 mb-2">✨ AI-Generated Continuation:</p>
              <p className="text-slate-700 text-sm leading-relaxed mb-4">
                {pendingStoryUpdate}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={acceptStoryUpdate}
                  className="px-4 py-2 bg-teal-600 hover:bg-emerald-600 text-white text-xs font-medium rounded transition"
                >
                  ✓ Accept
                </button>
                <button
                  onClick={rejectStoryUpdate}
                  className="px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-700 text-xs font-medium rounded transition"
                >
                  ✗ Suggest Changes
                </button>
              </div>
            </div>
          )}

          {!storyText && !pendingStoryUpdate && (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-400 text-center">
                Your story will appear here as you chat...<br />
                <span className="text-xs">Review and accept AI-generated text</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
