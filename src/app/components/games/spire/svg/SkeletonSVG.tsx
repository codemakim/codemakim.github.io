interface Props { width?: number; height?: number; className?: string; }

export default function SkeletonSVG({ width = 80, height = 110, className }: Props) {
  return (
    <img src="/images/games/spire/skeleton.png" alt="해골 전사"
      width={width} height={height} className={className}
      style={{ objectFit: 'contain' }} draggable={false} />
  );
}
