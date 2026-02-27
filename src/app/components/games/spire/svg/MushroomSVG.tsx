interface Props { width?: number; height?: number; className?: string; }

export default function MushroomSVG({ width = 80, height = 100, className }: Props) {
  return (
    <img src="/images/games/spire/mushroom.webp" alt="독버섯"
      width={width} height={height} className={className}
      style={{ objectFit: 'contain' }} draggable={false} />
  );
}
