import type { RelicDef } from '@/app/lib/games/spire/types';

interface Props {
  relics: RelicDef[];
}

export default function RelicBar({ relics }: Props) {
  if (relics.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {relics.map(relic => (
        <span
          key={relic.id}
          title={`${relic.name}: ${relic.description}`}
          className="text-lg cursor-help"
        >
          {relic.emoji}
        </span>
      ))}
    </div>
  );
}
