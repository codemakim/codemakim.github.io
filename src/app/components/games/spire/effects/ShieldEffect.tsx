'use client';

import { motion } from 'motion/react';

interface Props {
  size?: number;
}

export default function ShieldEffect({ size = 110 }: Props) {
  const cx = size / 2;
  const top = size * 0.1;
  const left = size * 0.15;
  const right = size * 0.85;
  const mid = size * 0.6;
  const bottom = size * 0.88;

  const shieldPath = `M${cx},${top} L${right},${size * 0.28} L${right},${mid} Q${right},${bottom} ${cx},${bottom} Q${left},${bottom} ${left},${mid} L${left},${size * 0.28} Z`;

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
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1.15, 1.0, 0.9] }}
        transition={{ duration: 0.55, times: [0, 0.2, 0.7, 1] }}
        style={{ transformOrigin: `${cx}px ${cx}px` }}
      >
        <motion.path
          d={shieldPath}
          fill="rgba(59,130,246,0.2)"
          stroke="rgba(96,165,250,0.95)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 10px rgba(96,165,250,0.8))' }}
        />
        <line x1={cx} y1={size * 0.2} x2={cx} y2={size * 0.78}
          stroke="rgba(147,197,253,0.6)" strokeWidth={1.5} />
        <line x1={size * 0.28} y1={size * 0.45} x2={size * 0.72} y2={size * 0.45}
          stroke="rgba(147,197,253,0.6)" strokeWidth={1.5} />
        <motion.circle
          cx={cx} cy={size * 0.3} r={size * 0.055}
          fill="rgba(255,255,255,0.85)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ filter: 'drop-shadow(0 0 5px white)' }}
        />
      </motion.svg>
    </div>
  );
}
