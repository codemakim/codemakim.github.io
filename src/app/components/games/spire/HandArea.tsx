import type { BattleState, PlayerState } from '@/app/lib/games/spire/types';
import type { GameAction } from '@/app/lib/games/spire/types';
import CardComponent from './CardComponent';

interface Props {
  battle: BattleState;
  player: PlayerState;
  dispatch: (action: GameAction) => void;
  onEndTurn: () => void;
}

export default function HandArea({ battle, player, dispatch, onEndTurn }: Props) {
  const { hand, selectedCardIndex, drawPile, discardPile, activePowers } = battle;

  function handleCardClick(idx: number) {
    const card = hand[idx].def;
    const cost = card.cost === -1 ? player.energy : card.cost;

    if (card.type === 'curse' || player.energy < cost) return;

    if (selectedCardIndex === idx) {
      // 이미 선택된 카드 → 타겟 없이 플레이 (적이 1명이므로 targetIndex=0)
      dispatch({ type: 'PLAY_CARD', cardIndex: idx, targetIndex: 0 });
    } else {
      dispatch({ type: 'SELECT_CARD', cardIndex: idx });
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* 파워 카드 표시 */}
      {activePowers.length > 0 && (
        <div className="flex gap-2 justify-center flex-wrap px-2">
          {activePowers.map((pid, i) => (
            <span key={i} className="text-xs bg-purple-900/60 border border-purple-500/40 text-purple-200 px-2 py-0.5 rounded-full">
              🔮 {pid === 'iron_will' ? '강철 의지' : pid === 'berserker' ? '광전사' : pid === 'thorns_card' ? '가시 갑옷' : pid}
            </span>
          ))}
        </div>
      )}

      {/* 손패 */}
      <div className="flex items-end justify-center gap-1 min-h-[100px] px-2 py-2 overflow-x-auto">
        {hand.map((cardInst, idx) => {
          const card = cardInst.def;
          const cost = card.cost === -1 ? player.energy : card.cost;
          const canPlay = card.type !== 'curse' && player.energy >= cost;
          return (
            <CardComponent
              key={cardInst.instanceId}
              card={card}
              disabled={!canPlay}
              selected={selectedCardIndex === idx}
              onClick={() => handleCardClick(idx)}
              size="md"
            />
          );
        })}
        {hand.length === 0 && (
          <div className="text-zinc-500 text-sm">손패가 없다</div>
        )}
      </div>

      {/* 하단 정보 */}
      <div className="flex items-center justify-between px-3 pb-2">
        <div className="flex gap-3 text-xs text-zinc-400">
          <span>🃏 드로우 {drawPile.length}</span>
          <span>🗑️ 버림 {discardPile.length}</span>
        </div>
        <button
          onClick={onEndTurn}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-bold text-sm rounded-lg transition-colors"
        >
          턴 종료
        </button>
      </div>
    </div>
  );
}
