import { Post } from "contentlayer/generated";

/**
 * 포스트 검색 (제목, 설명, 태그)
 */
export function searchPosts(posts: Post[], query: string): Post[] {
  if (!query.trim()) {
    return posts;
  }

  const lowerQuery = query.toLowerCase().trim();

  return posts.filter((post) => {
    // 제목 검색
    const titleMatch = post.title.toLowerCase().includes(lowerQuery);

    // 설명 검색
    const descriptionMatch = post.description?.toLowerCase().includes(lowerQuery);

    // 태그 검색
    const tagsMatch = post.tags?.some(tag =>
      tag.toLowerCase().includes(lowerQuery)
    );

    return titleMatch || descriptionMatch || tagsMatch;
  });
}

