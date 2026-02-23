'use client';

import { motion } from 'motion/react';
import type { CardInstance } from '@/app/lib/games/spire/types';
import CardComponent from './CardComponent';

interface Props {
  title: string;
  cards: CardInstance[];
  onClose: () => void;
}

export default function CardListOverlay({ title, cards, onClose }: Props) {
  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col bg-zinc-900/97"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700/60 bg-zinc-900/80 shrink-0">
        <h3 className="font-bold text-zinc-100 text-sm">{title}</h3>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
          aria-label="닫기"
        >
          ✕
        </button>
      </div>

      {/* 카드 목록 */}
      <div className="flex-1 overflow-y-auto p-3 pb-6">
        {cards.length === 0 ? (
          <div className="text-center text-zinc-500 py-10 text-sm">카드 없음</div>
        ) : (
          <div className="flex flex-wrap gap-2 justify-center">
            {cards.map((card) => (
              <CardComponent
                key={card.instanceId}
                card={card.def}
                size="sm"
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
