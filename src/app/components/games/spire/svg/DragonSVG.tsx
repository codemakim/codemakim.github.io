interface Props { width?: number; height?: number; className?: string; }

export default function DragonSVG({ width = 110, height = 120, className }: Props) {
  return (
    <img src="/images/games/spire/dragon.png" alt="드래곤"
      width={width} height={height} className={className}
      style={{ objectFit: 'contain' }} draggable={false} />
  );
}
