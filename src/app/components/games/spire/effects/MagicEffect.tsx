'use client';

import { motion } from 'motion/react';

interface Props {
  size?: number;
}

export default function MagicEffect({ size = 120 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const particleCount = 6;

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
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 0.8, times: [0, 0.1, 0.7, 1] }}
      >
        {/* 마법진 원 */}
        <motion.circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="rgba(167,139,250,0.85)"
          strokeWidth={2}
          strokeDasharray="8 4"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.15, 1.0] }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            filter: 'drop-shadow(0 0 7px rgba(167,139,250,0.95))',
          }}
        />

        {/* 파티클 */}
        {Array.from({ length: particleCount }).map((_, i) => {
          const angle = (i / particleCount) * Math.PI * 2;
          const px = cx + Math.cos(angle) * r;
          const py = cy + Math.sin(angle) * r;
          const ex = cx + Math.cos(angle) * (r + 28);
          const ey = cy + Math.sin(angle) * (r + 28);

          return (
            <motion.circle
              key={i}
              r={3.5}
              fill="rgba(216,180,254,0.95)"
              initial={{ cx: px, cy: py, opacity: 1 }}
              animate={{ cx: ex, cy: ey, opacity: 0 }}
              transition={{ duration: 0.5, delay: i * 0.04, ease: 'easeOut' }}
              style={{ filter: 'drop-shadow(0 0 5px rgba(167,139,250,1))' }}
            />
          );
        })}

        {/* 중앙 발광 */}
        <motion.circle
          cx={cx} cy={cy} r={size * 0.1}
          fill="rgba(167,139,250,0.75)"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.6, 0] }}
          transition={{ duration: 0.4 }}
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            filter: 'drop-shadow(0 0 10px rgba(167,139,250,1))',
          }}
        />
      </motion.svg>
    </div>
  );
}
