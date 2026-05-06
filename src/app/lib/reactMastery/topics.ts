export interface TopicMeta {
  slug: string;
  group?: string;
  order: number;
  legacyPostSlugs: string[];
  prerequisites?: string[];
}

export const TOPIC_TREE: TopicMeta[] = [
  { slug: "react-rendering-model",        order: 1,  group: "core",           legacyPostSlugs: [] },
  { slug: "state-and-snapshot",           order: 2,  group: "core",           legacyPostSlugs: [] },
  { slug: "use-effect-is-not-lifecycle",  order: 3,  group: "effects",        legacyPostSlugs: [] },
  { slug: "reconciliation-and-key",       order: 4,  group: "internals",      legacyPostSlugs: [] },
  { slug: "fiber-architecture",           order: 5,  group: "internals",      legacyPostSlugs: [] },
  { slug: "render-and-commit-phase",      order: 6,  group: "internals",      legacyPostSlugs: [] },
  { slug: "memo-real-cost",               order: 7,  group: "performance",    legacyPostSlugs: [] },
  { slug: "context-performance-pitfalls", order: 8,  group: "performance",    legacyPostSlugs: [] },
  { slug: "suspense-and-concurrent",      order: 9,  group: "concurrent",     legacyPostSlugs: [] },
  { slug: "rsc-and-hydration",            order: 10, group: "concurrent",     legacyPostSlugs: [] },
  { slug: "react-compiler-paradigm",      order: 11, group: "performance",    legacyPostSlugs: [] },
  { slug: "profiler-render-tracking",     order: 12, group: "performance",    legacyPostSlugs: [] },
];

export const TOPIC_GROUPS: Record<string, string> = {
  core: "코어",
  effects: "Effect",
  internals: "내부 원리",
  performance: "성능 / 최적화",
  concurrent: "동시성 / 서버",
};

export function getTopicMeta(slug: string): TopicMeta | undefined {
  return TOPIC_TREE.find((t) => t.slug === slug);
}
