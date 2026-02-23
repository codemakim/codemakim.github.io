'use client';

import { motion } from 'motion/react';

interface Props {
  size?: number;
  color?: string;
  rayCount?: number;
}

export default function ImpactEffect({ size = 110, color = 'rgba(255,200,50,0.95)', rayCount = 8 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const innerR = size * 0.12;
  const outerR = size * 0.44;

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
        initial={{ opacity: 1, scale: 0.3 }}
        animate={{ opacity: [1, 1, 0], scale: [0.3, 1.25, 1.0] }}
        transition={{ duration: 0.38, ease: [0.22, 0.61, 0.36, 1] }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      >
        {/* 중앙 원 */}
        <motion.circle
          cx={cx} cy={cy} r={innerR}
          fill={color}
          initial={{ r: 0 }}
          animate={{ r: [0, innerR * 1.8, 0] }}
          transition={{ duration: 0.35 }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />

        {/* 방사형 선 */}
        {Array.from({ length: rayCount }).map((_, i) => {
          const angle = (i / rayCount) * Math.PI * 2;
          const startR = innerR * 1.4;
          const x1 = cx + Math.cos(angle) * startR;
          const y1 = cy + Math.sin(angle) * startR;
          const x2 = cx + Math.cos(angle) * outerR;
          const y2 = cy + Math.sin(angle) * outerR;

          return (
            <motion.line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={color}
              strokeWidth={i % 2 === 0 ? 2.5 : 1.5}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 1 }}
              animate={{ pathLength: 1, opacity: 0 }}
              transition={{ duration: 0.3, delay: i * 0.006, ease: 'easeOut' }}
              style={{ filter: `drop-shadow(0 0 3px ${color})` }}
            />
          );
        })}
      </motion.svg>
    </div>
  );
}
