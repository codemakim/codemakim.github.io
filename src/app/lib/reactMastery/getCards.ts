import { allReactMasteryCards, type ReactMasteryCard } from "contentlayer/generated";
import { pickCardIndex, todayYYYYMMDD } from "./cardOfTheDay";

/**
 * id 순서로 정렬된 모든 카드.
 * 정렬을 고정해야 셔플의 결정성이 유지된다.
 */
export function getAllCards(): ReactMasteryCard[] {
  return [...allReactMasteryCards].sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * 오늘의 카드. 카드가 0개면 null.
 */
export function getTodayCard(now: Date = new Date()): ReactMasteryCard | null {
  const cards = getAllCards();
  const idx = pickCardIndex(cards.length, todayYYYYMMDD(now));
  if (idx < 0) return null;
  return cards[idx] ?? null;
}
