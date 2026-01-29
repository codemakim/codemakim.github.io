"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import SeriesFilter from "./SeriesFilter";
import TagFilter from "./TagFilter";
import PostList from "./PostList";
import SortOptions from "./SortOptions";
import SearchBar from "./SearchBar";
import { getPublicPosts, getPublicTags } from "../lib/posts";
import { searchPosts } from "../lib/search";

export default function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URL 파라미터 읽기
  const selectedSeries = searchParams.get("series");
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

  const series = useMemo(() => {
    const seriesPriority = [
      "React 기초",
      "React Router",
      "React Query",
      "상태 관리",
      "Next.js 고급",
      "React 테스팅",
      "React 성능",
    ];

    const seriesPriorityIndex = new Map<string, number>(
      seriesPriority.map((name, index) => [name, index])
    );

    const seriesMap = new Map<string, number>();
    publicPosts.forEach((post) => {
      if (!post.series) return;
      seriesMap.set(post.series, (seriesMap.get(post.series) || 0) + 1);
    });

    return Array.from(seriesMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => {
        const aIndex = seriesPriorityIndex.get(a.name);
        const bIndex = seriesPriorityIndex.get(b.name);

        if (aIndex !== undefined && bIndex !== undefined) return aIndex - bIndex;
        if (aIndex !== undefined) return -1;
        if (bIndex !== undefined) return 1;

        return a.name.localeCompare(b.name, "ko");
      });
  }, [publicPosts]);
  
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

  // 최종 필터링된 포스트 (시리즈/태그 적용)
  const displayPosts = useMemo(() => {
    let posts = filteredPosts;

    if (selectedSeries) {
      posts = posts.filter((post) => post.series === selectedSeries);
    }

    if (selectedTag) {
      posts = posts.filter((post) => post.tags?.includes(selectedTag));
    }

    return posts;
  }, [filteredPosts, selectedSeries, selectedTag]);

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
      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
      return;
    }
    
    // 검색어가 있으면 debounce 적용
    setIsSearching(true);
    
    // 1200ms 후에 URL 업데이트 (확실한 입력 완료 후)
    debounceTimer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('search', query);
      const queryString = params.toString();
      router.push(`${pathname}?${queryString}`);
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
    
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  // 시리즈 선택 핸들러
  function handleSeriesSelect(seriesName: string | null) {
    const params = new URLSearchParams(searchParams.toString());

    if (seriesName) {
      params.set("series", seriesName);
    } else {
      params.delete("series");
    }

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  // 정렬 변경 핸들러
  function handleSortChange(order: 'desc' | 'asc') {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', order);
    const queryString = params.toString();
    router.push(`${pathname}?${queryString}`);
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

      <SeriesFilter
        series={series}
        selectedSeries={selectedSeries}
        onSeriesSelect={handleSeriesSelect}
        totalCount={publicPosts.length}
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

