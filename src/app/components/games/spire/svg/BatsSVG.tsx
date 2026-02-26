interface Props { width?: number; height?: number; className?: string; }

export default function BatsSVG({ width = 80, height = 80, className }: Props) {
  return (
    <img src="/images/games/spire/bats.png" alt="박쥐 떼"
      width={width} height={height} className={className}
      style={{ objectFit: 'contain' }} draggable={false} />
  );
}
