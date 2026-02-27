interface Props { width?: number; height?: number; className?: string; }

export default function ShadowThiefSVG({ width = 80, height = 110, className }: Props) {
  return (
    <img src="/images/games/spire/shadow_thief.webp" alt="그림자 도적"
      width={width} height={height} className={className}
      style={{ objectFit: 'contain' }} draggable={false} />
  );
}
