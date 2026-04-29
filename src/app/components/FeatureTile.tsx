import Link from "next/link";

export interface FeatureTileProps {
  href: string;
  title: string;
  description?: string;
  actionText: string;
  colSpan?: string;
  className?: string;
}

export default function FeatureTile({
  href,
  title,
  description,
  actionText,
  colSpan = "",
  className = "",
}: FeatureTileProps) {
  return (
    <Link
      href={href}
      className={`card ${colSpan} ${className}`}
      style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "180px", padding: "1.5rem" }}
    >
      <div>
        <h2 className="text-2xl font-black mb-2" style={{ color: "var(--text-primary)" }}>
          {title}
        </h2>
        {description && (
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {description}
          </p>
        )}
      </div>
      <div className="text-sm font-bold" style={{ color: "var(--accent)" }}>
        {actionText} →
      </div>
    </Link>
  );
}
