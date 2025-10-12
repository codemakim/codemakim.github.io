import { Post } from "contentlayer/generated";

export interface TagWithCount {
  name: string;
  count: number;
}

/**
 * 모든 포스트에서 태그를 추출하고 개수를 계산합니다
 * @param posts 전체 포스트 배열
 * @returns 태그 이름과 개수를 포함한 배열 (빈도순 정렬)
 */
export function getAllTags(posts: Post[]): TagWithCount[] {
  const tagMap = new Map<string, number>();

  posts.forEach((post) => {
    post.tags?.forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count); // 빈도순 정렬 (많은 것부터)
}

/**
 * 선택된 태그에 따라 포스트를 필터링합니다
 * @param posts 전체 포스트 배열
 * @param selectedTag 선택된 태그 (null이면 전체)
 * @returns 필터링된 포스트 배열
 */
export function filterPostsByTag(
  posts: Post[],
  selectedTag: string | null
): Post[] {
  if (!selectedTag) {
    return posts;
  }

  return posts.filter((post) => post.tags?.includes(selectedTag));
}

