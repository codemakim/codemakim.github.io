# 미니 스파이어 연출 개선 계획

> 작업 완료 후 이 문서는 삭제한다.

## 현재 상태

### 현재 이펙트 파일

- `src/app/components/games/spire/BattleEffects.tsx`: 데미지/힐/방어 숫자 팝업 + useEffects 훅
- `src/app/styles/components.css`: fadeUp, shake 키프레임 (파일 하단)

### 현재 문제점

| 항목        | 현재 구현                           | 문제                            |
| ----------- | ----------------------------------- | ------------------------------- |
| 데미지 숫자 | `text-red-400`, 800ms, 단순 fade-up | 색이 옅고 너무 빨리 사라짐      |
| 흔들림      | 0.3초, 좌우 ±4px                    | 너무 미세해서 체감이 안 됨      |
| 공격 이펙트 | 없음                                | 베기/타격 시 시각적 피드백 전무 |
| 방어 이펙트 | 숫자만 표시                         | 방패 연출 없음                  |
| 힐 이펙트   | 숫자만 표시                         | 회복 연출 없음                  |
| 피격 반응   | 흔들림만                            | 색상 변화/강조 없음             |

### 관련 파일 (수정 대상)

- `src/app/components/games/spire/BattleScene.tsx`: 이펙트 발생 로직
- `src/app/components/games/spire/EnemyComponent.tsx`: 적 피격 반응
- `src/app/components/games/spire/PlayerComponent.tsx`: 플레이어 피격 반응
- `src/app/components/games/spire/HandArea.tsx`: 카드 사용 UI
- `src/app/components/games/spire/CardComponent.tsx`: 카드 선택/사용 UI
- `src/app/lib/games/spire/types.ts`: BattleEffect 타입

## 핵심 설계 원칙: 이펙트/사운드는 카드/적 데이터에 귀속

이펙트와 사운드는 BattleScene 등에서 하드코딩하지 않는다.
카드 정의(`CardDef`)와 적 행동(`EnemyAction`)에 직접 명시하여
새 카드/적 추가 시 해당 데이터만 수정하면 연출이 자동 적용되는 구조를 만든다.

### 타입 확장

```typescript
// 시각 이펙트 종류
export type VfxType =
  | "slash"
  | "impact"
  | "magic"
  | "pierce"
  | "shield"
  | "heal"
  | "poison"
  | "buff"
  | "none";

// 사운드 이펙트 종류 (Phase 5 이후 구현, 지금은 타입만 정의)
export type SfxType =
  | "slash"
  | "hit"
  | "heavy_hit"
  | "block"
  | "heal"
  | "buff"
  | "debuff"
  | "none";
```

### CardDef 확장

```typescript
export interface CardDef {
  // ...기존 필드
  vfx?: VfxType; // 카드 사용 시 재생할 시각 이펙트 (기본: attack→'slash', skill→'none')
  sfx?: SfxType; // 카드 사용 시 재생할 사운드 (추후 구현, 기본: 'none')
}
```

### CardEffect (damage) 확장

다중 타격에서 각 타격별 이펙트를 제어한다:

```typescript
{ type: 'damage'; value: number; target?: 'single' | 'all'; hits?: number; vfx?: VfxType }
```

### EnemyAction 확장

적 공격에도 이펙트를 지정한다:

```typescript
{ type: 'attack'; damage: number; times?: number; vfx?: VfxType; sfx?: SfxType }
```

### 카드별 이펙트 매핑 예시

| 카드               | vfx      | sfx (추후)  | 이유         |
| ------------------ | -------- | ----------- | ------------ |
| 강타 (Strike)      | `slash`  | `slash`     | 기본 검 공격 |
| 일섬 (Bash)        | `impact` | `heavy_hit` | 강한 타격    |
| 쌍검 (Twin Strike) | `slash`  | `slash`     | 2회 베기     |
| 연타 (Fury)        | `impact` | `hit`       | 빠른 연타    |
| 난타 (Pummel)      | `impact` | `heavy_hit` | 강한 연타    |
| 강력한 일격        | `impact` | `heavy_hit` | 강타         |
| 칼날 폭풍          | `slash`  | `slash`     | 전체 베기    |
| 회전 베기          | `slash`  | `slash`     | 전체 베기    |
| 칼날 춤            | `slash`  | `slash`     | 베기         |
| 처형               | `pierce` | `heavy_hit` | 관통         |
| 수비 (Defend)      | `shield` | `block`     | 방어         |
| 철벽               | `shield` | `block`     | 방어         |
| 무혈 수비          | `shield` | `block`     | 방어         |
| 반격 준비          | `shield` | `block`     | 방어         |
| 전투 함성          | `buff`   | `buff`      | 버프         |
| 근육 강화          | `buff`   | `buff`      | 버프         |
| 피의 의식          | `magic`  | `debuff`    | 마법         |
| 포효               | `magic`  | `debuff`    | 디버프       |

### 적 공격 이펙트 매핑 예시

| 적        | 공격 패턴  | vfx      | 이유      |
| --------- | ---------- | -------- | --------- |
| 슬라임    | 몸통박치기 | `impact` | 타격      |
| 고블린    | 단검       | `slash`  | 베기      |
| 해골 전사 | 칼         | `slash`  | 베기      |
| 독버섯    | 독 뿌림    | `poison` | 독        |
| 박쥐 떼   | 물기       | `impact` | 빠른 연타 |
| 고대 기사 | 대검       | `slash`  | 강한 베기 |
| 드래곤    | 브레스     | `magic`  | 마법 공격 |

### 이펙트 재생 흐름

```
카드 사용 → CardDef.vfx 확인 → EffectLayer에 해당 이펙트 요청
                              → CardDef.sfx 확인 → SoundManager에 해당 사운드 요청 (추후)
적 행동   → EnemyAction.vfx 확인 → EffectLayer에 해당 이펙트 요청
                                 → EnemyAction.sfx 확인 → SoundManager에 해당 사운드 요청 (추후)
```

BattleScene은 이펙트 종류를 판단하지 않고, 데이터에 명시된 vfx/sfx를 그대로 전달만 한다.

### 사운드 확장 대비

사운드는 이번 작업에서 구현하지 않지만, 타입과 필드를 미리 정의해둔다.
추후 `SoundManager` 훅을 만들면 `sfx` 필드를 읽어서 재생하면 된다.
기존 `useGameAudio.ts`를 확장하거나 별도 훅으로 구현한다.

## 기술 선택: Motion (구 Framer Motion)

`npm install motion` 으로 설치한다.

사용 이유:

- React 생태계 1위 애니메이션 라이브러리
- `AnimatePresence`로 이펙트 등장/소멸 처리
- Spring physics 기반의 자연스러운 움직임
- ~10KB로 가볍고, 정적 빌드(`output: 'export'`)와 호환
- 선언적 API

SVG 기반 이펙트(베기선, 타격 파동)는 inline SVG + Motion의 path animation으로 구현한다.

## 디렉토리 구조

```
src/app/components/games/spire/
├── effects/
│   ├── EffectLayer.tsx      # 전체 이펙트 오케스트레이터 (AnimatePresence)
│   ├── DamagePopup.tsx      # 데미지/힐/방어 숫자 팝업
│   ├── SlashEffect.tsx      # 베기 SVG 이펙트
│   ├── ImpactEffect.tsx     # 타격 방사형 이펙트
│   ├── ShieldEffect.tsx     # 방어 이펙트
│   ├── HealEffect.tsx       # 힐 파티클 이펙트
│   └── ScreenFlash.tsx      # 화면 전체 플래시 (큰 데미지)
├── BattleEffects.tsx        # 삭제 (effects/로 이관)
└── ...
```

## Phase 1: 기반 교체

### 1-1. Motion 설치

```bash
npm install motion
```

### 1-2. 타입 확장 (types.ts)

위의 "핵심 설계 원칙" 섹션에 정의된 타입을 모두 반영한다:

1. `VfxType`, `SfxType` 타입 추가
2. `CardDef`에 `vfx?: VfxType`, `sfx?: SfxType` 필드 추가
3. `CardEffect`의 damage에 `vfx?: VfxType` 추가
4. `EnemyAction`의 attack에 `vfx?: VfxType`, `sfx?: SfxType` 추가
5. `BattleEffect`에 `vfx` 필드 추가:

```typescript
export interface BattleEffect {
  id: string;
  type: "damage" | "block" | "heal" | "buff" | "miss";
  value: number;
  target: "player" | number;
  timestamp: number;
  vfx?: VfxType;
}
```

### 1-3. 카드/적 데이터에 vfx 매핑

위의 "카드별 이펙트 매핑 예시", "적 공격 이펙트 매핑 예시" 표를 참고하여
`cards.ts`의 모든 카드와 `enemies.ts`의 모든 적 패턴에 `vfx` 필드를 추가한다.
`sfx`는 타입만 정의하고 값은 아직 넣지 않는다.

### 1-4. effects/ 디렉토리 생성 + EffectLayer 구현

`EffectLayer.tsx`는 `AnimatePresence`로 모든 이펙트의 라이프사이클을 관리한다.
기존 `BattleEffects.tsx`의 역할을 대체한다.

## Phase 2: 데미지 숫자 팝업 개선

### DamagePopup.tsx

| 항목       | 기존                       | 변경                                                   |
| ---------- | -------------------------- | ------------------------------------------------------ |
| 색상       | `text-red-400` (연한 빨강) | `text-red-500` + 흰색 text-stroke + 강한 drop-shadow   |
| 크기       | `text-xl`                  | `text-3xl` + 등장 시 scale 1.5→1.0 스프링              |
| 지속시간   | 800ms                      | 1500ms                                                 |
| 애니메이션 | 단순 fade-up               | Motion 스프링으로 튀어오르며 등장 → 위로 떠오르며 소멸 |
| 다중타격   | 같은 위치                  | 각 타격마다 약간 다른 x/y 오프셋에 연속 팝업           |

Motion 사용 패턴:

```tsx
<motion.div
  initial={{ opacity: 0, y: 0, scale: 1.5 }}
  animate={{ opacity: 1, y: -10, scale: 1.0 }}
  exit={{ opacity: 0, y: -50 }}
  transition={{ type: "spring", damping: 15, stiffness: 300 }}
>
  -15
</motion.div>
```

색상 매핑:

- damage: `text-red-500`, prefix `-`
- block: `text-blue-400`, prefix `🛡️`
- heal: `text-green-400`, prefix `+`
- miss: `text-zinc-300`, text `MISS`

## Phase 3: 공격 이펙트 (핵심)

### 3-1. SlashEffect.tsx (베기 이펙트)

플레이어 공격 카드 사용 시 적 위에 표시된다.

구현 방식:

- SVG `<path>`로 대각선 베기 자국 (2~3개 라인)
- Motion의 `pathLength` 프로퍼티로 0→1 그려지는 효과
- 밝은 흰색/노란색, 0.4초간 표시 후 fade-out
- 랜덤 각도(±15도)로 자연스러움 추가

```tsx
<motion.svg>
  <motion.path
    d="M 0,50 L 100,0"
    stroke="white"
    strokeWidth={3}
    initial={{ pathLength: 0, opacity: 0.9 }}
    animate={{ pathLength: 1, opacity: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  />
</motion.svg>
```

### 3-2. ImpactEffect.tsx (타격 이펙트)

적/플레이어가 맞을 때 피격 대상 위에 표시된다.

구현 방식:

- SVG 방사형 선(6~8방향) + 중앙 원
- scale 0→1.3→0 + opacity 1→0으로 "팡!" 퍼지는 느낌
- 0.3초간 표시
- 밝은 노란색/주황색 라인

```tsx
<motion.svg>
  {/* 중앙 원 */}
  <motion.circle
    cx={50}
    cy={50}
    r={8}
    fill="rgba(255,200,50,0.8)"
    initial={{ scale: 0 }}
    animate={{ scale: [0, 1.3, 0] }}
    transition={{ duration: 0.3 }}
  />
  {/* 방사형 선 8개 */}
  {Array.from({ length: 8 }).map((_, i) => (
    <motion.line
      key={i}
      x1={50}
      y1={50}
      x2={50 + 30 * Math.cos((i * Math.PI) / 4)}
      y2={50 + 30 * Math.sin((i * Math.PI) / 4)}
      stroke="rgba(255,200,50,0.8)"
      strokeWidth={2}
      initial={{ pathLength: 0, opacity: 1 }}
      animate={{ pathLength: 1, opacity: 0 }}
      transition={{ duration: 0.3 }}
    />
  ))}
</motion.svg>
```

### 3-3. 연타 이펙트

다중 타격(hits > 1) 시:

- 각 타격마다 100ms 간격으로 ImpactEffect 순차 발생
- 각 임팩트는 약간 다른 x/y 오프셋

## Phase 4: 방어/힐/피격 반응

### 4-1. ShieldEffect.tsx (방어 이펙트)

방어 카드 사용 시 플레이어 앞에 표시된다.

구현 방식:

- 반원형 파란색 방패 SVG
- scale 0→1 팝업 + opacity 펄스(밝아졌다 어두워짐)
- 0.5초간 표시

### 4-2. HealEffect.tsx (힐 이펙트)

구현 방식:

- 초록색 `+` 기호 3~5개가 아래→위로 흩어지며 상승
- 각각 약간 다른 속도와 x 위치에서 출발
- 0.8초간 표시 후 fade-out

### 4-3. 피격 반응 강화 (EnemyComponent, PlayerComponent)

| 항목        | 기존        | 변경                                   |
| ----------- | ----------- | -------------------------------------- |
| 흔들림      | ±4px, 0.3초 | ±8px, 0.5초                            |
| 색상 플래시 | 없음        | 피격 순간 빨간색 반투명 오버레이 0.2초 |
| 큰 데미지   | 없음        | 15+ 데미지 시 더 큰 흔들림(±12px)      |

### 4-4. ScreenFlash.tsx (화면 플래시)

큰 데미지(15+)를 받으면 화면 가장자리에 빨간색 비네팅 0.3초 표시.

## Phase 5: 카드 사용 연출

### CardComponent.tsx 변경

Motion의 `layout` 및 `whileHover`/`whileTap` 사용:

| 상태      | 연출                                                 |
| --------- | ---------------------------------------------------- |
| 선택 가능 | hover 시 약간 위로 올라옴 (y: -8)                    |
| 선택됨    | 위로 올라오고 테두리 강조 (y: -12, scale: 1.05)      |
| 사용 시   | 대상 방향으로 축소되며 사라짐 (scale: 0, opacity: 0) |

### HandArea.tsx 변경

- `AnimatePresence`로 카드 입장/퇴장 애니메이션
- 턴 종료 시 남은 카드들이 아래로 내려가며 소멸

## 이펙트 발생 시점 (BattleScene.tsx)

BattleScene은 이펙트 종류를 직접 판단하지 않는다.
카드/적 데이터의 `vfx` 필드를 읽어서 EffectLayer에 전달하기만 한다.

### 플레이어 카드 사용 시

```
1. applyCard 실행 → 상태 변화 감지
2. 사용된 카드의 CardDef.vfx 읽기
3. addEffect(type, value, target, vfx) 호출
4. EffectLayer가 vfx에 맞는 이펙트 컴포넌트 렌더링
```

### 적 행동 시

```
1. executeEnemyAction 실행 → 상태 변화 감지
2. 실행된 EnemyAction.vfx 읽기
3. addEffect(type, value, target, vfx) 호출
4. EffectLayer가 vfx에 맞는 이펙트 컴포넌트 렌더링
```

### 공통 규칙

- 15+ 데미지 시 추가로 ScreenFlash 발생 (이것만 BattleScene에서 판단)
- 방어/힐 이펙트도 카드의 vfx 값으로 결정
- vfx가 없으면 기본값 적용 (attack → 'impact', skill → 'none')

## 변경 파일 요약

| 파일                       | 변경                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| `package.json`             | `motion` 추가                                                                                |
| `types.ts`                 | `VfxType`, `SfxType` 타입, `CardDef.vfx/sfx`, `EnemyAction.vfx/sfx`, `BattleEffect.vfx` 추가 |
| `cards.ts`                 | 모든 카드에 `vfx` 필드 추가                                                                  |
| `enemies.ts`               | 모든 적 공격 패턴에 `vfx` 필드 추가                                                          |
| `effects/EffectLayer.tsx`  | 신규 - AnimatePresence 기반 이펙트 오케스트레이터                                            |
| `effects/DamagePopup.tsx`  | 신규 - 개선된 데미지 숫자                                                                    |
| `effects/SlashEffect.tsx`  | 신규 - 베기 이펙트                                                                           |
| `effects/ImpactEffect.tsx` | 신규 - 타격 이펙트                                                                           |
| `effects/ShieldEffect.tsx` | 신규 - 방어 이펙트                                                                           |
| `effects/HealEffect.tsx`   | 신규 - 힐 이펙트                                                                             |
| `effects/ScreenFlash.tsx`  | 신규 - 화면 플래시                                                                           |
| `BattleEffects.tsx`        | 삭제 (effects/로 완전 이관)                                                                  |
| `BattleScene.tsx`          | 이펙트 발생 로직 확장 (데이터 기반), effects/ 연동                                           |
| `EnemyComponent.tsx`       | 피격 반응 강화 (흔들림 UP, 색상 플래시)                                                      |
| `PlayerComponent.tsx`      | 피격 반응 강화 (흔들림 UP, 색상 플래시)                                                      |
| `HandArea.tsx`             | AnimatePresence 적용                                                                         |
| `CardComponent.tsx`        | Motion hover/tap/exit 애니메이션                                                             |
| `components.css`           | 기존 fadeUp/shake 삭제 (Motion으로 대체)                                                     |

## 구현 순서

1. **Phase 1**: Motion 설치 + 타입 확장(VfxType/SfxType) + 카드/적 데이터에 vfx 매핑 + EffectLayer 구축
2. **Phase 2**: DamagePopup 구현 + 기존 BattleEffects 교체
3. **Phase 3**: SlashEffect + ImpactEffect 구현 + BattleScene 데이터 기반 연동
4. **Phase 4**: ShieldEffect + HealEffect + 피격 반응 강화 + ScreenFlash
5. **Phase 5**: CardComponent/HandArea 카드 연출

각 Phase 완료 후 `npx tsc --noEmit`으로 타입 검증한다.

## 주의사항

- `'use client'` 필수: Motion 컴포넌트는 클라이언트 전용
- `AnimatePresence`의 `mode="popLayout"` 사용 권장
- 이펙트 컴포넌트는 `position: absolute` + `pointer-events: none`
- 정적 빌드 호환성 확인: `npm run build` 통과 필수
- 기존 `useEffects` 훅의 인터페이스는 유지하되 내부 구현만 교체
