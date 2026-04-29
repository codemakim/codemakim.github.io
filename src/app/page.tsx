import { getPublicPosts } from "./lib/posts";
import HeroSection from "./components/HeroSection";
import FeatureTiles from "./components/FeatureTiles";
import FeatureTile from "./components/FeatureTile";
import LatestPosts from "./components/LatestPosts";
import HeaderAuth from "./components/HeaderAuth";

export default function LandingPage() {
  const latestPosts = getPublicPosts()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 pt-4 flex justify-end">
        <HeaderAuth />
      </div>
      <HeroSection
        title="그냥 블로그"
        description="블로그, 습관 관리, 그리고 더 많은 것들"
      />

      <main className="max-w-6xl mx-auto px-4 py-10">
        <FeatureTiles className="mb-12">
          <FeatureTile
            href="/blog"
            title="블로그"
            description="웹 개발과 기술 이야기"
            actionText="모든 포스트 보기"
          />
          <FeatureTile
            href="/habits"
            title="매일두잇"
            description="매일 하는 습관 관리"
            actionText="습관 만들기 시작하기"
          />
          <FeatureTile
            href="/games"
            title="게임 코너"
            description="간단한 웹 게임 모음"
            actionText="게임 하러 가기"
          />
        </FeatureTiles>
        <LatestPosts posts={latestPosts} />
      </main>
    </div>
  );
}
