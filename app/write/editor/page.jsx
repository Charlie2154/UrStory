"use client";

import ChatStoryEditor from "../../../components/ChatStoryEditor";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function StoryEditorPage() {
  const searchParams = useSearchParams();
  const storyType = searchParams.get("type") || "freeform";

  const storyTypeInfo = {
    diary: {
      title: "📔 Diary",
      subtitle: "Write about your day today",
      prompt: "Tell me about your day today. What happened? How did you feel?",
    },
    autobiography: {
      title: "📚 Autobiography",
      subtitle: "Build your life story chapter by chapter",
      prompt: "Share a chapter of your life story. The AI will help weave it into your autobiography.",
    },
    "secret-keeper": {
      title: "🤐 Secret Keeper",
      subtitle: "A safe space for your deepest thoughts",
      prompt: "Share something you've never told anyone. This is your safe space.",
    },
    "ai-chapter": {
      title: "✨ AI Chapter Creator",
      subtitle: "AI crafts your life moments into chapters",
      prompt: "Tell me a moment or story from your life, and I'll turn it into a beautiful chapter for your autobiography.",
    },
    freeform: {
      title: "🎨 Freeform Story",
      subtitle: "Write any story you want",
      prompt: "Start writing your story. It can be fiction, real experiences, or anything in between.",
    },
  };

  const info = storyTypeInfo[storyType] || storyTypeInfo.freeform;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        <Link href="/write/select-type" className="text-blue-600 hover:text-blue-700 font-medium">← Change Story Type</Link>

        <div className="mt-6 mb-6">
          <h1 className="text-3xl font-bold">{info.title}</h1>
          <p className="mt-2 text-slate-600">{info.subtitle}</p>
        </div>

        <ChatStoryEditor
          storyTitle={info.title}
          storyType={storyType}
          initialPrompt={info.prompt}
          user={{ email: "tester@example.com", displayName: "Tester", isMock: true }}
        />
      </div>
    </main>
  );
}
