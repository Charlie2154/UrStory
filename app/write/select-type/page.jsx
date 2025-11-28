"use client";

import Link from "next/link";

export default function SelectStoryTypePage() {
  const storyTypes = [
    {
      id: "diary",
      title: "📔 Diary",
      description: "Write about your day today. Reflect on moments, thoughts, and feelings.",
      color: "bg-blue-600 hover:bg-blue-700",
      icon: "📔",
    },
    {
      id: "autobiography",
      title: "📚 Autobiography",
      description: "Build your life story chapter by chapter. AI helps compile your memories into a cohesive narrative.",
      color: "bg-emerald-600 hover:bg-emerald-700",
      icon: "📚",
    },
    {
      id: "secret-keeper",
      title: "🤐 Secret Keeper",
      description: "Share things you've never told anyone. A safe space for your deepest thoughts and confessions.",
      color: "bg-purple-600 hover:bg-purple-700",
      icon: "🤐",
    },
    {
      id: "ai-chapter",
      title: "✨ AI Chapter Creator",
      description: "Tell AI a moment in your life, and it will craft a beautiful chapter for your autobiography.",
      color: "bg-pink-600 hover:bg-pink-700",
      icon: "✨",
    },
    {
      id: "freeform",
      title: "🎨 Freeform Story",
      description: "Write any story you want. Fiction, real experiences, or anything in between.",
      color: "bg-orange-600 hover:bg-orange-700",
      icon: "🎨",
    },
  ];

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 via-slate-50 to-emerald-50">
      <div className="max-w-4xl mx-auto">
        <Link href="/write" className="text-blue-600 hover:text-blue-700 font-medium">← Back</Link>

        <h1 className="text-4xl font-bold mt-6 mb-2">What kind of story do you want to write?</h1>
        <p className="text-slate-600 mb-12">
          Choose the type that best fits your story. Each has its own unique purpose and AI assistance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {storyTypes.map(type => (
            <Link
              key={type.id}
              href={`/write/editor?type=${type.id}`}
              className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition ${type.color} text-white`}
            >
              <div className="text-4xl mb-3">{type.icon}</div>
              <h2 className="text-2xl font-bold mb-2">{type.title}</h2>
              <p className="text-blue-50 opacity-90">{type.description}</p>
              <div className="mt-4 text-blue-100 font-medium text-sm">Start Writing →</div>
            </Link>
          ))}
        </div>

        <div className="mt-12 p-6 bg-white rounded-xl shadow text-center">
          <p className="text-slate-700">
            <span className="font-semibold">Not sure which one?</span> Start with <span className="text-blue-600 font-semibold">Diary</span> to share your day, or <span className="text-emerald-600 font-semibold">Autobiography</span> to build your life story.
          </p>
        </div>
      </div>
    </main>
  );
}
