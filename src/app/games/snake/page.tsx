'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import GameLayout from '@/app/components/games/GameLayout';
import { getBestScore, saveBestScore } from '@/app/lib/games/constants';
import { useGameAudio } from '@/app/components/games/useGameAudio';

const GAME_ID = 'snake';
const BOARD_SIZE = 20;
const INITIAL_SPEED = 150;
const CELL_SIZE = Math.min(Math.floor((typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, 420) : 420) / BOARD_SIZE), 22);

type Dir = 'left' | 'right' | 'up' | 'down';
type Point = { x: number; y: number };

function randomPoint(snake: Point[]): Point {
  let p: Point;
  do {
    p = { x: Math.floor(Math.random() * BOARD_SIZE), y: Math.floor(Math.random() * BOARD_SIZE) };
  } while (snake.some(s => s.x === p.x && s.y === p.y));
  return p;
}

function isDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

const COLORS = {
  light: { bg: '#fafafa', grid: '#e4e4e7', head: '#3f3f46', body: '#71717a', food: '#ef4444' },
  dark:  { bg: '#1a1a1a', grid: '#2a2a2a', head: '#ffffff', body: '#d4d4d8', food: '#f87171' },
};

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const dirRef = useRef<Dir>('right');
  // 입력 큐: 최대 3개까지 미리 입력을 버퍼링
  const dirQueue = useRef<Dir[]>([]);
  const foodRef = useRef<Point>({ x: 15, y: 10 });
  const scoreRef = useRef(0);
  const statusRef = useRef<'playing' | 'idle' | 'lost'>('idle');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost' | 'idle'>('idle');
  const [canvasSize, setCanvasSize] = useState(0);
  const touchStart = useRef({ x: 0, y: 0 });
  const { playBeep, playFail } = useGameAudio();

  useEffect(() => {
    setBestScore(getBestScore(GAME_ID));
    const size = Math.min(
      typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, 420) : 420,
      420
    );
    setCanvasSize(Math.floor(size / BOARD_SIZE) * BOARD_SIZE);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cs = canvas.width / BOARD_SIZE;
    const dark = isDark();
    const c = dark ? COLORS.dark : COLORS.light;

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 격자
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= BOARD_SIZE; i++) {
      ctx.beginPath(); ctx.moveTo(i * cs, 0); ctx.lineTo(i * cs, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * cs); ctx.lineTo(canvas.width, i * cs); ctx.stroke();
    }

    // 먹이
    const f = foodRef.current;
    ctx.fillStyle = c.food;
    ctx.beginPath();
    ctx.arc(f.x * cs + cs / 2, f.y * cs + cs / 2, cs / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // 뱀
    snakeRef.current.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? c.head : c.body;
      const pad = i === 0 ? 1 : 2;
      ctx.fillRect(seg.x * cs + pad, seg.y * cs + pad, cs - pad * 2, cs - pad * 2);
    });
  }, []);

  const stopLoop = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const gameOver = useCallback(() => {
    stopLoop();
    statusRef.current = 'lost';
    setStatus('lost');
    saveBestScore(GAME_ID, scoreRef.current);
    setBestScore(getBestScore(GAME_ID));
    playFail();
  }, [stopLoop, playFail]);

  const tick = useCallback(() => {
    // 큐에서 다음 방향을 꺼낸다. 없으면 현재 방향 유지
    if (dirQueue.current.length > 0) {
      dirRef.current = dirQueue.current.shift()!;
    }
    const snake = snakeRef.current;
    const head = snake[0];
    let nx = head.x, ny = head.y;
    if (dirRef.current === 'left') nx--;
    else if (dirRef.current === 'right') nx++;
    else if (dirRef.current === 'up') ny--;
    else ny++;

    // 벽 충돌
    if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) { gameOver(); return; }
    // 자기 몸 충돌
    if (snake.some(s => s.x === nx && s.y === ny)) { gameOver(); return; }

    const newHead = { x: nx, y: ny };
    const ateFood = nx === foodRef.current.x && ny === foodRef.current.y;
    const newSnake = [newHead, ...snake];
    if (!ateFood) newSnake.pop();
    else {
      const newScore = scoreRef.current + 10;
      scoreRef.current = newScore;
      setScore(newScore);
      foodRef.current = randomPoint(newSnake);
      playBeep(600, 0.08);
    }
    snakeRef.current = newSnake;
    draw();
  }, [gameOver, draw, playBeep]);

  const startLoop = useCallback((speed: number) => {
    stopLoop();
    intervalRef.current = setInterval(tick, speed);
  }, [stopLoop, tick]);

  const restart = useCallback(() => {
    stopLoop();
    snakeRef.current = [{ x: 10, y: 10 }];
    dirRef.current = 'right';
    dirQueue.current = [];
    foodRef.current = randomPoint([{ x: 10, y: 10 }]);
    scoreRef.current = 0;
    setScore(0);
    statusRef.current = 'playing';
    setStatus('playing');
    setBestScore(getBestScore(GAME_ID));
    draw();
    startLoop(INITIAL_SPEED);
  }, [stopLoop, draw, startLoop]);

  useEffect(() => {
    if (canvasSize > 0) {
      draw();
    }
  }, [canvasSize, draw]);

  useEffect(() => {
    const OPPOSITE: Record<Dir, Dir> = { left: 'right', right: 'left', up: 'down', down: 'up' };
    const handleKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
        a: 'left', d: 'right', w: 'up', s: 'down',
        A: 'left', D: 'right', W: 'up', S: 'down',
      };
      if (!map[e.key]) return;
      e.preventDefault();
      const next = map[e.key];
      const queue = dirQueue.current;
      // 큐의 마지막 방향(없으면 현재 방향)을 기준으로 반대 방향 체크
      const lastDir = queue.length > 0 ? queue[queue.length - 1] : dirRef.current;
      if (next === OPPOSITE[lastDir]) return;
      // 동일 방향 연속 입력 무시, 큐 최대 3개
      if (queue[queue.length - 1] !== next && queue.length < 3) {
        queue.push(next);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const OPPOSITE: Record<Dir, Dir> = { left: 'right', right: 'left', up: 'down', down: 'up' };
    const min = 30;
    let next: Dir | null = null;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > min) next = dx > 0 ? 'right' : 'left';
    else if (Math.abs(dy) > min) next = dy > 0 ? 'down' : 'up';
    if (!next) return;
    const queue = dirQueue.current;
    const lastDir = queue.length > 0 ? queue[queue.length - 1] : dirRef.current;
    if (next !== OPPOSITE[lastDir] && queue[queue.length - 1] !== next && queue.length < 3) {
      queue.push(next);
    }
  };

  useEffect(() => () => stopLoop(), [stopLoop]);

  return (
    <GameLayout
      title="스네이크"
      score={score}
      bestScore={bestScore}
      onRestart={restart}
      status={status === 'lost' ? 'lost' : undefined}
      desktopOnly
    >
      <div className="flex flex-col items-center gap-4">
        {status === 'idle' && (
          <button onClick={restart} className="btn-primary px-8 py-3">
            게임 시작
          </button>
        )}
        {canvasSize > 0 && (
          <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            className="rounded-xl border border-zinc-200 dark:border-zinc-700 touch-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />
        )}
        <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
          방향키(WASD) 또는 스와이프로 조작
        </p>
      </div>
    </GameLayout>
  );
}
