import { Suspense } from "react";
import Link from "next/link";
import HomeContent from "../components/HomeContent";

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      <header className="header md:sticky md:top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="block hover:opacity-80 transition-opacity">
            <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
              그냥 블로그
            </h1>
          </Link>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            웹 개발 관련 글들
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="card px-8 py-4">
                <p style={{ color: "var(--text-secondary)" }}>로딩 중...</p>
              </div>
            </div>
          }
        >
          <HomeContent />
        </Suspense>
      </main>
    </div>
  );
}
