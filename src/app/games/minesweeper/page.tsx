'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import GameLayout from '@/app/components/games/GameLayout';
import { getBestScore, saveBestScore } from '@/app/lib/games/constants';
import { useGameAudio } from '@/app/components/games/useGameAudio';

const GAME_ID = 'minesweeper';

type Difficulty = 'easy' | 'medium' | 'hard';

const CONFIGS: Record<Difficulty, { rows: number; cols: number; mines: number; label: string }> = {
  easy:   { rows: 9,  cols: 9,  mines: 10, label: '초급 (9×9, 10지뢰)' },
  medium: { rows: 16, cols: 16, mines: 40, label: '중급 (16×16, 40지뢰)' },
  hard:   { rows: 16, cols: 30, mines: 99, label: '고급 (16×30, 99지뢰)' },
};

const NUMBER_COLORS: Record<number, string> = {
  1: 'text-blue-600',
  2: 'text-green-600',
  3: 'text-red-600',
  4: 'text-purple-700',
  5: 'text-amber-700',
  6: 'text-teal-600',
  7: 'text-zinc-900',
  8: 'text-zinc-500',
};

interface Cell {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  count: number;
}

function createBoard(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ mine: false, revealed: false, flagged: false, count: 0 }))
  );
}

function placeMines(board: Cell[][], mines: number, safeR: number, safeC: number): Cell[][] {
  const rows = board.length, cols = board[0].length;
  const safe = new Set<string>();
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    const nr = safeR + dr, nc = safeC + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) safe.add(`${nr},${nc}`);
  }

  const positions: string[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (!safe.has(`${r},${c}`)) positions.push(`${r},${c}`);
  }

  const minePositions = positions.sort(() => Math.random() - 0.5).slice(0, mines);
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  minePositions.forEach(pos => {
    const [r, c] = pos.split(',').map(Number);
    newBoard[r][c].mine = true;
  });

  // 숫자 계산
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (newBoard[r][c].mine) continue;
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newBoard[nr][nc].mine) count++;
    }
    newBoard[r][c].count = count;
  }
  return newBoard;
}

export default function MinesweeperGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [board, setBoard] = useState<Cell[][]>([]);
  const [status, setStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [firstClick, setFirstClick] = useState(true);
  const [flagCount, setFlagCount] = useState(0);
  const [time, setTime] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { playBeep, playSuccess, playFail } = useGameAudio();

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const initGame = useCallback((diff: Difficulty) => {
    const { rows, cols } = CONFIGS[diff];
    setBoard(createBoard(rows, cols));
    setStatus('idle');
    setFirstClick(true);
    setFlagCount(0);
    setTime(0);
    stopTimer();
  }, [stopTimer]);

  useEffect(() => {
    setBestScore(getBestScore(GAME_ID));
    initGame('easy');
  }, [initGame]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const restart = useCallback(() => {
    initGame(difficulty);
    setBestScore(getBestScore(GAME_ID));
  }, [difficulty, initGame]);

  const handleDifficultyChange = (diff: Difficulty) => {
    setDifficulty(diff);
    initGame(diff);
  };

  const revealCells = useCallback((b: Cell[][], r: number, c: number): Cell[][] => {
    const rows = b.length, cols = b[0].length;
    if (r < 0 || r >= rows || c < 0 || c >= cols) return b;
    if (b[r][c].revealed || b[r][c].flagged) return b;

    const nb = b.map(row => row.map(cell => ({ ...cell })));
    const queue: [number, number][] = [[r, c]];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const [cr, cc] = queue.shift()!;
      const key = `${cr},${cc}`;
      if (visited.has(key)) continue;
      visited.add(key);
      if (cr < 0 || cr >= rows || cc < 0 || cc >= cols) continue;
      if (nb[cr][cc].revealed || nb[cr][cc].flagged) continue;
      nb[cr][cc].revealed = true;
      if (nb[cr][cc].count === 0 && !nb[cr][cc].mine) {
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          queue.push([cr + dr, cc + dc]);
        }
      }
    }
    return nb;
  }, []);

  const checkWin = (b: Cell[][]): boolean => {
    return b.every(row => row.every(cell => cell.mine ? !cell.revealed : cell.revealed));
  };

  const handleReveal = useCallback((r: number, c: number) => {
    if (status === 'won' || status === 'lost') return;

    setBoard(prev => {
      let b = prev.map(row => row.map(cell => ({ ...cell })));

      if (firstClick) {
        setFirstClick(false);
        b = placeMines(b, CONFIGS[difficulty].mines, r, c);
        setStatus('playing');
        timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
      }

      if (b[r][c].flagged || b[r][c].revealed) return b;

      if (b[r][c].mine) {
        // 모든 지뢰 공개
        const nb = b.map(row => row.map(cell => ({ ...cell, revealed: cell.mine ? true : cell.revealed })));
        setStatus('lost');
        stopTimer();
        playFail();
        return nb;
      }

      const nb = revealCells(b, r, c);
      playBeep(440, 0.05);

      if (checkWin(nb)) {
        setStatus('won');
        stopTimer();
        playSuccess();
        const score = Math.max(0, 10000 - time * 10);
        saveBestScore(GAME_ID, score);
        setBestScore(getBestScore(GAME_ID));
      }
      return nb;
    });
  }, [status, firstClick, difficulty, revealCells, stopTimer, playBeep, playSuccess, playFail, time]);

  const handleFlag = useCallback((e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (status === 'won' || status === 'lost') return;
    setBoard(prev => {
      const nb = prev.map(row => row.map(cell => ({ ...cell })));
      if (nb[r][c].revealed) return nb;
      nb[r][c].flagged = !nb[r][c].flagged;
      setFlagCount(fc => nb[r][c].flagged ? fc + 1 : fc - 1);
      return nb;
    });
  }, [status]);

  const startLongPress = (r: number, c: number) => {
    longPressRef.current = setTimeout(() => {
      setBoard(prev => {
        const nb = prev.map(row => row.map(cell => ({ ...cell })));
        if (nb[r][c].revealed) return nb;
        nb[r][c].flagged = !nb[r][c].flagged;
        setFlagCount(fc => nb[r][c].flagged ? fc + 1 : fc - 1);
        return nb;
      });
    }, 500);
  };

  const cancelLongPress = () => {
    if (longPressRef.current) { clearTimeout(longPressRef.current); longPressRef.current = null; }
  };

  const { mines } = CONFIGS[difficulty];
  const cellSize = difficulty === 'hard' ? 18 : difficulty === 'medium' ? 22 : 28;

  const controls = (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 flex-wrap">
        {(Object.entries(CONFIGS) as [Difficulty, typeof CONFIGS[Difficulty]][]).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => handleDifficultyChange(key)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              difficulty === key
                ? 'bg-zinc-800 text-white border-transparent'
                : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
            }`}
          >
            {cfg.label}
          </button>
        ))}
      </div>
      <div className="flex gap-4 text-sm text-zinc-600">
        <span>💣 {mines - flagCount}</span>
        <span>⏱ {time}초</span>
      </div>
    </div>
  );

  return (
    <GameLayout
      title="지뢰찾기"
      score={time > 0 ? Math.max(0, 10000 - time * 10) : 0}
      bestScore={bestScore}
      onRestart={restart}
      controls={controls}
      status={status === 'won' ? 'won' : status === 'lost' ? 'lost' : undefined}
      desktopOnly
    >
      <div className="overflow-x-auto pb-2">
        <div
          className="inline-grid mx-auto"
          style={{
            gridTemplateColumns: `repeat(${CONFIGS[difficulty].cols}, ${cellSize}px)`,
            gap: '2px',
          }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                style={{ width: cellSize, height: cellSize, fontSize: Math.max(8, cellSize - 10) }}
                className={`flex items-center justify-center font-bold rounded-sm border transition-colors select-none ${
                  cell.revealed
                    ? 'bg-zinc-50 border-zinc-200'
                    : 'bg-zinc-200 border-zinc-300 active:bg-zinc-300'
                } ${cell.mine && cell.revealed ? 'bg-red-100' : ''}`}
                onClick={() => handleReveal(r, c)}
                onContextMenu={(e) => handleFlag(e, r, c)}
                onTouchStart={() => startLongPress(r, c)}
                onTouchEnd={cancelLongPress}
                onTouchMove={cancelLongPress}
                aria-label={`칸 ${r},${c}`}
              >
                {cell.revealed && cell.mine && '💣'}
                {cell.revealed && !cell.mine && cell.count > 0 && (
                  <span className={NUMBER_COLORS[cell.count] || ''}>{cell.count}</span>
                )}
                {!cell.revealed && cell.flagged && '🚩'}
              </button>
            ))
          )}
        </div>
      </div>
      <p className="text-center text-xs text-zinc-400 mt-4">
        클릭=열기 · 우클릭(또는 롱프레스)=깃발
      </p>
    </GameLayout>
  );
}
