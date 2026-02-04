"use client";

import { useEffect, useMemo, useState } from "react";
import {
  isPostRead,
  subscribePostReads,
  togglePostRead,
} from "@/app/lib/postReads";

interface ReadToggleButtonProps {
  postPath: string;
  size?: "sm" | "md";
  className?: string;
}

export default function ReadToggleButton({
  postPath,
  size = "md",
  className = "",
}: ReadToggleButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [isReadState, setIsReadState] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [checkAnimKey, setCheckAnimKey] = useState(0);

  const dims = useMemo(() => {
    return size === "sm"
      ? { btn: "w-10 h-10", icon: "w-6 h-6", bubbleTop: "-top-9" }
      : { btn: "w-12 h-12", icon: "w-7 h-7", bubbleTop: "-top-10" };
  }, [size]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const sync = () => setIsReadState(isPostRead(postPath));
    sync();

    return subscribePostReads(sync);
  }, [mounted, postPath]);

  if (!mounted) return null;

  const label = isReadState ? "봤어요!" : "봤나요?";

  return (
    <div className={`relative ${className}`}>
      {/* 말풍선 (항상 표시) */}
      <div
        className={`
          pointer-events-none absolute ${dims.bubbleTop} left-1/2 -translate-x-1/2
          px-3 py-1 rounded-full text-xs whitespace-nowrap shadow-sm
          bg-zinc-900 text-white
          dark:bg-zinc-50 dark:text-zinc-900
          transition-transform duration-200
          ${isLocked ? "scale-95" : "scale-100"}
        `}
        aria-hidden="true"
      >
        {label}
        <div
          className={`
            absolute left-1/2 -bottom-1 w-2 h-2 -translate-x-1/2 rotate-45
            bg-zinc-900 dark:bg-zinc-50
          `}
        />
      </div>

      <button
        type="button"
        onClick={() => {
          if (isLocked) return;
          setIsLocked(true);

          const next = togglePostRead(postPath);
          setIsReadState(next);
          if (next) setCheckAnimKey((k) => k + 1);

          window.setTimeout(() => setIsLocked(false), 1000);
        }}
        disabled={isLocked}
        className={`
          ${dims.btn} rounded-full border-2 transition-all duration-200
          flex items-center justify-center
          ${isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
          ${
            isReadState
              ? "bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white shadow-lg scale-100"
              : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-white hover:shadow-md hover:scale-105 active:scale-95"
          }
        `}
        aria-label={isReadState ? "읽음 취소" : "읽음 처리"}
        title={isReadState ? "읽음 취소" : "읽음 처리"}
      >
        {isReadState ? (
          <svg
            key={checkAnimKey}
            className={`${dims.icon} text-white dark:text-zinc-900 animate-checkmark`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{
              strokeDasharray: "20",
              strokeDashoffset: "0",
              animation: "drawCheckmark 0.3s ease-out forwards",
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className={`${dims.icon} text-zinc-600 dark:text-zinc-400`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

