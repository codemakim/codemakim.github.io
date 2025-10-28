import { notFound } from "next/navigation";
import { MDXContent } from "./MDXContent";
import SeriesNav from "@/app/components/SeriesNav";
import PostHeader from "@/app/components/PostHeader";
import { getSeriesNavigation } from "@/app/lib/series";
import { getPublicPosts, getPublicPost } from "@/app/lib/posts";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const publicPosts = getPublicPosts();
  return publicPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getPublicPost(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPublicPost(slug);

  if (!post) {
    notFound();
  }

  // 시리즈 네비게이션 정보 (공개 포스트만 사용)
  const publicPosts = getPublicPosts();
  const seriesInfo = getSeriesNavigation(post, publicPosts);

  return (
    <div className="min-h-screen">
      <PostHeader post={post} />

      <main className="max-w-4xl mx-auto md:px-4 py-8">
        {/* 시리즈 네비게이션 (상단) */}
        <div className="px-4 md:px-0">
          <SeriesNav seriesInfo={seriesInfo} />
        </div>

        {/* 본문 */}
        <article className="glass-card glass-card-content p-8 md:rounded-2xl prose dark:prose-invert max-w-none prose-lg prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
          <MDXContent code={post.body.code} />
        </article>

        {/* 시리즈 네비게이션 (하단) */}
        <div className="px-4 md:px-0">
          <SeriesNav seriesInfo={seriesInfo} />
        </div>
      </main>
    </div>
  );
}