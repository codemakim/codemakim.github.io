interface Props { width?: number; height?: number; className?: string; }

export default function DarkMageSVG({ width = 80, height = 110, className }: Props) {
  return (
    <img src="/images/games/spire/dark_mage.png" alt="어둠 마법사"
      width={width} height={height} className={className}
      style={{ objectFit: 'contain' }} draggable={false} />
  );
}
