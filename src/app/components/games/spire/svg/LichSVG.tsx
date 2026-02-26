interface Props { width?: number; height?: number; className?: string; }

export default function LichSVG({ width = 90, height = 120, className }: Props) {
  return (
    <img src="/images/games/spire/lich.png" alt="리치"
      width={width} height={height} className={className}
      style={{ objectFit: 'contain' }} draggable={false} />
  );
}
