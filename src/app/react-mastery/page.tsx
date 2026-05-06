import Link from "next/link";
import TopicTree from "@/app/components/react-mastery/TopicTree";
import TodayCard from "@/app/components/react-mastery/TodayCard";
import ProgressBar from "@/app/components/react-mastery/ProgressBar";
import { getTopicEntries, getWrittenTopicSlugs } from "@/app/lib/reactMastery/getTopics";

export const metadata = {
  title: "React 마스터리 트랙",
  description: "Vue/Spring 7년차 → 시니어 React 전환 코스",
};

export default function ReactMasteryPage() {
  const entries = getTopicEntries();
  const writtenSlugs = getWrittenTopicSlugs();

  return (
    <div className="min-h-screen">
      <header className="header md:sticky md:top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="block hover:opacity-80 transition-opacity">
            <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
              React 마스터리
            </h1>
          </Link>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            시니어 React 전환 코스
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <TodayCard />
        <ProgressBar writtenSlugs={writtenSlugs} />
        <TopicTree entries={entries} />
      </main>
    </div>
  );
}
