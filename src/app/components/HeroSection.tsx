interface HeroSectionProps {
  title: string;
  description: string;
}

export default function HeroSection({ title, description }: HeroSectionProps) {
  return (
    <header className="header">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight" style={{ color: "var(--text-primary)" }}>
          {title}
        </h1>
        <p className="text-lg md:text-xl" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
      </div>
    </header>
  );
}
