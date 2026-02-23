import type { RelicDef } from '@/app/lib/games/spire/types';
import Tooltip from './Tooltip';

interface Props {
  relics: RelicDef[];
}

export default function RelicBar({ relics }: Props) {
  if (relics.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {relics.map(relic => (
        <Tooltip
          key={relic.id}
          content={
            <span className="block text-left">
              <span className="block text-xs font-bold text-yellow-300">{relic.emoji} {relic.name}</span>
              <span className="block text-xs text-zinc-300 mt-0.5">{relic.description}</span>
            </span>
          }
        >
          <span className="text-lg cursor-pointer select-none">{relic.emoji}</span>
        </Tooltip>
      ))}
    </div>
  );
}
