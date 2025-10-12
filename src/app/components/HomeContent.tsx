"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { allPosts } from "contentlayer/generated";
import TagFilter from "./TagFilter";
import PostList from "./PostList";
import { getAllTags } from "../lib/tags";

export default function HomeContent() {
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
    <>
      {/* 태그 필터 */}
      <TagFilter
        tags={tags}
        selectedTag={selectedTag}
        onTagSelect={handleTagSelect}
        totalCount={posts.length}
      />

      {/* 포스트 리스트 */}
      <PostList posts={posts} selectedTag={selectedTag} />
    </>
  );
}

