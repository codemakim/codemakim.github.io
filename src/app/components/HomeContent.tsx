"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TagFilter from "./TagFilter";
import PostList from "./PostList";
import SortOptions from "./SortOptions";
import SearchBar from "./SearchBar";
import { getPublicPosts, getPublicTags } from "../lib/posts";
import { searchPosts } from "../lib/search";

export default function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL 파라미터 읽기
  const selectedTag = searchParams.get("tag");
  const sortOrder = (searchParams.get("sort") as 'desc' | 'asc') || 'desc';
  const urlSearchQuery = searchParams.get("search") || "";
  
  // 로컬 검색어 상태 (한글 입력 문제 해결)
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // URL 검색어가 변경되면 로컬 상태 동기화
  useEffect(() => {
    setSearchQuery(urlSearchQuery);
    setIsSearching(false); // URL 업데이트 완료
  }, [urlSearchQuery]);

  // 공개 포스트만 가져오기
  const publicPosts = getPublicPosts();
  
  // 포스트 필터링 및 정렬
  const filteredPosts = useMemo(() => {
    let posts = [...publicPosts];

    // 1. 정렬
    posts = posts.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    // 2. 검색 (로컬 상태 사용 - 즉시 반영)
    if (searchQuery) {
      posts = searchPosts(posts, searchQuery);
    }

    // 3. 태그 필터 (PostList에서 처리)

    return posts;
  }, [publicPosts, sortOrder, searchQuery]); // publicPosts 추가

  // 최종 필터링된 포스트 (태그 적용)
  const displayPosts = useMemo(() => {
    if (!selectedTag) return filteredPosts;
    return filteredPosts.filter(post => post.tags?.includes(selectedTag));
  }, [filteredPosts, selectedTag]);

  // 공개 포스트의 태그만 추출
  const tags = getPublicTags();

  // 검색 핸들러 (debounce 적용)
  function handleSearchChange(query: string) {
    // 로컬 상태는 즉시 업데이트 (한글 입력 문제 해결)
    setSearchQuery(query);
    
    // 이전 타이머 취소
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // 빈 문자열이면 즉시 URL 업데이트 (debounce 없음)
    if (query === '') {
      setIsSearching(false);
      const params = new URLSearchParams(searchParams.toString());
      params.delete('search');
      router.push(`/?${params.toString()}`);
      return;
    }
    
    // 검색어가 있으면 debounce 적용
    setIsSearching(true);
    
    // 1200ms 후에 URL 업데이트 (확실한 입력 완료 후)
    debounceTimer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('search', query);
      router.push(`/?${params.toString()}`);
      // isSearching은 useEffect에서 false로 변경됨
    }, 1200);
  }
  
  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

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
        totalCount={publicPosts.length}
        isSearching={isSearching}
      />

      {/* 태그 필터 */}
      <TagFilter
        tags={tags}
        selectedTag={selectedTag}
        onTagSelect={handleTagSelect}
        totalCount={publicPosts.length}
      />

      {/* 정렬 옵션 */}
      <SortOptions sortOrder={sortOrder} onSortChange={handleSortChange} />

      {/* 포스트 리스트 */}
      <PostList posts={displayPosts} selectedTag={null} />
    </>
  );
}

