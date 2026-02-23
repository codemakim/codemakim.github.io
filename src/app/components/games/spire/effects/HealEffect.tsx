'use client';

import { motion } from 'motion/react';
import { useMemo } from 'react';

interface Props {
  size?: number;
}

export default function HealEffect({ size = 100 }: Props) {
  const particles = useMemo(() =>
    Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      x: size * 0.2 + Math.random() * size * 0.6,
      delay: i * 0.1,
      duration: 0.65 + Math.random() * 0.3,
      scale: 0.85 + Math.random() * 0.5,
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
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute font-black select-none"
          style={{
            left: p.x,
            bottom: size * 0.1,
            color: '#4ade80',
            fontSize: `${1.1 * p.scale}rem`,
            textShadow: '0 0 8px rgba(74,222,128,0.95), 0 2px 0 #000',
            lineHeight: 1,
          }}
          initial={{ y: 0, opacity: 1, scale: p.scale }}
          animate={{ y: -(size * 0.75), opacity: 0, scale: p.scale * 0.7 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
        >
          +
        </motion.div>
      ))}
    </div>
  );
}
