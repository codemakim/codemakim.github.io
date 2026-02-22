import type { GameInfo } from './types';
import Thumbnail2048 from '@/app/components/games/thumbnails/Thumbnail2048';
import ThumbnailSnake from '@/app/components/games/thumbnails/ThumbnailSnake';
import ThumbnailMinesweeper from '@/app/components/games/thumbnails/ThumbnailMinesweeper';
import ThumbnailMemory from '@/app/components/games/thumbnails/ThumbnailMemory';
import ThumbnailBlockDrop from '@/app/components/games/thumbnails/ThumbnailBlockDrop';

export const GAMES: GameInfo[] = [
  {
    id: '2048',
    title: '2048',
    description: '숫자 타일을 합쳐 2048을 만들어라',
    href: '/games/2048',
    thumbnail: Thumbnail2048,
  },
  {
    id: 'snake',
    title: '스네이크',
    description: '뱀을 조종해 먹이를 먹어라',
    href: '/games/snake',
    thumbnail: ThumbnailSnake,
  },
  {
    id: 'minesweeper',
    title: '지뢰찾기',
    description: '지뢰를 피해 모든 칸을 열어라',
    href: '/games/minesweeper',
    thumbnail: ThumbnailMinesweeper,
  },
  {
    id: 'memory',
    title: '메모리 카드',
    description: '같은 쌍의 카드를 찾아라',
    href: '/games/memory',
    thumbnail: ThumbnailMemory,
  },
  {
    id: 'block-drop',
    title: '블록 드롭',
    description: '블록을 쌓아 줄을 완성해라',
    href: '/games/block-drop',
    thumbnail: ThumbnailBlockDrop,
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
