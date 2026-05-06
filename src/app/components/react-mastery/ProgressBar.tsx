"use client";

import { useReadCount } from "@/app/lib/reactMastery/readState";

interface Props {
  /** mdx로 본문이 작성된 토픽 slug 배열 */
  writtenSlugs: string[];
}

export default function ProgressBar({ writtenSlugs }: Props) {
  const read = useReadCount(writtenSlugs);
  const total = writtenSlugs.length;
  const pct = total === 0 ? 0 : Math.round((read / total) * 100);

  return (
    <div className="card-content p-4">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          진행률
        </span>
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {read} / {total} ({pct}%)
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: 12,
          background: "var(--bg-secondary)",
          border: "var(--nb-border-thin)",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: "var(--progress-color)",
            transition: "width 0.2s ease",
          }}
        />
      </div>
    </div>
  );
}
