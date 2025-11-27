"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function StoryDetailPage() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const loadFirebase = (await import("../../(client)/lib/firebaseClient")).default;
      const { db } = await loadFirebase();

      const { doc, getDoc } = await import("firebase/firestore");

      const ref = doc(db, "stories", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setStory(snap.data());
      }
      setLoading(false);
    }

    if (id) load();
  }, [id]);

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <Link href="/" className="text-blue-600">← Home</Link>

      {loading && <p className="mt-4">Loading story…</p>}

      {!loading && story && (
        <div className="mt-6">
          <h1 className="text-3xl font-bold">{story.title}</h1>
          <p className="mt-4 whitespace-pre-wrap">{story.text}</p>
        </div>
      )}
    </main>
  );
}
