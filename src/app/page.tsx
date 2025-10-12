import { Suspense } from "react";
import HomeContent from "./components/HomeContent";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="glass-header sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🪟 개발 블로그
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Next.js와 웹 개발에 관한 이야기들을 공유합니다
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="glass-card px-8 py-4">
                <p className="text-gray-600 dark:text-gray-400">
                  로딩 중...
                </p>
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
