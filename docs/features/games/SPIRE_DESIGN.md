# 미니 스파이어 (Mini Spire) - 설계 문서

## 개요

슬레이 더 스파이어에서 영감을 받은 턴 기반 덱빌딩 로그라이크 카드 게임.
CSS/SVG/이모지로 모든 비주얼을 구현하며, 외부 에셋 없이 동작한다.

**핵심 게임 루프**: 맵 이동 → 전투 (카드 플레이) → 보상 (카드 획득) → 반복 → 보스 격파

## 에셋 전략: SVG vs 이모지

### 에셋 교체 원칙 (중요)

현재 SVG 캐릭터는 기하학적 도형 조합으로 만든 **플레이스홀더**다.
추후 제대로 된 일러스트/픽셀아트 에셋이 준비되면 쉽게 교체할 수 있는 구조로 개발한다.

**교체 가능 설계 규칙:**

- 모든 캐릭터 SVG는 독립 컴포넌트(`svg/` 폴더)로 분리한다
- 컴포넌트 인터페이스를 통일한다: `({ width, height, className }) => JSX.Element`
- 적 데이터(`enemies.ts`)에서 SVG 컴포넌트를 참조하므로, 컴포넌트만 교체하면 게임 로직 수정 없이 비주얼이 바뀐다
- 향후 PNG/WebP 이미지 에셋으로 교체 시 SVG 컴포넌트를 `<Image>` 컴포넌트로 대체하면 된다
- 카드 일러스트도 동일한 방식으로 교체 가능하도록 카드 데이터에 `illustration` 필드를 예약한다

```typescript
// 현재: SVG 플레이스홀더
import SlimeSVG from '../svg/SlimeSVG';
const slime: EnemyDef = { ..., svgComponent: SlimeSVG };

// 향후: 이미지 에셋으로 교체
import SlimeImage from '../assets/SlimeImage';
const slime: EnemyDef = { ..., svgComponent: SlimeImage };
```

### SVG로 직접 그리는 에셋 (플레이스홀더, 추후 교체 대상)

| 에셋               | 이유                      | 현재 스타일                            | 교체 시                             |
| ------------------ | ------------------------- | -------------------------------------- | ----------------------------------- |
| 카드 프레임        | 게임 느낌의 80%를 결정    | 둥근 모서리, 상단 색상 띠, 에너지 오브 | CSS는 유지, 카드 내 일러스트만 교체 |
| 플레이어 캐릭터    | 화면 중앙 고정, 항상 보임 | 기하학적 전사 실루엣                   | `PlayerSVG` 컴포넌트 교체           |
| 적 캐릭터          | 전투의 주 시각 대상       | 각 적마다 기하학적 실루엣              | 개별 SVG 컴포넌트 교체              |
| 맵 노드/경로       | 탐험감의 핵심             | 원형 노드 + 곡선 경로                  | 유지 (교체 불필요)                  |
| 유물 아이콘        | 수집 피드백               | 16x16 ~ 24x24 심볼                     | 이모지로 충분, 필요 시 교체         |
| 체력바/에너지 오브 | 핵심 UI                   | 그라데이션 바, 빛나는 오브             | CSS 유지 (교체 불필요)              |

### 이모지로 대체하는 에셋 (빠르고 충분한 요소)

| 에셋             | 이모지                                              | 용도                          |
| ---------------- | --------------------------------------------------- | ----------------------------- |
| 카드 타입 아이콘 | ⚔️ 🛡️ ✨ 💀                                         | 공격/방어/스킬/저주 카드 구분 |
| 버프/디버프      | 💪 🔥 ❄️ 🩸 💀 🛡️ 😵 ⚡                             | 상태 효과 아이콘              |
| 적 의도 표시     | ⚔️→공격 🛡️→방어 💪→버프 😵→디버프                   | 다음 행동 예고                |
| 맵 노드 타입     | ⚔️→전투 👹→엘리트 💀→보스 🏕️→휴식 ❓→이벤트 🎁→보물 | 맵 아이콘                     |
| 보상 화면        | 🃏 💰 🎁                                            | 카드/골드/유물                |
| UI 인디케이터    | ❤️ ⚡ 🃏                                            | 체력/에너지/덱                |

### SVG 캐릭터 설계 가이드

**플레이어 (전사)**: 삼각형 몸통 + 원형 머리 + 사각형 방패 + 선형 검. 색상: 파란 계열.
높이 약 120px, 심플한 기하학적 조합으로 "전사" 인상을 전달.

**적 캐릭터별 실루엣**:

| 적                 | 형태                | 핵심 도형                        |
| ------------------ | ------------------- | -------------------------------- |
| 슬라임             | 반원형 젤리         | 반타원 + 눈(원 2개)              |
| 고블린             | 삼각 귀 + 작은 체구 | 역삼각 얼굴 + 삼각 귀            |
| 해골 전사          | 원형 두개골 + 검    | 원 + 십자 형태 뼈                |
| 독버섯             | 반원 갓 + 기둥      | 반원 + 사각형 기둥               |
| 박쥐 떼            | 날개 펼친 형태      | 삼각형 날개 3쌍                  |
| 고대 기사 (엘리트) | 큰 갑옷 실루엣      | 큰 사각형 + 삼각 투구            |
| 화염 정령 (엘리트) | 불꽃 형태           | 물방울(역) + 흔들림 효과         |
| 보스: 골렘         | 거대 사각형         | 큰 사각형 + 작은 원 눈           |
| 보스: 리치         | 로브 입은 해골      | 삼각형 로브 + 원 두개골 + 지팡이 |
| 보스: 드래곤       | 날개 + 긴 목        | 삼각형 날개 + 곡선 목 + 원 머리  |

## 게임 시스템

### 1. 전체 구조

```
3개 층 (Act) 구성:
  Act 1: 일반 전투 3~4회 + 엘리트 1회 + 보스 1회
  Act 2: 일반 전투 3~4회 + 엘리트 1회 + 보스 1회
  Act 3: 일반 전투 3~4회 + 엘리트 1회 + 보스 1회

맵 노드 타입:
  ⚔️ 일반 전투 - 일반 적 조합
  👹 엘리트 전투 - 강한 적 + 유물 보상
  💀 보스 - 층의 마지막
  🏕️ 휴식 - HP 30% 회복
  🎁 보물 - 유물 획득
```

### 2. 전투 시스템

#### 턴 흐름

```
턴 시작
  → 카드 5장 드로우 (드로우 파일에서)
  → 에너지 3 충전
  → 적 의도 표시

플레이어 턴
  → 카드 선택 (에너지 소모)
  → 카드 효과 적용 (데미지, 방어, 버프 등)
  → 반복 (에너지 남아있으면)
  → 턴 종료 버튼

적 턴
  → 방어도 초기화 (플레이어)
  → 적 행동 실행 (의도대로)
  → 적 의도 갱신 (다음 턴 예고)

전투 종료 조건
  → 적 HP 0 이하: 승리 → 보상
  → 플레이어 HP 0 이하: 패배 → 게임 오버
```

#### 핵심 수치

| 항목            | 값                           |
| --------------- | ---------------------------- |
| 시작 HP         | 80                           |
| 최대 HP         | 80 (유물로 증가 가능)        |
| 턴당 에너지     | 3                            |
| 턴당 드로우     | 5장                          |
| 시작 덱 카드 수 | 10장 (강타5 + 수비4 + 일섬1) |
| 방어도          | 턴 시작 시 0으로 초기화      |

#### 상태 효과

| 상태              | 이모지 | 효과                      | 지속       |
| ----------------- | ------ | ------------------------- | ---------- |
| 취약 (Vulnerable) | 😵     | 받는 데미지 50% 증가      | N턴        |
| 약화 (Weak)       | 💧     | 주는 데미지 25% 감소      | N턴        |
| 힘 (Strength)     | 💪     | 공격 데미지 +N            | 영구       |
| 민첩 (Dexterity)  | 🦶     | 방어도 +N                 | 영구       |
| 독 (Poison)       | 🩸     | 턴마다 N 데미지, 1씩 감소 | 0될 때까지 |

### 3. 카드 시스템

#### 카드 타입

| 타입              | 색상           | 이모지 | 설명                |
| ----------------- | -------------- | ------ | ------------------- |
| 공격 (Attack)     | 빨강 `#ef4444` | ⚔️     | 적에게 데미지       |
| 방어 (Skill-방어) | 파랑 `#3b82f6` | 🛡️     | 방어도 획득         |
| 스킬 (Skill)      | 초록 `#22c55e` | ✨     | 버프, 드로우 등     |
| 힘 (Power)        | 보라 `#a855f7` | 🔮     | 영구 효과 (전투 중) |
| 저주 (Curse)      | 검정 `#374151` | 💀     | 부정적 효과         |

#### 카드 데이터 구조 (확장 가능 설계)

```typescript
interface CardDef {
  id: string;
  name: string;
  type: "attack" | "skill" | "power" | "curse";
  cost: number; // 에너지 비용 (-1 = X 비용)
  description: string; // 효과 설명 텍스트
  effects: CardEffect[]; // 카드 효과 배열
  upgraded?: boolean; // 업그레이드 여부
  upgradedVersion?: Partial<CardDef>; // 업그레이드 시 변경되는 필드
  illustration?: ComponentType<{ width?: number; height?: number }>; // 향후 카드 일러스트 교체용
}

type CardEffect =
  | { type: "damage"; value: number; target?: "single" | "all" }
  | { type: "block"; value: number }
  | { type: "draw"; value: number }
  | { type: "buff"; buff: BuffType; value: number; target: "self" | "enemy" }
  | { type: "heal"; value: number }
  | { type: "gainEnergy"; value: number };

type BuffType = "strength" | "dexterity" | "vulnerable" | "weak" | "poison";
```

**확장 포인트**: 새 카드 추가 시 `CardDef` 객체만 배열에 추가하면 된다. 효과 조합으로 다양한 카드 구현 가능.

#### 시작 덱 (10장)

| 카드          | 타입 | 비용 | 효과              | 수량 |
| ------------- | ---- | ---- | ----------------- | ---- |
| 강타 (Strike) | 공격 | 1    | 6 데미지          | 5장  |
| 수비 (Defend) | 방어 | 1    | 5 방어            | 4장  |
| 일섬 (Bash)   | 공격 | 2    | 8 데미지 + 취약 2 | 1장  |

#### 획득 가능 카드 풀 (20장)

**공격 카드 (7장)**:

| 카드                       | 비용 | 효과                                           |
| -------------------------- | ---- | ---------------------------------------------- |
| 칼날 폭풍 (Blade Storm)    | 1    | 적 전체에 4 데미지                             |
| 강력한 일격 (Heavy Strike) | 2    | 14 데미지                                      |
| 분노 (Anger)               | 0    | 6 데미지, 사용 후 버린 카드 더미에 복사본 추가 |
| 쌍검 (Twin Strike)         | 1    | 5 데미지 x 2회                                 |
| 회전 베기 (Whirlwind)      | X    | X만큼 전체에 5 데미지                          |
| 칼날 춤 (Sword Dance)      | 1    | 9 데미지, 다음 턴 취약 1 (자신)                |
| 처형 (Execute)             | 2    | 적 HP 50% 이하 시 25 데미지, 그 외 8 데미지    |

**방어 카드 (4장)**:

| 카드                          | 비용 | 효과                        |
| ----------------------------- | ---- | --------------------------- |
| 철벽 (Iron Wall)              | 2    | 12 방어                     |
| 무혈 수비 (Bloodless Defense) | 1    | 8 방어, HP 3 잃음           |
| 반격 준비 (Counter Stance)    | 1    | 5 방어, 다음 공격 +3 데미지 |
| 전투 함성 (Battle Cry)        | 0    | 3 방어 + 카드 1장 드로우    |

**스킬 카드 (5장)**:

| 카드                     | 비용 | 효과                                    |
| ------------------------ | ---- | --------------------------------------- |
| 근육 강화 (Flex)         | 0    | 힘 +2 (이번 턴만)                       |
| 경계 (Vigilance)         | 2    | 8 방어 + 카드 2장 드로우                |
| 피의 의식 (Blood Ritual) | 0    | HP 3 잃고 에너지 +2                     |
| 전쟁의 함성 (War Cry)    | 0    | 카드 1장 드로우 + 손패 1장 덱 위에 올림 |
| 포효 (Roar)              | 1    | 적 전체에 약화 1                        |

**파워 카드 (3장)**:

| 카드                  | 비용 | 효과                        |
| --------------------- | ---- | --------------------------- |
| 강철 의지 (Iron Will) | 1    | 매 턴 시작 시 방어 3 획득   |
| 광전사 (Berserker)    | 1    | 매 턴 시작 시 힘 +1         |
| 가시 갑옷 (Thorns)    | 1    | 피격 시 공격자에게 3 데미지 |

**저주 카드 (1장)**:

| 카드        | 비용 | 효과                                          |
| ----------- | ---- | --------------------------------------------- |
| 고통 (Pain) | -    | 사용 불가, 손패에 있으면 턴 시작 시 HP 1 잃음 |

### 4. 적 시스템

#### 적 데이터 구조 (확장 가능 설계)

```typescript
interface EnemyDef {
  id: string;
  name: string;
  emoji: string; // 의도 표시 등에 사용
  hp: [number, number]; // [최소, 최대] 랜덤 범위
  sprite: ComponentType<{
    width?: number;
    height?: number;
    className?: string;
  }>; // 캐릭터 비주얼 (SVG → 이미지 교체 가능)
  patterns: EnemyPattern[];
}

interface EnemyPattern {
  weight: number; // 선택 확률 가중치
  intent: Intent; // 의도 표시용
  action: EnemyAction; // 실제 행동
  condition?: (state: BattleState) => boolean; // 조건부 패턴
}

type Intent = "attack" | "defend" | "buff" | "debuff" | "special";

type EnemyAction =
  | { type: "attack"; damage: number; times?: number }
  | { type: "block"; value: number }
  | { type: "buff"; buff: BuffType; value: number }
  | { type: "debuff"; buff: BuffType; value: number; target: "player" }
  | { type: "heal"; value: number }
  | { type: "summon"; enemyId: string }
  | { type: "multi"; actions: EnemyAction[] };
```

**확장 포인트**: 새 적 추가 시 `EnemyDef` 객체 + SVG 컴포넌트만 추가하면 된다.

#### 일반 적 (6종)

| 적          | HP    | 패턴                                        | Act |
| ----------- | ----- | ------------------------------------------- | --- |
| 슬라임      | 12~16 | 공격(6) / 공격(3)x2 번갈아                  | 1   |
| 고블린      | 14~18 | 공격(7) 70% / 약화 1 30%                    | 1   |
| 해골 전사   | 18~22 | 공격(9) 60% / 방어(6) 40%                   | 1~2 |
| 독버섯      | 20~25 | 독(3) 60% / 공격(5) 40%                     | 2   |
| 박쥐 떼     | 10~14 | 공격(4)x3 70% / 치유(4) 30%                 | 2   |
| 어둠 마법사 | 25~30 | 공격(12) 40% / 취약(2) 30% / 힘+1(자신) 30% | 3   |

#### 엘리트 적 (3종)

| 적          | HP    | 패턴                                           |
| ----------- | ----- | ---------------------------------------------- |
| 고대 기사   | 55~65 | 공격(15) / 방어(12)+힘+1 / 공격(8)x2 순환      |
| 화염 정령   | 45~55 | 공격(10)+독(2) / 전체공격(7) / 힘+2(자신) 순환 |
| 그림자 도적 | 40~50 | 공격(5)x3 / 약화(2)+취약(1) / 공격(20) 3턴마다 |

#### 보스 (3종, 층별 1)

| 보스   | HP  | Act | 특수 패턴                                              |
| ------ | --- | --- | ------------------------------------------------------ |
| 골렘   | 100 | 1   | 공격(12) / 방어(15) / 공격(20) 3턴마다 대형 공격       |
| 리치   | 120 | 2   | 공격(10)+독(3) / 소환(해골) / 힘+2 / 전체 약화(2)      |
| 드래곤 | 150 | 3   | 공격(15)x2 / 화염(전체 20) 4턴마다 / 방어(20)+치유(10) |

### 5. 유물 시스템

#### 유물 데이터 구조

```typescript
interface RelicDef {
  id: string;
  name: string;
  description: string;
  emoji: string; // 표시용
  effect: RelicEffect;
}

type RelicEffect =
  | { type: "onTurnStart"; action: RelicAction }
  | { type: "onBattleStart"; action: RelicAction }
  | { type: "onCardPlay"; cardType?: string; action: RelicAction }
  | { type: "passive"; stat: string; value: number };
```

#### 유물 목록 (8개)

| 유물        | 이모지 | 효과                               | 획득        |
| ----------- | ------ | ---------------------------------- | ----------- |
| 불타는 피   | 🔥     | 전투 시작 시 HP 6 회복             | 시작 유물   |
| 단단한 부츠 | 🥾     | 1 미만 데미지를 항상 1로 처리      | 보물        |
| 분노의 가면 | 😤     | 전투 시작 시 힘 +1                 | 엘리트 보상 |
| 수호의 반지 | 💍     | 매 턴 시작 시 방어 2               | 보물        |
| 에너지 수정 | 💎     | 매 턴 에너지 +1 (4로 시작)         | 보스 보상   |
| 치유의 물약 | 🧪     | 휴식 시 HP 50% 회복 (30% 대신)     | 보물        |
| 고대 동전   | 🪙     | 전투 보상 골드 +25                 | 엘리트 보상 |
| 가시 왕관   | 👑     | 전투 시작 시 가시 2 (피격 시 반사) | 보스 보상   |

### 6. 맵 시스템

#### 맵 생성 알고리즘

```
각 Act의 맵:
  - 7개 층 (row)
  - 각 층에 2~4개 노드
  - 노드 간 경로 연결 (위에서 아래로)
  - 마지막 층은 항상 보스 1개

노드 배치 규칙:
  - 1층: 전투 노드 2~3개 (시작점)
  - 2~5층: 전투(50%), 엘리트(15%), 휴식(15%), 보물(10%), 이벤트(10%)
  - 6층: 휴식 1~2개 (보스 전 회복)
  - 7층: 보스 1개

경로 규칙:
  - 각 노드는 다음 층의 1~2개 노드로 연결
  - 모든 노드는 최소 1개 경로 연결
  - 교차 경로 허용 (SVG 선으로 표현)
```

#### 맵 렌더링

- SVG `<circle>` + `<line>` 조합
- 현재 위치: 밝은 색 강조 + 펄스 애니메이션
- 방문한 노드: 어두운 색
- 이동 가능 노드: 클릭 가능 표시

### 7. 보상 시스템

#### 전투 보상

| 보상      | 일반 전투  | 엘리트 전투 | 보스            |
| --------- | ---------- | ----------- | --------------- |
| 카드 선택 | 3장 중 1장 | 3장 중 1장  | -               |
| 골드      | 15~25      | 30~50       | -               |
| 유물      | -          | 1개         | 1개 (보스 유물) |

#### 카드 선택 화면

3장의 카드를 크게 표시. 각 카드 탭/클릭으로 선택. "건너뛰기" 옵션 제공.

### 8. 카드 제거

- 휴식 노드에서 "카드 제거" 선택 가능 (HP 회복 대신)
- 덱에서 1장 선택하여 영구 제거
- 약한 기본 카드(강타, 수비)를 제거하여 덱 효율화

## UI/레이아웃

### 화면 구성

```
┌─────────────────────────────────────────────┐
│ 헤더: 게임 목록 링크 · 미니 스파이어          │
├─────────────────────────────────────────────┤
│                                             │
│  맵 화면 / 전투 화면 / 보상 화면 (상태별)      │
│                                             │
├─────────────────────────────────────────────┤
│ (전투 시) 손패 카드 영역                      │
└─────────────────────────────────────────────┘
```

### 전투 화면 레이아웃

```
┌─────────────────────────────────────────────┐
│  [HP: ❤️ 65/80]  [🛡️ 5]  Act 1 - 전투 3    │
├─────────────────────────────────────────────┤
│                                             │
│            ┌──────────┐                     │
│            │  적 SVG   │                    │
│            │ HP: 12/16 │                    │
│            │ 의도: ⚔️ 6│                    │
│            └──────────┘                     │
│                                             │
│        ┌──────────────┐                     │
│        │ 플레이어 SVG  │                    │
│        │ 🛡️ 5        │                     │
│        └──────────────┘                     │
│                                             │
├────────────────────────────────────────────-┤
│ ⚡3  [카드1] [카드2] [카드3] [카드4] [카드5]  │
│      🃏 드로우: 5   버림: 0  [턴 종료]       │
├─────────────────────────────────────────────┤
│  유물: 🔥 💍 😤                              │
└─────────────────────────────────────────────┘
```

### 카드 UI (CSS 구현)

```
┌─────────────┐
│ ⚡1    ⚔️   │  ← 에너지 비용 (왼쪽), 타입 아이콘 (오른쪽)
│             │
│   강 타     │  ← 카드 이름
│             │
│  6 데미지   │  ← 효과 설명
│             │
└─────────────┘

카드 크기: 모바일 ~60px 너비, 데스크톱 ~90px 너비
카드 호버: scale(1.15) + z-index 상승
카드 선택: 위로 20px 이동 + 밝은 테두리
```

### 반응형 설계

| 요소          | 모바일               | 데스크톱    |
| ------------- | -------------------- | ----------- |
| 카드 크기     | 60x84px              | 90x126px    |
| 손패 표시     | 카드 겹침 (fan 배치) | 카드 나란히 |
| 적 크기       | 80px                 | 120px       |
| 플레이어 크기 | 60px                 | 100px       |
| 맵            | 세로 스크롤          | 전체 표시   |

**모바일에서 플레이 가능** -- 카드 탭, 적 탭으로 자연스러운 조작.

## 디렉토리 구조

```
src/app/
├── games/
│   └── spire/
│       └── page.tsx              # 게임 메인 (상태 머신)
│
├── components/games/spire/
│   ├── BattleScene.tsx           # 전투 화면
│   ├── MapScene.tsx              # 맵 화면
│   ├── RewardScene.tsx           # 보상 화면
│   ├── RestScene.tsx             # 휴식 화면
│   ├── CardComponent.tsx         # 카드 UI 렌더링
│   ├── CardRewardModal.tsx       # 카드 선택 모달
│   ├── EnemyComponent.tsx        # 적 렌더링 (SVG + HP + 의도)
│   ├── PlayerComponent.tsx       # 플레이어 렌더링 (SVG + HP)
│   ├── MapNode.tsx               # 맵 노드
│   ├── StatusBar.tsx             # 상단 상태바 (HP, 층, 유물)
│   ├── HandArea.tsx              # 손패 영역
│   ├── BuffIcon.tsx              # 버프/디버프 아이콘
│   ├── RelicBar.tsx              # 유물 표시줄
│   ├── ThumbnailSpire.tsx        # 게임 목록 썸네일
│   └── svg/                      # SVG 캐릭터 컴포넌트
│       ├── PlayerSVG.tsx
│       ├── SlimeSVG.tsx
│       ├── GoblinSVG.tsx
│       ├── SkeletonSVG.tsx
│       ├── MushroomSVG.tsx
│       ├── BatsSVG.tsx
│       ├── DarkMageSVG.tsx
│       ├── AncientKnightSVG.tsx
│       ├── FireSpiritSVG.tsx
│       ├── ShadowThiefSVG.tsx
│       ├── GolemSVG.tsx
│       ├── LichSVG.tsx
│       └── DragonSVG.tsx
│
├── lib/games/spire/
│   ├── types.ts                  # 모든 타입 정의
│   ├── cards.ts                  # 카드 정의 (확장 지점)
│   ├── enemies.ts                # 적 정의 (확장 지점)
│   ├── relics.ts                 # 유물 정의 (확장 지점)
│   ├── combat.ts                 # 전투 로직 (데미지 계산, 효과 적용)
│   ├── mapGen.ts                 # 맵 생성 알고리즘
│   ├── gameState.ts              # 게임 상태 관리 (useReducer)
│   └── ai.ts                     # 적 AI (패턴 선택)
```

### 확장 가이드

**카드 추가**: `lib/games/spire/cards.ts` 에 `CardDef` 객체 추가. `effects` 배열 조합으로 구현.

**적 추가**: `lib/games/spire/enemies.ts`에 `EnemyDef` 추가 + `components/games/spire/svg/`에 SVG 컴포넌트 추가.

**캐릭터 추가 (향후)**: 새 시작 덱 + 전용 카드 풀 + 전용 유물. `cards.ts`에서 `characterId`로 필터링.

**유물 추가**: `lib/games/spire/relics.ts`에 `RelicDef` 추가.

**에셋 교체 (SVG → 이미지)**:

1. 이미지 파일을 `public/games/spire/` 또는 `src/app/components/games/spire/assets/`에 배치
2. 래퍼 컴포넌트 생성: `({ width, height, className }) => <Image src={...} />`
3. `enemies.ts`의 `sprite` 필드를 새 컴포넌트로 교체
4. 게임 로직 수정 없이 비주얼만 변경됨

## 타입 정의

```typescript
// === 게임 상태 ===

type GamePhase =
  | "map"
  | "battle"
  | "reward"
  | "rest"
  | "cardReward"
  | "gameOver"
  | "victory";

interface GameState {
  phase: GamePhase;
  player: PlayerState;
  map: GameMap;
  currentAct: number; // 1~3
  currentNodeId: string;
  deck: CardInstance[]; // 전체 덱
  relics: RelicDef[];
  gold: number;
  score: number;
}

interface PlayerState {
  hp: number;
  maxHp: number;
  block: number;
  energy: number;
  maxEnergy: number;
  buffs: BuffState[];
}

interface BuffState {
  type: BuffType;
  value: number;
  duration?: number; // undefined = 영구
}

// === 전투 상태 ===

interface BattleState {
  enemies: EnemyInstance[];
  hand: CardInstance[];
  drawPile: CardInstance[];
  discardPile: CardInstance[];
  exhaustPile: CardInstance[];
  turn: number;
  selectedCardIndex: number | null;
  targetingMode: boolean;
}

interface EnemyInstance {
  def: EnemyDef;
  hp: number;
  maxHp: number;
  block: number;
  buffs: BuffState[];
  currentIntent: EnemyPattern;
  patternIndex: number;
}

interface CardInstance {
  def: CardDef;
  instanceId: string; // 동일 카드 구분용 유니크 ID
  upgraded: boolean;
}

// === 맵 ===

interface GameMap {
  acts: ActMap[];
}

interface ActMap {
  nodes: MapNode[];
  edges: MapEdge[];
}

interface MapNode {
  id: string;
  row: number;
  col: number;
  type: "battle" | "elite" | "boss" | "rest" | "treasure" | "event";
  visited: boolean;
  available: boolean;
}

interface MapEdge {
  from: string;
  to: string;
}
```

## 상태 관리 (useReducer)

```typescript
type GameAction =
  // 맵
  | { type: "SELECT_NODE"; nodeId: string }
  // 전투
  | { type: "PLAY_CARD"; cardIndex: number; targetIndex?: number }
  | { type: "END_TURN" }
  | { type: "SELECT_CARD"; cardIndex: number }
  // 보상
  | { type: "PICK_CARD_REWARD"; cardIndex: number }
  | { type: "SKIP_CARD_REWARD" }
  | { type: "COLLECT_GOLD" }
  | { type: "COLLECT_RELIC" }
  // 휴식
  | { type: "REST_HEAL" }
  | { type: "REST_REMOVE_CARD"; cardIndex: number }
  // 진행
  | { type: "PROCEED_TO_MAP" }
  | { type: "RESTART" };
```

게임 전체를 `useReducer`로 관리하여 상태 변경이 예측 가능하고 디버깅이 쉽다.

## 저장 (localStorage)

```typescript
interface SpireSaveData {
  bestScore: number;
  bestAct: number; // 최고 도달 층
  totalRuns: number; // 총 플레이 횟수
  totalWins: number; // 승리 횟수
}

const SAVE_KEY = "game_best_spire";
```

현재 런 진행 중 저장은 하지 않는다 (로그라이크 특성상 죽으면 처음부터).

## 스타일링 가이드

### 카드 CSS

```css
/* 카드 기본 */
.spire-card {
  width: 90px;
  height: 126px;
  border-radius: 8px;
  border: 2px solid;
  background: white;
  cursor: pointer;
  transition:
    transform 0.15s,
    box-shadow 0.15s;
}

/* 타입별 테두리 */
.spire-card--attack {
  border-color: #ef4444;
}
.spire-card--skill {
  border-color: #3b82f6;
}
.spire-card--power {
  border-color: #a855f7;
}

/* 호버 */
.spire-card:hover {
  transform: translateY(-12px) scale(1.1);
  z-index: 10;
}

/* 선택됨 */
.spire-card--selected {
  transform: translateY(-20px);
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.5);
}

/* 사용 불가 (에너지 부족) */
.spire-card--disabled {
  opacity: 0.5;
  filter: grayscale(0.5);
}
```

### 다크모드

- 카드 배경: `bg-white` → `dark:bg-zinc-800`
- 카드 텍스트: `text-zinc-900` → `dark:text-zinc-100`
- 전투 배경: `bg-zinc-50` → `dark:bg-zinc-900`
- HP바: 빨강 그라데이션 유지 (다크모드에서도 동일)

### 모바일 최적화

- 카드: 60x84px, 겹쳐서 부채꼴 배치
- 카드 탭: 먼저 선택(확대) → 다시 탭으로 사용
- 적 탭: 타겟 지정
- 긴 텍스트 대신 숫자 + 이모지 아이콘 중심

## 구현 순서 (Sonnet 가이드)

### Phase 1: 기반 (먼저 구현)

1. `lib/games/spire/types.ts` - 모든 타입 정의
2. `lib/games/spire/cards.ts` - 카드 데이터
3. `lib/games/spire/enemies.ts` - 적 데이터
4. `lib/games/spire/relics.ts` - 유물 데이터

### Phase 2: 전투 핵심

5. `lib/games/spire/combat.ts` - 전투 로직
6. `lib/games/spire/ai.ts` - 적 AI
7. `lib/games/spire/gameState.ts` - useReducer + 상태 관리

### Phase 3: UI 컴포넌트

8. SVG 캐릭터들 (`svg/` 폴더)
9. `CardComponent.tsx` - 카드 렌더링
10. `EnemyComponent.tsx` - 적 렌더링
11. `PlayerComponent.tsx` - 플레이어 렌더링
12. `HandArea.tsx` - 손패 영역
13. `BattleScene.tsx` - 전투 화면 조합

### Phase 4: 맵 + 보상

14. `lib/games/spire/mapGen.ts` - 맵 생성
15. `MapScene.tsx` + `MapNode.tsx` - 맵 화면
16. `RewardScene.tsx` - 보상 화면
17. `CardRewardModal.tsx` - 카드 선택
18. `RestScene.tsx` - 휴식 화면

### Phase 5: 통합 + 메뉴 등록
pGen.ts` - 맵 생성
15. `MapScene.tsx` + `MapNode.tsx` - 맵 화면
16. `RewardScene.tsx` - 보상 화면
17. `CardRewardModal.tsx` - 카드 선택
18. `RestScene.tsx` - 휴식 화면

### Phase 5: 통합 + 메뉴 등록

19. `games/spire/page.tsx` - 메인 페이지 (상태 머신으로 Phase 전환)
20. `ThumbnailSpire.tsx` - 썸네일
21. `constants.ts` 에 게임 등록
22. `ARCHITECTURE.md` 업데이트

## 빌드 체크리스트

- [ ] `npx tsc --noEmit` 통과
- [ ] 라이트/다크모드 정상 표시
- [ ] 모바일/데스크톱 반응형
- [ ] 전투 흐름: 카드 플레이 → 적 턴 → 승리/패배
- [ ] 맵 이동 + 보상 + 휴식 동작
- [ ] 3개 층 + 보스 3개 완주 가능
- [ ] localStorage 최고 기록 저장
- [ ] 게임 목록에 정상 표시
