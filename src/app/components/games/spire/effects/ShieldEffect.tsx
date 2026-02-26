'use client';

import { motion } from 'motion/react';

interface Props {
  size?: number;
  dir?: unknown; // VfxProps 호환용 (사용 안 함)
}

export default function ShieldEffect({ size = 110 }: Props) {
  const imgSize = size * 1.15; // circular.png는 1:1 비율

  return (
    <motion.div
      className="absolute pointer-events-none z-40"
      style={{
        top: '50%',
        left: '50%',
        width: imgSize,
        height: imgSize,
        marginTop: -imgSize / 2,
        marginLeft: -imgSize / 2,
      }}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0.4, 1.2, 1.05, 0.9],
      }}
      transition={{ duration: 0.55, times: [0, 0.18, 0.65, 1], ease: 'easeOut' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/effects/slash/circular.png"
        alt=""
        width={imgSize}
        height={imgSize}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'fill',
          filter: 'brightness(1.4) drop-shadow(0 0 12px rgba(96,165,250,0.95))',
        }}
      />
    </motion.div>
  );
}
