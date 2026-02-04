"use client";

import { useEffect, useMemo, useState } from "react";
import {
  isPostRead,
  resetPostsRead,
  subscribePostReads,
} from "@/app/lib/postReads";

interface SeriesStudyStatusProps {
  seriesName: string;
  postPaths: string[];
  className?: string;
}

export default function SeriesStudyStatus({
  seriesName,
  postPaths,
  className = "",
}: SeriesStudyStatusProps) {
  const [mounted, setMounted] = useState(false);
  const [readCount, setReadCount] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  const total = postPaths.length;

  const percent = useMemo(() => {
    if (total === 0) return 0;
    return Math.round((readCount / total) * 100);
  }, [readCount, total]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const sync = () => {
      let count = 0;
      for (const p of postPaths) {
        if (isPostRead(p)) count += 1;
      }
      setReadCount(count);
    };

    sync();
    return subscribePostReads(sync);
  }, [mounted, postPaths]);

  if (!mounted || total === 0) return null;

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-zinc-700 dark:text-[#A0A0A0]">
          <span className="font-medium text-zinc-900 dark:text-white">내 학습률</span>{" "}
          <span className="tabular-nums">
            {readCount}/{total} ({percent}%)
          </span>
        </div>

        <button
          type="button"
          className={`
            text-xs px-3 py-1 rounded-full border
            border-zinc-300 dark:border-[#2A2A2A]
            bg-white dark:bg-[#0B0B0B]
            text-zinc-700 dark:text-[#A0A0A0]
            hover:bg-zinc-50 dark:hover:bg-[#1A1A1A]
            transition-colors
            ${isResetting ? "opacity-60 cursor-not-allowed" : ""}
          `}
          disabled={isResetting}
          onClick={() => {
            if (isResetting) return;
            const ok = window.confirm(
              `[${seriesName}] 시리즈의 읽음 체크를 모두 초기화할까요?`
            );
            if (!ok) return;

            setIsResetting(true);
            resetPostsRead(postPaths);
            window.setTimeout(() => setIsResetting(false), 1000);
          }}
        >
          초기화
        </button>
      </div>

      <div className="mt-2" aria-label="내 학습률">
        <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-[#2A2A2A] overflow-hidden">
          <div
            className="progress-bar h-2 rounded-full transition-all"
            style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            role="progressbar"
          />
        </div>
      </div>
    </div>
  );
}

