import { getPublicPosts } from "./lib/posts";
import HeroSection from "./components/HeroSection";
import FeatureTiles from "./components/FeatureTiles";
import FeatureTile from "./components/FeatureTile";
import LatestPosts from "./components/LatestPosts";
import HeaderAuth from "./components/HeaderAuth";

export default function LandingPage() {
  // 최신 포스트 8개 가져오기 (빌드 시점에 렌더링)
  const latestPosts = getPublicPosts()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-4 flex justify-end">
        <HeaderAuth />
      </div>
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
            minHeight="min-h-[200px]"
            padding="p-6"
            titleSize="text-2xl"
          />
          <FeatureTile
            href="/habits"
            title="매일두잇"
            actionText="습관 만들기 시작하기"
            minHeight="min-h-[200px]"
            padding="p-6"
            titleSize="text-2xl"
          />
          <FeatureTile
            href="/games"
            title="게임 코너"
            description="간단한 웹 게임 모음"
            actionText="게임 하러 가기"
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
