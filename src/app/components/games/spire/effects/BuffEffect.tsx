'use client';

import { motion } from 'motion/react';
import { useMemo } from 'react';

interface Props {
  size?: number;
}

export default function BuffEffect({ size = 100 }: Props) {
  const particles = useMemo(() =>
    ['✨', '⚡', '✨', '⚡'].map((symbol, i) => ({
      symbol,
      x: size * 0.15 + (i / 3) * size * 0.7,
      delay: i * 0.08,
    }))
  , [size]);

  return (
    <div
      className="absolute pointer-events-none z-40"
      style={{
        top: '50%',
        left: '50%',
        width: size,
        height: size,
        marginTop: -size / 2,
        marginLeft: -size / 2,
      }}
    >
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute text-xl select-none"
          style={{ left: p.x, bottom: size * 0.15 }}
          initial={{ y: 0, opacity: 1, scale: 0.6 }}
          animate={{ y: -(size * 0.65), opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.55, delay: p.delay, ease: 'easeOut' }}
        >
          {p.symbol}
        </motion.span>
      ))}
    </div>
  );
}
