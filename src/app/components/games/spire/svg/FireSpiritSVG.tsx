interface Props { width?: number; height?: number; className?: string; }

export default function FireSpiritSVG({ width = 80, height = 110, className }: Props) {
  return (
    <img src="/images/games/spire/fire_spirit.webp" alt="화염 정령"
      width={width} height={height} className={className}
      style={{ objectFit: 'contain' }} draggable={false} />
  );
}
