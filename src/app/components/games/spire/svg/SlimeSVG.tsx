interface Props { width?: number; height?: number; className?: string; }

export default function SlimeSVG({ width = 80, height = 80, className }: Props) {
  return (
    <img src="/images/games/spire/slime.webp" alt="슬라임"
      width={width} height={height} className={className}
      style={{ objectFit: 'contain' }} draggable={false} />
  );
}
