import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Post } from "contentlayer/generated";

interface PostListProps {
  posts: Post[];
  selectedTag: string | null;
}

export default function PostList({ posts, selectedTag }: PostListProps) {
  const filteredPosts = selectedTag
    ? posts.filter((post) => post.tags?.includes(selectedTag))
    : posts;

  if (filteredPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
          해당 태그의 포스트가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredPosts.map((post) => (
        <article key={post._id} className="card p-6">
          <Link href={post.url}>
            <h2 className="text-xl font-black mb-1 hover:underline" style={{ color: "var(--text-primary)" }}>
              {post.title}
            </h2>
          </Link>

          {post.description && (
            <p className="mt-1 mb-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              {post.description}
            </p>
          )}

          <div className="flex items-center justify-between gap-4">
            <time className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
              {format(new Date(post.date), "yyyy-MM-dd")}
            </time>
            {post.tags && (
              <div className="flex gap-2 flex-wrap">
                {post.tags.map((tag) => (
                  <span key={tag} className="tag">
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
