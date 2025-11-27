"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ReaderPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <main className="p-8 max-w-3xl mx-auto">
      <Link href="/" className="text-blue-600">← Home</Link>

      <h1 className="text-3xl font-bold mt-4">Read Real Stories</h1>
      <p className="text-gray-600 mt-2 mb-6">
        Explore real-life stories from around the world.
      </p>

      {loading && <p>Loading stories…</p>}

      {!loading && (
        <div className="grid gap-4">
          {stories.map(story => (
            <div key={story.id} className="p-4 bg-white rounded-lg shadow">
              <h2 className="text-xl font-semibold">{story.title}</h2>
              <p className="mt-2 text-gray-700">
                {story.text?.slice(0, 150)}...
              </p>
              <Link
                href={`/story/${story.id}`}
                className="mt-3 inline-block text-blue-600 font-medium"
              >
                Read Full Story →
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
