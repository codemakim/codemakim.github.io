'use client';

import { motion } from 'motion/react';
import { useMemo } from 'react';
import type { VfxDir } from '@/app/lib/games/spire/types';

interface Props {
  size?: number;
  dir?: VfxDir;
}

export default function SlashEffect({ size = 120, dir = 'right' }: Props) {
  const { rotation, flipX, posOffsetX, offsetY } = useMemo(() => {
    // 방향별 flipX 결정:
    //   right → ) 방향 (플레이어→몬스터): 이미지 정방향 (scaleX 1)
    //   left  → ( 방향 (몬스터→플레이어): 좌우 반전 (scaleX -1)
    //   random → 연타: 무작위
    const flipX = dir === 'right' ? 1 : dir === 'left' ? -1 : (Math.random() > 0.5 ? 1 : -1);

    // 각도: 단타는 좁은 범위, 연타는 넓은 범위
    const spread = dir === 'random' ? 40 : 20;
    const base = dir === 'left' ? 10 : -10;
    const rotation = base + (Math.random() * spread - spread / 2);

    // 위치 오프셋: 베는 방향 반대쪽으로 이미지를 옮겨 날카로운 끝이 타겟에 걸치도록
    // right(flipX=1): 이미지를 왼쪽으로 → 날카로운 오른쪽 끝이 타겟 위에 위치
    // left(flipX=-1): 이미지를 오른쪽으로 → 반전된 날카로운 왼쪽 끝이 타겟 위에 위치
    const posOffsetX = -flipX * size * 0.45 + (Math.random() - 0.5) * size * 0.15;

    return {
      rotation,
      flipX,
      posOffsetX,
      offsetY: (Math.random() - 0.5) * size * 0.15,
    };
  }, [size, dir]);

  const imgW = size * 1.6;
  const imgH = size * 0.65;

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
        rotate: rotation,
        scaleX: flipX,
      }}
      initial={{ opacity: 0, scale: 0.55 }}
      animate={{
        opacity: [0, 1, 0.85, 0],
        scale: [0.55, 1.05, 1.0, 0.9],
      }}
      transition={{ duration: 0.36, times: [0, 0.12, 0.5, 1], ease: 'easeOut' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/effects/slash/slash-desaturated.png"
        alt=""
        width={imgW}
        height={imgH}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'fill',
          filter: 'brightness(1.4) drop-shadow(0 0 8px rgba(255,255,255,0.85))',
        }}
      />
    </motion.div>
  );
}
