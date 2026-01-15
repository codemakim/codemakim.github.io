import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { getPublicPosts } from "./lib/posts";

export default function LandingPage() {
  // 최신 포스트 8개 가져오기 (빌드 시점에 렌더링)
  const latestPosts = getPublicPosts()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* 히어로 섹션 */}
      <header className="header">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
            그냥 블로그
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            블로그, 습관 관리, 그리고 더 많은 것들
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 타일 그리드 - 윈도우 8 스타일 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {/* 큰 타일 (2x1) - 블로그 */}
          <Link
            href="/blog"
            className="card tile-large md:col-span-2 aspect-[2/1] hover:shadow-elevation-3 transition-all"
          >
            <div className="p-8 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                  블로그
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  웹 개발과 기술 이야기
                </p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500">
                모든 포스트 보기 →
              </div>
            </div>
          </Link>

          {/* 작은 타일 (1x1) - 매일두잇 */}
          <Link
            href="/habits"
            className="card tile-small aspect-square hover:shadow-elevation-3 transition-all"
          >
            <div className="p-6 h-full flex flex-col justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                매일두잇
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-500">
                습관 만들기 시작하기 →
              </div>
            </div>
          </Link>
        </div>

        {/* 최신 포스트 섹션 */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              최신 포스트
            </h2>
            <Link
              href="/blog"
              className="link text-sm hover:underline"
            >
              모든 포스트 보기 →
            </Link>
          </div>

          {/* 컴팩트한 포스트 리스트 */}
          <div className="card">
            <div className="divide-y divide-gray-200 dark:divide-[#2A2A2A]">
              {latestPosts.map((post, index) => (
                <Link
                  key={post._id}
                  href={post.url}
                  className="block hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-colors -mx-1 px-4 py-3 rounded"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white line-clamp-1">
                        {post.title}
                      </h3>
                      {post.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mb-1">
                          {post.description}
                        </p>
                      )}
                      <time className="text-xs text-gray-500 dark:text-gray-500">
                        {format(new Date(post.date), "yyyy년 M월 d일", {
                          locale: ko,
                        })}
                      </time>
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap flex-shrink-0">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="tag text-xs whitespace-nowrap"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
