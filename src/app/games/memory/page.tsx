'use client';

import { useCallback, useEffect, useState } from 'react';
import GameLayout from '@/app/components/games/GameLayout';
import { getBestScore, saveBestScore } from '@/app/lib/games/constants';
import { useGameAudio } from '@/app/components/games/useGameAudio';

const GAME_ID = 'memory';
const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'];

type Difficulty = 'easy' | 'normal' | 'hard';

const DIFFICULTY_CONFIG: Record<Difficulty, { cols: number; pairs: number; label: string }> = {
  easy:   { cols: 4, pairs: 6,  label: '쉬움 (6쌍)' },
  normal: { cols: 4, pairs: 8,  label: '보통 (8쌍)' },
  hard:   { cols: 5, pairs: 10, label: '어려움 (10쌍)' },
};

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function createCards(pairs: number): Card[] {
  const emojis = EMOJIS.slice(0, pairs);
  const doubled = [...emojis, ...emojis];
  const shuffled = doubled.sort(() => Math.random() - 0.5);
  return shuffled.map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
}

export default function MemoryGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost' | 'idle'>('idle');
  const [isChecking, setIsChecking] = useState(false);
  const { playBeep, playSuccess, playFail } = useGameAudio();

  const initGame = useCallback((diff: Difficulty) => {
    const { pairs } = DIFFICULTY_CONFIG[diff];
    setCards(createCards(pairs));
    setFlipped([]);
    setAttempts(0);
    setStatus('playing');
    setIsChecking(false);
  }, []);

  useEffect(() => {
    setBestScore(getBestScore(GAME_ID));
    initGame('normal');
  }, [initGame]);

  const restart = useCallback(() => {
    initGame(difficulty);
    setBestScore(getBestScore(GAME_ID));
  }, [difficulty, initGame]);

  const handleDifficultyChange = (diff: Difficulty) => {
    setDifficulty(diff);
    initGame(diff);
  };

  const handleCardClick = (idx: number) => {
    if (isChecking) return;
    if (cards[idx].flipped || cards[idx].matched) return;
    if (flipped.length >= 2) return;

    const newCards = cards.map((c, i) =>
      i === idx ? { ...c, flipped: true } : c
    );
    setCards(newCards);
    playBeep(600, 0.06);

    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setAttempts(a => a + 1);
      setIsChecking(true);
      const [a, b] = newFlipped;

      if (newCards[a].emoji === newCards[b].emoji) {
        // 매칭 성공
        setTimeout(() => {
          setCards(prev => prev.map((c, i) =>
            i === a || i === b ? { ...c, matched: true } : c
          ));
          setFlipped([]);
          setIsChecking(false);
          playBeep(784, 0.12);

          // 승리 체크
          const allMatched = newCards.every((c, i) =>
            i === a || i === b ? true : c.matched
          );
          if (allMatched) {
            setStatus('won');
            playSuccess();
            // 점수: 적은 시도 = 높은 점수 (최대 1000점에서 시도당 감점)
            const pairs = DIFFICULTY_CONFIG[difficulty].pairs;
            const maxAttempts = pairs * 3;
            const finalAttempts = attempts + 1;
            const score = Math.max(0, Math.round((maxAttempts - finalAttempts) / maxAttempts * 1000));
            saveBestScore(GAME_ID, score);
            setBestScore(getBestScore(GAME_ID));
          }
        }, 400);
      } else {
        // 매칭 실패
        setTimeout(() => {
          setCards(prev => prev.map((c, i) =>
            i === a || i === b ? { ...c, flipped: false } : c
          ));
          setFlipped([]);
          setIsChecking(false);
          playFail();
        }, 900);
      }
    }
  };

  const { cols } = DIFFICULTY_CONFIG[difficulty];

  const controls = (
    <div className="flex gap-2 flex-wrap">
      {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, typeof DIFFICULTY_CONFIG[Difficulty]][]).map(([key, cfg]) => (
        <button
          key={key}
          onClick={() => handleDifficultyChange(key)}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
            difficulty === key
              ? 'bg-zinc-800 dark:bg-white text-white dark:text-zinc-900 border-transparent'
              : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
          }`}
        >
          {cfg.label}
        </button>
      ))}
    </div>
  );

  return (
    <GameLayout
      title="메모리 카드"
      score={attempts}
      bestScore={bestScore}
      onRestart={restart}
      controls={controls}
      status={status === 'won' ? 'won' : undefined}
    >
      {/* 점수 레이블 오버라이드 표시 */}
      <p className="text-xs text-zinc-400 dark:text-zinc-600 mb-3 text-center">
        시도 횟수: {attempts}회
      </p>

      <div
        className="mx-auto"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap: '8px',
          maxWidth: cols === 5 ? '420px' : '360px',
        }}
      >
        {cards.map((card, idx) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(idx)}
            disabled={card.matched || status === 'won'}
            className="relative select-none focus:outline-none"
            style={{ perspective: '1000px', aspectRatio: '3/4' }}
            aria-label={card.flipped || card.matched ? card.emoji : '카드'}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.4s ease',
                transform: card.flipped || card.matched ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* 뒷면 */}
              <div
                style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0 }}
                className="rounded-xl bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center border border-zinc-300 dark:border-zinc-600"
              >
                <span className="text-zinc-400 dark:text-zinc-500 text-xl font-bold">?</span>
              </div>
              {/* 앞면 */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  position: 'absolute',
                  inset: 0,
                  transform: 'rotateY(180deg)',
                }}
                className={`rounded-xl flex items-center justify-center border ${
                  card.matched
                    ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700'
                    : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-600'
                }`}
              >
                <span style={{ fontSize: 'clamp(20px, 5vw, 36px)' }}>{card.emoji}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-zinc-400 dark:text-zinc-600 mt-4">
        카드를 탭하여 같은 쌍을 찾아라
      </p>
    </GameLayout>
  );
}
