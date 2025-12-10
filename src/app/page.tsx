import { Suspense } from "react";
import HomeContent from "./components/HomeContent";
import { getPublicPosts, getPublicTags } from "./lib/posts";
import PostList from "./components/PostList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: '개발 블로그',
  description: '리액트, 타입스크립트, Vue, Spring 등 개발 관련 글 모음',
}

export default function Home() {
  const publicPosts = getPublicPosts();
  
  const sortedPosts = [...publicPosts].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  const tags = getPublicTags();

  return (
    <div className="min-h-screen">
      <header className="glass-header md:sticky md:top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            개발 블로그
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            웹 개발에 관한 이야기들을 공유합니다
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
          <HomeContent initialPosts={sortedPosts} tags={tags} />
        </Suspense>
      </main>
    </div>
  );
}
