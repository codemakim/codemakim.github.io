"use client";

import { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { allPosts } from "contentlayer/generated";
import TagFilter from "./TagFilter";
import PostList from "./PostList";
import SortOptions from "./SortOptions";
import SearchBar from "./SearchBar";
import { getAllTags } from "../lib/tags";
import { searchPosts } from "../lib/search";

export default function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL 파라미터 읽기
  const selectedTag = searchParams.get("tag");
  const sortOrder = (searchParams.get("sort") as 'desc' | 'asc') || 'desc';
  const searchQuery = searchParams.get("search") || "";

  // 포스트 필터링 및 정렬
  const filteredPosts = useMemo(() => {
    let posts = [...allPosts];

    // 1. 정렬
    posts = posts.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    // 2. 검색
    if (searchQuery) {
      posts = searchPosts(posts, searchQuery);
    }

    // 3. 태그 필터 (PostList에서 처리)

    return posts;
  }, [sortOrder, searchQuery]);

  // 최종 필터링된 포스트 (태그 적용)
  const displayPosts = useMemo(() => {
    if (!selectedTag) return filteredPosts;
    return filteredPosts.filter(post => post.tags?.includes(selectedTag));
  }, [filteredPosts, selectedTag]);

  // 모든 태그 추출
  const tags = getAllTags(allPosts);

  // 검색 핸들러
  function handleSearchChange(query: string) {
    const params = new URLSearchParams(searchParams.toString());
    
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    
    router.push(`/?${params.toString()}`);
  }

  // 태그 선택 핸들러
  function handleTagSelect(tag: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    
    if (tag) {
      params.set('tag', tag);
    } else {
      params.delete('tag');
    }
    
    router.push(`/?${params.toString()}`);
  }

  // 정렬 변경 핸들러
  function handleSortChange(order: 'desc' | 'asc') {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', order);
    router.push(`/?${params.toString()}`);
  }

  return (
    <>
      {/* 검색바 */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        resultsCount={displayPosts.length}
        totalCount={allPosts.length}
      />

      {/* 태그 필터 */}
      <TagFilter
        tags={tags}
        selectedTag={selectedTag}
        onTagSelect={handleTagSelect}
        totalCount={allPosts.length}
      />

      {/* 정렬 옵션 */}
      <SortOptions sortOrder={sortOrder} onSortChange={handleSortChange} />

      {/* 포스트 리스트 */}
      <PostList posts={displayPosts} selectedTag={null} />
    </>
  );
}

