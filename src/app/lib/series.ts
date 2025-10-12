import { Post } from "contentlayer/generated";

export interface SeriesInfo {
  prev: Post | null;
  next: Post | null;
  current: number;
  total: number;
  seriesName: string | null;
}

/**
 * 시리즈 네비게이션 정보 가져오기
 */
export function getSeriesNavigation(
  currentPost: Post,
  allPosts: Post[]
): SeriesInfo {
  // series 필드가 없으면 null 반환
  if (!currentPost.series) {
    return {
      prev: null,
      next: null,
      current: 0,
      total: 0,
      seriesName: null,
    };
  }

  // 같은 시리즈의 포스트들 찾기
  const seriesPosts = allPosts
    .filter((post) => post.series === currentPost.series)
    .sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0));

  // 현재 포스트 인덱스
  const currentIndex = seriesPosts.findIndex(
    (post) => post.slug === currentPost.slug
  );

  return {
    prev: currentIndex > 0 ? seriesPosts[currentIndex - 1] : null,
    next: currentIndex < seriesPosts.length - 1 ? seriesPosts[currentIndex + 1] : null,
    current: currentIndex + 1,
    total: seriesPosts.length,
    seriesName: currentPost.series,
  };
}

/**
 * 시리즈 목록 가져오기
 */
export function getAllSeries(posts: Post[]): Map<string, Post[]> {
  const seriesMap = new Map<string, Post[]>();

  posts.forEach((post) => {
    if (post.series) {
      if (!seriesMap.has(post.series)) {
        seriesMap.set(post.series, []);
      }
      seriesMap.get(post.series)!.push(post);
    }
  });

  // 각 시리즈의 포스트를 seriesOrder로 정렬
  seriesMap.forEach((seriesPosts, series) => {
    seriesPosts.sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0));
  });

  return seriesMap;
}

