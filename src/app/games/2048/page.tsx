'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import GameLayout from '@/app/components/games/GameLayout';
import { getBestScore, saveBestScore } from '@/app/lib/games/constants';
import { useGameAudio } from '@/app/components/games/useGameAudio';

const GAME_ID = '2048';
const SIZE = 4;

type Board = number[][];
type Direction = 'left' | 'right' | 'up' | 'down';
type Status = 'playing' | 'won' | 'lost' | 'idle';

function createEmptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function addRandomTile(board: Board): Board {
  const empty: [number, number][] = [];
  board.forEach((row, r) => row.forEach((v, c) => { if (v === 0) empty.push([r, c]); }));
  if (empty.length === 0) return board;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const newBoard = board.map(row => [...row]);
  newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
}

function slideAndMerge(line: number[]): { result: number[]; score: number } {
  const filtered = line.filter(v => v !== 0);
  let score = 0;
  const merged: number[] = [];
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const val = filtered[i] * 2;
      merged.push(val);
      score += val;
      i += 2;
    } else {
      merged.push(filtered[i]);
      i++;
    }
  }
  while (merged.length < SIZE) merged.push(0);
  return { result: merged, score };
}

function moveBoard(board: Board, direction: Direction): { board: Board; score: number; moved: boolean } {
  let newBoard = board.map(row => [...row]);
  let totalScore = 0;
  let moved = false;

  const processLine = (line: number[]) => {
    const { result, score } = slideAndMerge(line);
    totalScore += score;
    const changed = line.some((v, i) => v !== result[i]);
    if (changed) moved = true;
    return result;
  };

  if (direction === 'left') {
    newBoard = newBoard.map(row => processLine(row));
  } else if (direction === 'right') {
    newBoard = newBoard.map(row => processLine([...row].reverse()).reverse());
  } else if (direction === 'up') {
    for (let c = 0; c < SIZE; c++) {
      const col = newBoard.map(row => row[c]);
      const result = processLine(col);
      result.forEach((v, r) => { newBoard[r][c] = v; });
    }
  } else {
    for (let c = 0; c < SIZE; c++) {
      const col = newBoard.map(row => row[c]).reverse();
      const result = processLine(col).reverse();
      result.forEach((v, r) => { newBoard[r][c] = v; });
    }
  }

  return { board: newBoard, score: totalScore, moved };
}

function canMove(board: Board): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) return true;
      if (c + 1 < SIZE && board[r][c] === board[r][c + 1]) return true;
      if (r + 1 < SIZE && board[r][c] === board[r + 1][c]) return true;
    }
  }
  return false;
}

function hasWon(board: Board): boolean {
  return board.some(row => row.some(v => v >= 2048));
}

function getTileClass(value: number): string {
  const classes: Record<number, string> = {
    0:    'bg-zinc-100 dark:bg-zinc-800',
    2:    'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white',
    4:    'bg-zinc-300 dark:bg-zinc-600 text-zinc-900 dark:text-white',
    8:    'bg-amber-200 dark:bg-amber-700 text-zinc-900 dark:text-white',
    16:   'bg-amber-300 dark:bg-amber-600 text-zinc-900 dark:text-white',
    32:   'bg-orange-300 dark:bg-orange-600 text-white',
    64:   'bg-orange-400 dark:bg-orange-500 text-white',
    128:  'bg-yellow-300 dark:bg-yellow-600 text-zinc-900 dark:text-white',
    256:  'bg-yellow-400 dark:bg-yellow-500 text-zinc-900 dark:text-white',
    512:  'bg-green-400 dark:bg-green-600 text-white',
    1024: 'bg-blue-400 dark:bg-blue-600 text-white',
    2048: 'bg-purple-500 dark:bg-purple-600 text-white',
  };
  return classes[value] || 'bg-purple-600 dark:bg-purple-500 text-white';
}

function getTileTextSize(value: number): string {
  if (value >= 1000) return 'text-lg md:text-xl';
  if (value >= 100) return 'text-xl md:text-2xl';
  return 'text-2xl md:text-3xl';
}

function initGame(): { board: Board; score: number; status: Status } {
  let board = createEmptyBoard();
  board = addRandomTile(board);
  board = addRandomTile(board);
  return { board, score: 0, status: 'playing' };
}

export default function Game2048() {
  const [board, setBoard] = useState<Board>(createEmptyBoard);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [status, setStatus] = useState<Status>('idle');
  const [wonShown, setWonShown] = useState(false);
  const touchStart = useRef({ x: 0, y: 0 });
  const { playBeep, playSuccess, playFail } = useGameAudio();

  useEffect(() => {
    setBestScore(getBestScore(GAME_ID));
    const { board: b, score: s, status: st } = initGame();
    setBoard(b);
    setScore(s);
    setStatus(st);
  }, []);

  const restart = useCallback(() => {
    const { board: b, score: s, status: st } = initGame();
    setBoard(b);
    setScore(s);
    setStatus(st);
    setWonShown(false);
  }, []);

  const move = useCallback((direction: Direction) => {
    setBoard(prev => {
      if (status === 'lost') return prev;
      const { board: newBoard, score: gained, moved } = moveBoard(prev, direction);
      if (!moved) return prev;

      let nextBoard = addRandomTile(newBoard);
      setScore(s => {
        const next = s + gained;
        saveBestScore(GAME_ID, next);
        setBestScore(getBestScore(GAME_ID));
        return next;
      });

      if (gained > 0) playBeep(523 + gained, 0.08);

      if (!wonShown && hasWon(nextBoard)) {
        setStatus('won');
        setWonShown(true);
        playSuccess();
      } else if (!canMove(nextBoard)) {
        setStatus('lost');
        playFail();
      }

      return nextBoard;
    });
  }, [status, wonShown, playBeep, playSuccess, playFail]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const map: Record<string, Direction> = {
        ArrowLeft: 'left', ArrowRight: 'right',
        ArrowUp: 'up', ArrowDown: 'down',
      };
      if (map[e.key]) {
        e.preventDefault();
        move(map[e.key]);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [move]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const minSwipe = 30;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipe) {
      move(dx > 0 ? 'right' : 'left');
    } else if (Math.abs(dy) > minSwipe) {
      move(dy > 0 ? 'down' : 'up');
    }
  };

  const displayStatus = status === 'lost' ? 'lost' : (status === 'won' && wonShown) ? 'won' : undefined;

  return (
    <GameLayout
      title="2048"
      score={score}
      bestScore={bestScore}
      onRestart={restart}
      status={displayStatus}
    >
      {/* 게임 설명 */}
      <div className="card-content px-4 py-3 mb-4 max-w-[420px] mx-auto">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          방향키(또는 스와이프)로 모든 타일을 밀면, 같은 숫자끼리 합쳐진다.
          합쳐질 때마다 점수가 올라가고, <strong className="text-zinc-700 dark:text-zinc-300">2048</strong> 타일을 만들면 승리한다.
        </p>
      </div>

      <div
        className="grid grid-cols-4 gap-2 p-3 card-content max-w-[420px] mx-auto select-none touch-none"
        style={{ aspectRatio: '1' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {board.map((row, r) =>
          row.map((value, c) => (
            <div
              key={`${r}-${c}`}
              className={`
                rounded-lg flex items-center justify-center font-bold
                transition-all duration-100
                ${getTileClass(value)}
                ${getTileTextSize(value)}
              `}
            >
              {value > 0 ? value : ''}
            </div>
          ))
        )}
      </div>
      <p className="text-center text-xs text-zinc-400 dark:text-zinc-600 mt-4">
        방향키 또는 스와이프로 조작
      </p>
    </GameLayout>
  );
}
