/**
 * @file battleLogic.ts
 * @description 하위 호환 re-export 모듈
 *
 * 실제 구현은 다음 파일에 분리되어 있습니다:
 *   battleInit.ts  — makeEnemy, initBattle
 *   cardLogic.ts   — applyCard
 *   enemyLogic.ts  — executeEnemyAction, processEnemyTurn
 *
 * 기존 import 경로('battleLogic')를 변경하지 않아도 되도록 re-export를 유지합니다.
 */

export { makeEnemy, initBattle } from './battleInit';
export { applyCard } from './cardLogic';
export { executeEnemyAction, processEnemyTurn } from './enemyLogic';
