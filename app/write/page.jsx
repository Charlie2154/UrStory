"use client";

import ChatStoryEditor from "../../components/ChatStoryEditor";
import Link from "next/link";

export default function WritePage() {
  // Sign-in temporarily disabled — allow direct access to editor.
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        <Link href="/" className="text-teal-600 hover:text-emerald-600 font-medium">← Back Home</Link>

        <h1 className="text-3xl font-bold mt-6">Write Your Story</h1>
        <p className="mt-2 text-slate-600">Sign in is temporarily disabled — the editor is available for now.</p>

        <div className="mt-6">
          {/* For testing: assume user is signed in by default. */}
          <ChatStoryEditor
            storyTitle="My Story"
            user={{ email: "tester@example.com", displayName: "Tester", isMock: true }}
          />
        </div>
      </div>
    </main>
  );
}
