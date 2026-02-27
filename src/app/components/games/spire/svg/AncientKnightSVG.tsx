interface Props { width?: number; height?: number; className?: string; }

export default function AncientKnightSVG({ width = 90, height = 120, className }: Props) {
  return (
    <img src="/images/games/spire/ancient_knight.webp" alt="고대 기사"
      width={width} height={height} className={className}
      style={{ objectFit: 'contain' }} draggable={false} />
  );
}
