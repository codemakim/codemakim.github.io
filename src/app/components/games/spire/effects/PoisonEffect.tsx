'use client';

import { motion } from 'motion/react';

interface Props {
  size?: number;
}

export default function PoisonEffect({ size = 100 }: Props) {
  const cx = size / 2;
  const cy = size / 2;

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
        transition={{ duration: 0.4, delay: 0.55 }}
      >
        {[0, 1, 2, 3].map(i => {
          const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
          const r = size * 0.28;
          const px = cx + Math.cos(angle) * r;
          const py = cy + Math.sin(angle) * r;
          return (
            <motion.circle
              key={i}
              cx={px} cy={py} r={size * 0.07}
              fill="rgba(74,222,128,0.9)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              style={{
                transformOrigin: `${px}px ${py}px`,
                filter: 'drop-shadow(0 0 5px rgba(74,222,128,0.95))',
              }}
            />
          );
        })}
        <motion.circle
          cx={cx} cy={cy} r={size * 0.12}
          fill="rgba(74,222,128,0.75)"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.5, 0] }}
          transition={{ duration: 0.45 }}
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            filter: 'drop-shadow(0 0 7px rgba(74,222,128,1))',
          }}
        />
      </motion.svg>
    </div>
  );
}
