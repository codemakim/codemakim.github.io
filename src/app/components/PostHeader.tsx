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
      const scrollContainer = document.querySelector(".app-wrapper");
      const scrollY = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
      setIsScrolled(scrollY > 100);
    };

    const scrollContainer = document.querySelector(".app-wrapper");
    const target = scrollContainer || window;
    target.addEventListener("scroll", handleScroll);
    return () => target.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`header md:sticky md:top-0 z-50 transition-all duration-300 ${
        isScrolled ? "py-3" : "py-6"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4">
        <div className={`transition-all duration-300 ${isScrolled ? "mb-2" : "mb-4"}`}>
          <Link href="/blog" className="link text-sm font-bold hover:underline">
            ← 블로그로 돌아가기
          </Link>
        </div>

        <h1
          className={`font-black tracking-tight transition-all duration-300 ${
            isScrolled ? "text-xl" : "text-4xl"
          }`}
          style={{ color: "var(--text-primary)" }}
        >
          {post.title}
        </h1>

        {post.description && (
          <p
            className={`text-lg mt-2 transition-all duration-300 ${
              isScrolled ? "opacity-0 max-h-0 overflow-hidden" : "opacity-100 max-h-20"
            }`}
            style={{ color: "var(--text-secondary)" }}
          >
            {post.description}
          </p>
        )}

        <div
          className={`flex items-center justify-between gap-4 transition-all duration-300 ${
            isScrolled ? "opacity-0 max-h-0 overflow-hidden mt-0" : "opacity-100 max-h-20 mt-4"
          }`}
        >
          <time className="text-xs font-mono font-bold" style={{ color: "var(--text-secondary)" }}>
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
      </div>
    </header>
  );
}
