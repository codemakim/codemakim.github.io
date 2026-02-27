interface Props { width?: number; height?: number; className?: string; }

export default function GolemSVG({ width = 100, height = 120, className }: Props) {
  return (
    <img src="/images/games/spire/golem.webp" alt="골렘"
      width={width} height={height} className={className}
      style={{ objectFit: 'contain' }} draggable={false} />
  );
}
