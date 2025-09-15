import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { allPosts } from "contentlayer/generated";

export default function Home() {
  const posts = allPosts.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            개발 블로그
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Next.js와 웹 개발에 관한 이야기들을 공유합니다
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post._id}
              className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <Link href={post.url}>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {post.title}
                  </h2>
                </Link>
                
                {post.description && (
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    {post.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between mt-4 gap-4">
                  <time className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0 min-w-fit">
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
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
