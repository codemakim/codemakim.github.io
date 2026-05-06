import Link from "next/link";
import { notFound } from "next/navigation";
import { allPosts, allReactMasteryTopics } from "contentlayer/generated";
import { getTopicBySlug } from "@/app/lib/reactMastery/getTopics";
import { MDXContent } from "@/app/components/react-mastery/MDXContent";
import TopicReadToggle from "@/app/components/react-mastery/TopicReadToggle";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return allReactMasteryTopics.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const entry = getTopicBySlug(slug);
  if (!entry) return {};

  return {
    title: entry.doc?.title,
    description: entry.doc?.description,
  };
}

export default async function ReactMasteryTopicPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = getTopicBySlug(slug);
  if (!entry || !entry.doc) notFound();

  const { meta, doc } = entry;
  const legacyPosts = meta.legacyPostSlugs
    .map((s) => allPosts.find((p) => p.slug === s))
    .filter((p): p is (typeof allPosts)[number] => p != null && !p.draft);

  return (
    <div className="min-h-screen">
      <header className="header md:sticky md:top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-baseline gap-3">
          <Link
            href="/react-mastery"
            className="text-sm font-bold"
            style={{ color: "var(--accent)" }}
          >
            ← 마스터리
          </Link>
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            #{meta.order}
          </span>
          {doc.readingTimeMin != null && (
            <span className="text-xs ml-auto" style={{ color: "var(--text-secondary)" }}>
              {doc.readingTimeMin}분
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto md:px-4 py-8">
        <div className="px-4 md:px-0 mb-6">
          <h1 className="text-4xl font-black" style={{ color: "var(--text-primary)" }}>
            {doc.title}
          </h1>
          {doc.description && (
            <p className="mt-2 text-base" style={{ color: "var(--text-secondary)" }}>
              {doc.description}
            </p>
          )}
        </div>

        <article className="post-content prose px-4 md:px-6 py-6 text-lg">
          <MDXContent code={doc.body.code} />
        </article>

        {legacyPosts.length > 0 && (
          <section className="px-4 md:px-6 py-6">
            <h3 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              내가 예전에 정리한 입문 노트
            </h3>
            <ul className="space-y-2">
              {legacyPosts.map((p) => (
                <li key={p.slug}>
                  <Link href={p.url} className="text-sm underline" style={{ color: "var(--accent)" }}>
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="px-4 md:px-0 pb-10 pt-2 flex justify-center">
          <TopicReadToggle slug={meta.slug} />
        </div>
      </main>
    </div>
  );
}
