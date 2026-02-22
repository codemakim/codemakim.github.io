import type { GameState, GameAction } from '@/app/lib/games/spire/types';
import EnemyComponent from './EnemyComponent';
import PlayerComponent from './PlayerComponent';
import HandArea from './HandArea';
import RelicBar from './RelicBar';

interface Props {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

export default function BattleScene({ state, dispatch }: Props) {
  const { player, battle, relics, currentAct } = state;
  if (!battle) return null;

  const { enemies, selectedCardIndex } = battle!;

  function handleEnemyClick(idx: number) {
    if (selectedCardIndex !== null && battle!.targetingMode) {
      dispatch({ type: 'PLAY_CARD', cardIndex: selectedCardIndex, targetIndex: idx });
    }
  }

  const actLabel = `Act ${currentAct + 1}`;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* 상단 정보 바 */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/80 border-b border-zinc-700/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-400">❤️</span>
            <span className="text-sm font-bold text-white">{player.hp}<span className="text-zinc-400 font-normal">/{player.maxHp}</span></span>
          </div>
          {player.block > 0 && (
            <div className="text-xs font-bold text-blue-300">🛡️{player.block}</div>
          )}
        </div>
        <div className="text-xs text-zinc-500 font-medium">{actLabel}</div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">⚡</span>
          <span className="text-sm font-bold text-yellow-300">{player.energy}<span className="text-zinc-400 font-normal">/{player.maxEnergy}</span></span>
        </div>
      </div>

      {/* 전투 필드 */}
      <div className="flex-1 flex items-center justify-around px-4 py-4 bg-gradient-to-b from-zinc-800/40 to-zinc-900/40 overflow-hidden">
        {/* 적 영역 */}
        <div className="flex gap-6 items-end justify-center">
          {enemies.map((enemy, idx) => (
            <EnemyComponent
              key={`${enemy.def.id}-${idx}`}
              enemy={enemy}
              selected={battle.targetingMode}
              onClick={() => handleEnemyClick(idx)}
              spriteSize={enemy.def.tier === 'boss' ? 110 : 90}
            />
          ))}
        </div>

        {/* 플레이어 */}
        <PlayerComponent player={player} spriteSize={80} />
      </div>

      {/* 유물 바 */}
      {relics.length > 0 && (
        <div className="px-3 py-1.5 border-t border-zinc-700/50 bg-zinc-900/60">
          <RelicBar relics={relics} />
        </div>
      )}

      {/* 손패 영역 */}
      <div className="border-t border-zinc-700/50 bg-zinc-900/80">
        <HandArea
          battle={battle}
          player={player}
          dispatch={dispatch}
          onEndTurn={() => dispatch({ type: 'END_TURN' })}
        />
      </div>
    </div>
  );
}
