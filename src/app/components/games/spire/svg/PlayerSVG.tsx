interface Props { width?: number; height?: number; className?: string; }

export default function PlayerSVG({ width = 80, height = 110, className }: Props) {
  return (
    <img
      src="/images/games/spire/player.png"
      alt="전사"
      width={width}
      height={height}
      className={className}
      style={{ objectFit: 'contain' }}
      draggable={false}
    />
  );
}
