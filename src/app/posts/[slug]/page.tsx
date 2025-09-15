import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { allPosts } from "contentlayer/generated";
import { MDXContent } from "./MDXContent";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return allPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = allPosts.find((post) => post.slug === slug);

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
  const post = allPosts.find((post) => post.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link 
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm mb-4 block"
          >
            ← 블로그로 돌아가기
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {post.title}
          </h1>
          {post.description && (
            <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
              {post.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-4">
            <time className="text-sm text-gray-500 dark:text-gray-400">
              {format(new Date(post.date), "yyyy년 M월 d일", { locale: ko })}
            </time>
            {post.tags && (
              <div className="flex gap-2 flex-wrap">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="prose dark:prose-invert max-w-none prose-lg prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-gray-900 prose-pre:text-gray-100">
          <MDXContent code={post.body.code} />
        </article>
      </main>
    </div>
  );
}