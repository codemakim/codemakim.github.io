import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Post } from "contentlayer/generated";

interface PostListProps {
  posts: Post[];
  selectedTag: string | null;
}

export default function PostList({ posts, selectedTag }: PostListProps) {
  // 선택된 태그로 필터링
  const filteredPosts = selectedTag
    ? posts.filter((post) => post.tags?.includes(selectedTag))
    : posts;

  // 빈 상태 처리
  if (filteredPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          해당 태그의 포스트가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {filteredPosts.map((post) => (
        <article key={post._id} className="card p-6">
          <Link href={post.url}>
            <h2 className="link text-2xl font-semibold text-gray-900 dark:text-white transition-colors">
              {post.title}
            </h2>
          </Link>

          {post.description && (
            <p className="text-gray-700 dark:text-gray-300 mt-2">
              {post.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-4 gap-4">
            <time className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap flex-shrink-0 min-w-fit">
              {format(new Date(post.date), "yyyy년 M월 d일", { locale: ko })}
            </time>

            {post.tags && (
              <div className="flex gap-2 flex-wrap">
                {post.tags.map((tag) => (
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
        </article>
      ))}
    </div>
  );
}

