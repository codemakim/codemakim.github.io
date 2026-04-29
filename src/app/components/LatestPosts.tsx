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
        <h2 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
          최신 포스트
        </h2>
        <Link href={viewAllHref} className="link text-sm font-bold hover:underline">
          {viewAllText} →
        </Link>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <Link
            key={post._id}
            href={post.url}
            className="card block p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base mb-1 line-clamp-1" style={{ color: "var(--text-primary)" }}>
                  {post.title}
                </h3>
                {post.description && (
                  <p className="text-sm line-clamp-1 mb-1" style={{ color: "var(--text-secondary)" }}>
                    {post.description}
                  </p>
                )}
                <time className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {format(new Date(post.date), "yyyy년 M월 d일", { locale: ko })}
                </time>
              </div>
              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap flex-shrink-0">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
