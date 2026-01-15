import { getPublicPosts } from "./lib/posts";
import HeroSection from "./components/HeroSection";
import FeatureTiles from "./components/FeatureTiles";
import FeatureTile from "./components/FeatureTile";
import LatestPosts from "./components/LatestPosts";

export default function LandingPage() {
  // 최신 포스트 8개 가져오기 (빌드 시점에 렌더링)
  const latestPosts = getPublicPosts()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return (
    <div className="min-h-screen">
      <HeroSection
        title="그냥 블로그"
        description="블로그, 습관 관리, 그리고 더 많은 것들"
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <FeatureTiles className="mb-12">
          <FeatureTile
            href="/blog"
            title="블로그"
            description="웹 개발과 기술 이야기"
            actionText="모든 포스트 보기"
            colSpan="md:col-span-2"
            minHeight="min-h-[200px]"
            padding="p-8"
            titleSize="text-3xl"
          />
          <FeatureTile
            href="/habits"
            title="매일두잇"
            actionText="습관 만들기 시작하기"
            minHeight="min-h-[200px]"
            padding="p-6"
            titleSize="text-2xl"
          />
        </FeatureTiles>
        <LatestPosts posts={latestPosts} />
      </main>
    </div>
  );
}
