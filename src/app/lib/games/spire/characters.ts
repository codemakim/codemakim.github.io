/**
 * @file characters.ts
 * @description 플레이어 캐릭터 명세 및 목록
 *
 * 새 캐릭터 추가 방법:
 *   1. CharacterDef 객체 정의
 *   2. ALL_CHARACTERS 배열에 추가
 *   → CharSelectScene에 자동 표시, 보상 풀에 전용 카드/유물 자동 반영
 */

import type { CharacterDef } from './types';
import { SLASH, GUARD, ASSAULT } from './cards';
import { BURNING_BLOOD } from './relics';

// ===== 전사 =====

const WARRIOR: CharacterDef = {
  id: 'warrior',
  name: '전사',
  emoji: '⚔️',
  description: '강인한 체력과 화력을 갖춘 정통 전사. 시작 유물 "불타는 피"로 매 전투 시작 시 체력을 회복한다.',
  startingHp: 80,
  startingEnergy: 3,
  startingDeck: [
    SLASH, SLASH, SLASH, SLASH,
    GUARD, GUARD, GUARD,
    ASSAULT,
  ],
  startingRelic: BURNING_BLOOD,
  characterCards: [],   // 추후 추가
  characterRelics: [],  // 추후 추가
  passive: undefined,   // 유물로 표현 가능한 효과는 유물로 처리. passive는 유물로 불가한 고유 훅에만 사용
};

// ===== 캐릭터 목록 (CharSelectScene의 유일한 소스) =====

export const ALL_CHARACTERS: CharacterDef[] = [
  WARRIOR,
];
