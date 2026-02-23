'use client';

import { motion } from 'motion/react';
import { useMemo } from 'react';

interface Props {
  size?: number;
}

export default function SlashEffect({ size = 120 }: Props) {
  const lines = useMemo(() => {
    const baseAngle = -40 + (Math.random() * 30 - 15);
    return [
      { angle: baseAngle,      thick: 3,   opacity: 0.95, delay: 0 },
      { angle: baseAngle + 12, thick: 2,   opacity: 0.7,  delay: 0.04 },
      { angle: baseAngle + 22, thick: 1.5, opacity: 0.4,  delay: 0.07 },
    ];
  }, []);

  const cx = size / 2;
  const cy = size / 2;
  const len = size * 0.68;

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
        transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
      >
        {lines.map((line, i) => {
          const rad = (line.angle * Math.PI) / 180;
          const x1 = cx - Math.cos(rad) * len / 2;
          const y1 = cy - Math.sin(rad) * len / 2;
          const x2 = cx + Math.cos(rad) * len / 2;
          const y2 = cy + Math.sin(rad) * len / 2;

          return (
            <motion.path
              key={i}
              d={`M${x1},${y1} L${x2},${y2}`}
              stroke="white"
              strokeWidth={line.thick}
              strokeLinecap="round"
              fill="none"
              opacity={line.opacity}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.2, delay: line.delay, ease: 'easeOut' }}
              style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.95))' }}
            />
          );
        })}
      </motion.svg>
    </div>
  );
}
