'use client';

import { motion } from 'motion/react';

interface Props {
  size?: number;
}

export default function PierceEffect({ size = 110 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const len = size * 0.78;

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
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.45, delay: 0.25, ease: 'easeOut' }}
      >
        <motion.path
          d={`M${cx - len / 2},${cy} L${cx + len / 2},${cy}`}
          stroke="rgba(255,80,80,0.95)"
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          style={{ filter: 'drop-shadow(0 0 7px rgba(255,50,50,0.95))' }}
        />
        <motion.path
          d={`M${cx - len / 2},${cy - 5} L${cx + len / 2},${cy - 5}`}
          stroke="rgba(255,150,150,0.5)"
          strokeWidth={1.5}
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0.5 }}
          animate={{ pathLength: 1, opacity: 0 }}
          transition={{ duration: 0.22, delay: 0.04, ease: 'easeOut' }}
        />
      </motion.svg>
    </div>
  );
}
