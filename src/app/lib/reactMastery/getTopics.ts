import { allReactMasteryTopics, type ReactMasteryTopic } from "contentlayer/generated";
import { TOPIC_TREE, type TopicMeta } from "./topics";

export interface TopicEntry {
  meta: TopicMeta;
  /** mdx 본문이 작성된 경우 doc, 미작성이면 null */
  doc: ReactMasteryTopic | null;
}

/**
 * topics.ts의 순서대로 트리 엔트리를 반환. 미작성 토픽도 doc=null로 포함.
 */
export function getTopicEntries(): TopicEntry[] {
  const docBySlug = new Map<string, ReactMasteryTopic>();
  for (const doc of allReactMasteryTopics) {
    docBySlug.set(doc.slug, doc);
  }
  return [...TOPIC_TREE]
    .sort((a, b) => a.order - b.order)
    .map((meta) => ({
      meta,
      doc: docBySlug.get(meta.slug) ?? null,
    }));
}

/**
 * mdx 본문이 작성된 토픽의 slug 배열 (정적 라우트 생성 + 진행률 계산용).
 */
export function getWrittenTopicSlugs(): string[] {
  return allReactMasteryTopics.map((d) => d.slug);
}

/**
 * 단일 토픽 조회 (slug → 본문 doc + 메타). 본문 없으면 null.
 */
export function getTopicBySlug(slug: string): TopicEntry | null {
  const doc = allReactMasteryTopics.find((d) => d.slug === slug);
  if (!doc) return null;
  const meta = TOPIC_TREE.find((t) => t.slug === slug);
  if (!meta) return null;
  return { meta, doc };
}
