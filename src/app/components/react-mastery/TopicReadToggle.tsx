"use client";

import { toggleTopicRead, useTopicRead } from "@/app/lib/reactMastery/readState";

interface Props {
  slug: string;
}

export default function TopicReadToggle({ slug }: Props) {
  const read = useTopicRead(slug);

  return (
    <button
      type="button"
      onClick={() => toggleTopicRead(slug)}
      className="card px-6 py-3 text-sm font-bold"
      style={{
        background: read ? "var(--accent)" : "var(--bg-card)",
        color: read ? "var(--accent-text)" : "var(--text-primary)",
        cursor: "pointer",
      }}
      aria-pressed={read}
    >
      {read ? "✓ 읽음" : "읽음으로 표시"}
    </button>
  );
}
