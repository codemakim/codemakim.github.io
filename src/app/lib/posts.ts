import { allPosts } from "contentlayer/generated";

// draft가 아닌 공개 포스트만 반환
export function getPublicPosts() {
  return allPosts.filter(post => !post.draft);
}

// 모든 포스트 (draft 포함)
export function getAllPosts() {
  return allPosts;
}

// 특정 slug의 공개 포스트 찾기
export function getPublicPost(slug: string) {
  const post = allPosts.find(post => post.slug === slug);
  return post && !post.draft ? post : null;
}

// 공개 포스트의 모든 태그 수집 (TagWithCount 형태로)
export function getPublicTags() {
  const publicPosts = getPublicPosts();
  const tagMap = new Map<string, number>();

  publicPosts.forEach(post => {
    post.tags?.forEach(tag => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// 태그별 공개 포스트 개수
export function getTagCounts() {
  const publicPosts = getPublicPosts();
  const tagCounts: Record<string, number> = {};

  publicPosts.forEach(post => {
    post.tags?.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return tagCounts;
}
