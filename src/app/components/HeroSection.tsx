interface HeroSectionProps {
  title: string;
  description: string;
}

export default function HeroSection({ title, description }: HeroSectionProps) {
  return (
    <header className="header">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
          {title}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
    </header>
  );
}

