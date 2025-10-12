"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { allPosts } from "contentlayer/generated";
import TagFilter from "./components/TagFilter";
import PostList from "./components/PostList";
import { getAllTags } from "./lib/tags";

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL에서 태그 읽기
  const selectedTag = searchParams.get("tag");

  // 포스트 정렬 (최신순)
  const posts = allPosts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // 모든 태그 추출
  const tags = getAllTags(posts);

  // 태그 선택 핸들러 (URL 업데이트)
  function handleTagSelect(tag: string | null) {
    if (tag) {
      router.push(`/?tag=${encodeURIComponent(tag)}`);
    } else {
      router.push("/");
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            개발 블로그
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Next.js와 웹 개발에 관한 이야기들을 공유합니다
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 태그 필터 */}
        <TagFilter
          tags={tags}
          selectedTag={selectedTag}
          onTagSelect={handleTagSelect}
          totalCount={posts.length}
        />

        {/* 포스트 리스트 */}
        <PostList posts={posts} selectedTag={selectedTag} />
      </main>
    </div>
  );
}
