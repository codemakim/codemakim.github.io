import Link from "next/link";
import { TOPIC_GROUPS } from "@/app/lib/reactMastery/topics";
import type { TopicEntry } from "@/app/lib/reactMastery/getTopics";

interface Props {
  entries: TopicEntry[];
}

export default function TopicTree({ entries }: Props) {
  const groups = new Map<string, TopicEntry[]>();

  for (const entry of entries) {
    const key = entry.meta.group ?? "ungrouped";
    const list = groups.get(key) ?? [];
    list.push(entry);
    groups.set(key, list);
  }

  return (
    <div className="space-y-8">
      {[...groups.entries()].map(([groupKey, list]) => (
        <section key={groupKey}>
          <h2
            className="text-xl font-black mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            {TOPIC_GROUPS[groupKey] ?? groupKey}
          </h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {list.map((entry) => (
              <li key={entry.meta.slug}>
                <TopicCard entry={entry} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function TopicCard({ entry }: { entry: TopicEntry }) {
  const { meta, doc } = entry;

  if (!doc) {
    return (
      <div
        className="card-content p-4"
        style={{ opacity: 0.55, cursor: "default" }}
      >
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            #{meta.order}
          </span>
          <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
            준비 중
          </span>
        </div>
        <h3
          className="text-lg font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {meta.slug}
        </h3>
      </div>
    );
  }

  return (
    <Link href={`/react-mastery/${meta.slug}`} className="card p-4 block">
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          #{meta.order}
        </span>
        {doc.readingTimeMin != null && (
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {doc.readingTimeMin}분
          </span>
        )}
      </div>
      <h3
        className="text-lg font-bold mb-1"
        style={{ color: "var(--text-primary)" }}
      >
        {doc.title}
      </h3>
      {doc.description && (
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {doc.description}
        </p>
      )}
    </Link>
  );
}
