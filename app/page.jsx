import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center p-8 text-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="absolute top-6 right-6">
            <Link href="/login" className="px-6 py-2 bg-teal-600 hover:bg-emerald-600 text-white rounded-lg font-medium transition">
              Login
            </Link>
          </div>

      <h1 className="text-6xl font-bold text-teal-600 mt-16">U</h1>

      <h2 className="mt-8 text-2xl max-w-2xl text-slate-700 leading-relaxed">
        Every person has a story.<br />
        <span className="text-teal-600 font-semibold">What brings you to U today?</span>
      </h2>

      <div className="mt-12 flex flex-col gap-4 w-full max-w-md">
        <Link href="/reader" className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition duration-200 font-medium text-slate-700">
          📘 I want to READ stories
        </Link>

        <Link href="/write" className="p-6 bg-teal-600 hover:bg-emerald-600 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition duration-200 text-white font-medium">
          ✍️ I want to WRITE my story
        </Link>
      </div>
    </main>
  );
}
