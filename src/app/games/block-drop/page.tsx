'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import GameLayout from '@/app/components/games/GameLayout';
import { getBestScore, saveBestScore } from '@/app/lib/games/constants';
import { useGameAudio } from '@/app/components/games/useGameAudio';

const GAME_ID = 'block-drop';
const BOARD_W = 10;
const BOARD_H = 20;

type Color = string | null;
type Board = Color[][];

const PIECES = [
  { shape: [[1,1,1,1]],           colorL: '#06b6d4', colorD: '#22d3ee' }, // I - 시안
  { shape: [[1,1],[1,1]],         colorL: '#eab308', colorD: '#facc15' }, // O - 노랑
  { shape: [[0,1,0],[1,1,1]],     colorL: '#a855f7', colorD: '#c084fc' }, // T - 보라
  { shape: [[0,1,1],[1,1,0]],     colorL: '#22c55e', colorD: '#4ade80' }, // S - 초록
  { shape: [[1,1,0],[0,1,1]],     colorL: '#ef4444', colorD: '#f87171' }, // Z - 빨강
  { shape: [[1,0,0],[1,1,1]],     colorL: '#3b82f6', colorD: '#60a5fa' }, // J - 파랑
  { shape: [[0,0,1],[1,1,1]],     colorL: '#f97316', colorD: '#fb923c' }, // L - 주황
] as const;

const LINE_SCORES = [0, 100, 300, 500, 800];

function emptyBoard(): Board {
  return Array.from({ length: BOARD_H }, () => Array(BOARD_W).fill(null));
}

function rotate(shape: number[][]): number[][] {
  const rows = shape.length, cols = shape[0].length;
  return Array.from({ length: cols }, (_, c) =>
    Array.from({ length: rows }, (__, r) => shape[rows - 1 - r][c])
  );
}

function isDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

interface Piece {
  shape: number[][];
  color: string;
  x: number;
  y: number;
}

function randomPiece(dark: boolean): Piece {
  const idx = Math.floor(Math.random() * PIECES.length);
  const p = PIECES[idx];
  return {
    shape: p.shape.map(r => [...r]),
    color: dark ? p.colorD : p.colorL,
    x: Math.floor((BOARD_W - p.shape[0].length) / 2),
    y: 0,
  };
}

function fits(board: Board, shape: number[][], x: number, y: number): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nr = y + r, nc = x + c;
      if (nr >= BOARD_H || nc < 0 || nc >= BOARD_W) return false;
      if (nr >= 0 && board[nr][nc]) return false;
    }
  }
  return true;
}

function lockPiece(board: Board, piece: Piece): Board {
  const nb = board.map(row => [...row]);
  piece.shape.forEach((row, r) => {
    row.forEach((v, c) => {
      if (v && piece.y + r >= 0) nb[piece.y + r][piece.x + c] = piece.color;
    });
  });
  return nb;
}

function clearLines(board: Board): { board: Board; lines: number } {
  const remaining = board.filter(row => row.some(cell => !cell));
  const cleared = BOARD_H - remaining.length;
  const newRows = Array.from({ length: cleared }, () => Array(BOARD_W).fill(null));
  return { board: [...newRows, ...remaining], lines: cleared };
}

function getSpeed(level: number) {
  return Math.max(80, 800 - (level - 1) * 70);
}

export default function BlockDropGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<Board>(emptyBoard());
  const pieceRef = useRef<Piece | null>(null);
  const nextPieceRef = useRef<Piece | null>(null);
  const scoreRef = useRef(0);
  const levelRef = useRef(1);
  const linesRef = useRef(0);
  const statusRef = useRef<'idle' | 'playing' | 'lost'>('idle');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStart = useRef({ x: 0, y: 0, time: 0 });
  const lastTap = useRef(0);

  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost' | 'idle'>('idle');
  const [canvasW, setCanvasW] = useState(200);
  const [canvasH, setCanvasH] = useState(400);
  const [cellSize, setCellSize] = useState(20);
  const { playBeep, playSuccess, playFail } = useGameAudio();

  useEffect(() => {
    setBestScore(getBestScore(GAME_ID));
    const maxW = Math.min((typeof window !== 'undefined' ? window.innerWidth - 32 : 400), 300);
    const cs = Math.floor(Math.min(maxW / BOARD_W, 28));
    setCellSize(cs);
    setCanvasW(cs * BOARD_W);
    setCanvasH(cs * BOARD_H);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || cellSize === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dark = isDark();
    const cs = cellSize;

    ctx.fillStyle = dark ? '#1a1a1a' : '#fafafa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 격자
    ctx.strokeStyle = dark ? '#2a2a2a' : '#e4e4e7';
    ctx.lineWidth = 0.5;
    for (let r = 0; r <= BOARD_H; r++) {
      ctx.beginPath(); ctx.moveTo(0, r * cs); ctx.lineTo(canvas.width, r * cs); ctx.stroke();
    }
    for (let c = 0; c <= BOARD_W; c++) {
      ctx.beginPath(); ctx.moveTo(c * cs, 0); ctx.lineTo(c * cs, canvas.height); ctx.stroke();
    }

    // 고정된 블록
    boardRef.current.forEach((row, r) => {
      row.forEach((color, c) => {
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(c * cs + 1, r * cs + 1, cs - 2, cs - 2);
          ctx.strokeStyle = dark ? '#3a3a3a' : '#d4d4d8';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(c * cs + 1, r * cs + 1, cs - 2, cs - 2);
        }
      });
    });

    // 고스트 피스 (착지 위치)
    const piece = pieceRef.current;
    if (piece) {
      let ghostY = piece.y;
      while (fits(boardRef.current, piece.shape, piece.x, ghostY + 1)) ghostY++;
      if (ghostY !== piece.y) {
        piece.shape.forEach((row, r) => {
          row.forEach((v, c) => {
            if (v) {
              ctx.fillStyle = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
              ctx.fillRect((piece.x + c) * cs + 1, (ghostY + r) * cs + 1, cs - 2, cs - 2);
            }
          });
        });
      }

      // 현재 피스
      piece.shape.forEach((row, r) => {
        row.forEach((v, c) => {
          if (v && piece.y + r >= 0) {
            ctx.fillStyle = piece.color;
            ctx.fillRect((piece.x + c) * cs + 1, (piece.y + r) * cs + 1, cs - 2, cs - 2);
          }
        });
      });
    }
  }, [cellSize]);

  const stopLoop = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const spawnPiece = useCallback(() => {
    const dark = isDark();
    if (nextPieceRef.current) {
      pieceRef.current = { ...nextPieceRef.current };
    } else {
      pieceRef.current = randomPiece(dark);
    }
    nextPieceRef.current = randomPiece(dark);

    if (!fits(boardRef.current, pieceRef.current.shape, pieceRef.current.x, pieceRef.current.y)) {
      stopLoop();
      statusRef.current = 'lost';
      setStatus('lost');
      saveBestScore(GAME_ID, scoreRef.current);
      setBestScore(getBestScore(GAME_ID));
      playFail();
    }
  }, [stopLoop, playFail]);

  const tick = useCallback(() => {
    const piece = pieceRef.current;
    if (!piece) return;

    if (fits(boardRef.current, piece.shape, piece.x, piece.y + 1)) {
      pieceRef.current = { ...piece, y: piece.y + 1 };
    } else {
      boardRef.current = lockPiece(boardRef.current, piece);
      const { board: nb, lines: cleared } = clearLines(boardRef.current);
      boardRef.current = nb;

      if (cleared > 0) {
        const gained = LINE_SCORES[cleared] * levelRef.current;
        scoreRef.current += gained;
        linesRef.current += cleared;
        setScore(scoreRef.current);
        setLines(linesRef.current);

        const newLevel = Math.floor(linesRef.current / 10) + 1;
        if (newLevel !== levelRef.current) {
          levelRef.current = newLevel;
          setLevel(newLevel);
          stopLoop();
          intervalRef.current = setInterval(tick, getSpeed(newLevel));
          playSuccess();
        } else {
          playBeep(600 + cleared * 50, 0.1);
        }
        saveBestScore(GAME_ID, scoreRef.current);
        setBestScore(getBestScore(GAME_ID));
      }
      spawnPiece();
    }
    draw();
  }, [draw, spawnPiece, stopLoop, playBeep, playSuccess]);

  const startLoop = useCallback(() => {
    stopLoop();
    intervalRef.current = setInterval(tick, getSpeed(levelRef.current));
  }, [stopLoop, tick]);

  const restart = useCallback(() => {
    stopLoop();
    boardRef.current = emptyBoard();
    scoreRef.current = 0;
    levelRef.current = 1;
    linesRef.current = 0;
    statusRef.current = 'playing';
    setScore(0);
    setLevel(1);
    setLines(0);
    setStatus('playing');
    setBestScore(getBestScore(GAME_ID));
    const dark = isDark();
    pieceRef.current = randomPiece(dark);
    nextPieceRef.current = randomPiece(dark);
    draw();
    startLoop();
  }, [stopLoop, draw, startLoop]);

  useEffect(() => {
    if (canvasW > 0) draw();
  }, [canvasW, draw]);

  const tryMove = useCallback((dx: number, dy: number) => {
    const piece = pieceRef.current;
    if (!piece || statusRef.current !== 'playing') return false;
    if (fits(boardRef.current, piece.shape, piece.x + dx, piece.y + dy)) {
      pieceRef.current = { ...piece, x: piece.x + dx, y: piece.y + dy };
      draw();
      return true;
    }
    return false;
  }, [draw]);

  const tryRotate = useCallback(() => {
    const piece = pieceRef.current;
    if (!piece || statusRef.current !== 'playing') return;
    const rotated = rotate(piece.shape);
    // Wall kick: 현재 위치, 좌 1, 우 1, 좌 2, 우 2 시도
    for (const dx of [0, -1, 1, -2, 2]) {
      if (fits(boardRef.current, rotated, piece.x + dx, piece.y)) {
        pieceRef.current = { ...piece, shape: rotated, x: piece.x + dx };
        draw();
        playBeep(500, 0.05);
        return;
      }
    }
  }, [draw, playBeep]);

  const hardDrop = useCallback(() => {
    const piece = pieceRef.current;
    if (!piece || statusRef.current !== 'playing') return;
    let newY = piece.y;
    while (fits(boardRef.current, piece.shape, piece.x, newY + 1)) newY++;
    pieceRef.current = { ...piece, y: newY };
    playBeep(300, 0.08);
    tick();
  }, [tick, playBeep]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (statusRef.current !== 'playing') return;
      switch (e.key) {
        case 'ArrowLeft':  e.preventDefault(); tryMove(-1, 0); break;
        case 'ArrowRight': e.preventDefault(); tryMove(1, 0); break;
        case 'ArrowDown':  e.preventDefault(); tryMove(0, 1); break;
        case 'ArrowUp':    e.preventDefault(); tryRotate(); break;
        case ' ':          e.preventDefault(); hardDrop(); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [tryMove, tryRotate, hardDrop]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const dt = Date.now() - touchStart.current.time;
    const min = 25;

    if (Math.abs(dx) < min && Math.abs(dy) < min && dt < 200) {
      // 탭: 회전. 더블 탭: 하드 드롭
      const now = Date.now();
      if (now - lastTap.current < 300) { hardDrop(); lastTap.current = 0; }
      else { tryRotate(); lastTap.current = now; }
    } else if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > min) {
      tryMove(dx > 0 ? 1 : -1, 0);
    } else if (dy > min) {
      tryMove(0, 1);
    }
  };

  useEffect(() => () => stopLoop(), [stopLoop]);

  return (
    <GameLayout
      title="블록 드롭"
      score={score}
      bestScore={bestScore}
      onRestart={restart}
      status={status === 'lost' ? 'lost' : undefined}
      desktopOnly
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-4 text-sm text-zinc-500 dark:text-zinc-400">
          <span>레벨 {level}</span>
          <span>줄 {lines}</span>
        </div>

        {status === 'idle' && (
          <button onClick={restart} className="btn-primary px-8 py-3">
            게임 시작
          </button>
        )}

        {canvasW > 0 && (
          <canvas
            ref={canvasRef}
            width={canvasW}
            height={canvasH}
            className="rounded-xl border border-zinc-200 dark:border-zinc-700 touch-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />
        )}

        <div className="text-xs text-zinc-400 dark:text-zinc-600 text-center space-y-1">
          <p>← → 이동 · ↑ 회전 · ↓ 소프트드롭 · Space 하드드롭</p>
          <p>모바일: 스와이프 이동 · 탭 회전 · 더블탭 하드드롭</p>
        </div>
      </div>
    </GameLayout>
  );
}
