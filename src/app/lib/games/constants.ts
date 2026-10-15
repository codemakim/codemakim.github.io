import type { GameInfo } from './types';
import ThumbnailMinesweeper from '@/app/components/games/thumbnails/ThumbnailMinesweeper';
import ThumbnailBlockDrop from '@/app/components/games/thumbnails/ThumbnailBlockDrop';

export const GAMES: GameInfo[] = [
  {
    id: 'minesweeper',
    title: '지뢰찾기',
    description: '지뢰를 피해 모든 칸을 열어라',
    href: '/games/minesweeper',
    thumbnail: ThumbnailMinesweeper,
    desktopOnly: true,
  },
  {
    id: 'block-drop',
    title: '블록 드롭',
    description: '블록을 쌓아 줄을 완성해라',
    href: '/games/block-drop',
    thumbnail: ThumbnailBlockDrop,
    desktopOnly: true,
  },
];

export function getBestScore(gameId: string): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(`game_best_${gameId}`) || '0', 10);
}

export function saveBestScore(gameId: string, score: number): void {
  const current = getBestScore(gameId);
  if (score > current) {
    localStorage.setItem(`game_best_${gameId}`, String(score));
  }
}
