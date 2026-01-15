import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Post } from "contentlayer/generated";

interface LatestPostsProps {
  posts: Post[];
  viewAllHref?: string;
  viewAllText?: string;
}

export default function LatestPosts({
  posts,
  viewAllHref = "/blog",
  viewAllText = "모든 포스트 보기",
}: LatestPostsProps) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          최신 포스트
        </h2>
        <Link href={viewAllHref} className="link text-sm hover:underline">
          {viewAllText} →
        </Link>
      </div>

      <div className="card">
        <div className="divide-y divide-gray-200 dark:divide-[#2A2A2A]">
          {posts.map((post) => (
            <Link
              key={post._id}
              href={post.url}
              className="block hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-colors -mx-1 px-4 py-3 rounded"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white line-clamp-1">
                    {post.title}
                  </h3>
                  {post.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mb-1">
                      {post.description}
                    </p>
                  )}
                  <time className="text-xs text-gray-500 dark:text-gray-500">
                    {format(new Date(post.date), "yyyy년 M월 d일", {
                      locale: ko,
                    })}
                  </time>
                </div>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap flex-shrink-0">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="tag text-xs whitespace-nowrap">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

