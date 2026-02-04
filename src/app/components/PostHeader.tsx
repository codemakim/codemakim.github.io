"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { Post } from "contentlayer/generated";

interface PostHeaderProps {
  post: Pick<Post, "title" | "description" | "date" | "tags" | "url">;
}

export default function PostHeader({ post }: PostHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // .app-wrapper 또는 window의 스크롤 감지
      const scrollContainer = document.querySelector('.app-wrapper');
      const scrollY = scrollContainer 
        ? scrollContainer.scrollTop 
        : window.scrollY;
      
      // 100px 이상 스크롤되면 축소 모드
      setIsScrolled(scrollY > 100);
    };

    // app-wrapper에 스크롤 이벤트 연결
    const scrollContainer = document.querySelector('.app-wrapper');
    const target = scrollContainer || window;
    
    target.addEventListener("scroll", handleScroll);
    return () => target.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`
        header md:sticky md:top-0 z-50
        transition-all duration-500 ease-in-out
        ${isScrolled ? "py-3" : "py-6"}
      `}
    >
      <div className="max-w-4xl mx-auto px-4">
        <div
          className={`
            flex items-start justify-between gap-4
            transition-all duration-500 ease-in-out
            ${isScrolled ? "mb-2" : "mb-4"}
          `}
        >
          <Link
            href="/blog"
            className={`
              link text-sm block hover:underline
              transition-all duration-500 ease-in-out
            `}
          >
            ← 블로그로 돌아가기
          </Link>
        </div>

        <h1
          className={`
            font-bold text-zinc-900 dark:text-white
            transition-all duration-500 ease-in-out
            ${isScrolled ? "text-xl" : "text-4xl"}
          `}
        >
          {post.title}
        </h1>

        {/* 설명 - 스크롤 시 숨김 */}
        {post.description && (
          <p
            className={`
              text-xl text-zinc-700 dark:text-zinc-300 mt-2
              transition-all duration-500 ease-in-out
              ${
                isScrolled
                  ? "opacity-0 max-h-0 overflow-hidden"
                  : "opacity-100 max-h-20"
              }
            `}
          >
            {post.description}
          </p>
        )}

        {/* 날짜와 태그 - 스크롤 시 숨김 */}
        <div
          className={`
            flex items-center justify-between gap-4
            transition-all duration-500 ease-in-out
            ${
              isScrolled
                ? "opacity-0 max-h-0 overflow-hidden mt-0"
                : "opacity-100 max-h-20 mt-4"
            }
          `}
        >
          <time className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap flex-shrink-0 min-w-fit">
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
      </div>
    </header>
  );
}

