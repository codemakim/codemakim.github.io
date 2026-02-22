import PageHeader from '@/app/components/habits/PageHeader';
import GameCard from '@/app/components/games/GameCard';
import { GAMES } from '@/app/lib/games/constants';

export default function GamesPage() {
  return (
    <div className="min-h-screen">
      <PageHeader subtitle="간단한 웹 게임 모음" />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GAMES.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
        <p className="text-center text-xs text-zinc-400 dark:text-zinc-600 mt-8">
          로그인 없이 즐기는 무료 게임 · 최고 점수는 이 기기에 저장됩니다
        </p>
      </main>
    </div>
  );
}
