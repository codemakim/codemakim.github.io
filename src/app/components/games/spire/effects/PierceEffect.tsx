'use client';

import { motion } from 'motion/react';
import { useMemo } from 'react';
import type { VfxDir } from '@/app/lib/games/spire/types';

interface Props {
  size?: number;
  dir?: VfxDir;
}

export default function PierceEffect({ size = 110, dir = 'right' }: Props) {
  const { flipX, posOffsetX, offsetY } = useMemo(() => {
    const flipX = dir === 'left' ? -1 : 1;
    // slash와 동일하게 날카로운 끝이 타겟에 걸치도록 위치 조정
    const posOffsetX = -flipX * size * 0.4 + (Math.random() - 0.5) * size * 0.1;
    return {
      flipX,
      posOffsetX,
      offsetY: (Math.random() - 0.5) * size * 0.15,
    };
  }, [size, dir]);

  const imgW = size * 2.0;
  const imgH = imgW / 2.6; // lunge-thrust.png 비율 2.6:1

  return (
    <motion.div
      className="absolute pointer-events-none z-40"
      style={{
        top: '50%',
        left: '50%',
        width: imgW,
        height: imgH,
        marginTop: -imgH / 2 + offsetY,
        marginLeft: -imgW / 2 + posOffsetX,
        scaleX: flipX,
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: [0, 1, 0.9, 0],
        scale: [0.5, 1.1, 1.0, 0.9],
      }}
      transition={{ duration: 0.38, times: [0, 0.1, 0.5, 1], ease: 'easeOut' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/effects/slash/lunge-thrust.png"
        alt=""
        width={imgW}
        height={imgH}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'fill',
          filter: 'brightness(1.5) drop-shadow(0 0 8px rgba(255,60,60,0.95))',
        }}
      />
    </motion.div>
  );
}
