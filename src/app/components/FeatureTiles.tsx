import { ReactNode } from "react";

interface FeatureTilesProps {
  children: ReactNode;
  gridCols?: string; // Tailwind grid-cols 클래스 (기본: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3")
  gap?: string; // Tailwind gap 클래스 (기본: "gap-4")
  className?: string; // 추가 클래스
}

export default function FeatureTiles({
  children,
  gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  gap = "gap-4",
  className = "",
}: FeatureTilesProps) {
  return (
    <div className={`grid ${gridCols} ${gap} items-stretch ${className}`}>
      {children}
    </div>
  );
}
