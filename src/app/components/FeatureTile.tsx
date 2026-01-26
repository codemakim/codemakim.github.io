import Link from "next/link";

export interface FeatureTileProps {
  href: string;
  title: string;
  description?: string;
  actionText: string;
  colSpan?: string; // Tailwind col-span 클래스 (예: "md:col-span-2")
  minHeight?: string; // Tailwind min-height 클래스 (예: "min-h-[200px]")
  padding?: string; // Tailwind padding 클래스 (예: "p-8")
  titleSize?: string; // Tailwind text-size 클래스 (예: "text-3xl")
  className?: string; // 추가 클래스
}

export default function FeatureTile({
  href,
  title,
  description,
  actionText,
  colSpan = "",
  minHeight = "min-h-[200px]",
  padding = "p-6",
  titleSize = "text-2xl",
  className = "",
}: FeatureTileProps) {
  return (
    <Link
      href={href}
      className={`card ${colSpan} h-full ${minHeight} hover:shadow-elevation-3 transition-all ${className}`}
    >
      <div className={`${padding} h-full flex flex-col justify-between`}>
        <div>
          <h2 className={`${titleSize} font-bold mb-2 text-zinc-900 dark:text-white`}>
            {title}
          </h2>
          {description && (
            <p className="text-zinc-600 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>
        <div className="text-sm text-zinc-500 dark:text-zinc-500">
          {actionText} →
        </div>
      </div>
    </Link>
  );
}

