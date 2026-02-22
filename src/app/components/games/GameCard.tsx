import Link from 'next/link';
import type { GameInfo } from '@/app/lib/games/types';

interface GameCardProps {
  game: GameInfo;
}

export default function GameCard({ game }: GameCardProps) {
  const Thumbnail = game.thumbnail;
  return (
    <Link href={game.href} className="card group block relative">
      {game.desktopOnly && (
        <span className="md:hidden absolute top-2 right-2 z-10 text-[10px] px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-200 dark:bg-zinc-300 dark:text-zinc-800">
          PC 전용
        </span>
      )}
      <div className="aspect-square flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-t-[1rem] overflow-hidden">
        <Thumbnail />
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">
          {game.title}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {game.description}
        </p>
      </div>
    </Link>
  );
}
