interface Props { width?: number; height?: number; className?: string; }

export default function GoblinSVG({ width = 80, height = 100, className }: Props) {
  return (
    <img src="/images/games/spire/goblin.webp" alt="고블린"
      width={width} height={height} className={className}
      style={{ objectFit: 'contain' }} draggable={false} />
  );
}
