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
        <span
          className="md:hidden absolute top-2 right-2 z-10 text-[10px] px-1.5 py-0.5 font-bold"
          style={{ background: "var(--nb-color)", color: "var(--bg-primary)", border: "var(--nb-border-thin)" }}
        >
          PC 전용
        </span>
      )}
      <div
        className="aspect-square flex items-center justify-center p-4 overflow-hidden"
        style={{ background: "var(--bg-secondary)", borderBottom: "var(--nb-border)" }}
      >
        <Thumbnail />
      </div>
      <div className="p-3">
        <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
          {game.title}
        </h3>
        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
          {game.description}
        </p>
      </div>
    </Link>
  );
}
