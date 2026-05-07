# 상태 관리 + React 성능 마스터 코스 재작성 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** React Advanced 03 (상태 관리 6편) + React 성능 (5편)을 "이것만 읽으면 실무 판단 기준이 잡힌다"는 마스터 코스로 재작성한다.

**Architecture:** 기존 MDX 파일을 in-place 덮어쓰거나, 새 MDX를 추가하고 seriesOrder를 재정렬한다. Concurrent React 편은 초안 작성 후 사용자가 리뷰한다.

**Tech Stack:** MDX, Contentlayer2, TypeScript (코드 예제), prettier, npx tsc --noEmit

---

## 파일 구조 계획

### 상태 관리 시리즈 (react-advanced-03)

| 파일 | 역할 | seriesOrder | 변경 |
|------|------|-------------|------|
| `2025-08-24-react-advanced-03-00-intro.mdx` (NEW) | 상태 관리가 필요한 순간 | 1 | 신규 |
| `2025-08-25-react-advanced-03-01-zustand.mdx` | Zustand 마스터 | 2 | 재작성 |
| `2025-08-26-react-advanced-03-02-redux-toolkit.mdx` | Redux Toolkit 마스터 | 3 | 재작성 |
| `2025-08-27-react-advanced-03-03-jotai.mdx` | Jotai 마스터 | 4 | 재작성 |
| `2025-08-28-react-advanced-03-04-comparison.mdx` | 선택 프레임워크 | 5 | 재작성 |
| `2025-08-29-react-advanced-03-05-practice-and-next.mdx` | E-Commerce 실전 설계 | 6 | 재작성 |

### React 성능 시리즈 (react-performance)

| 파일 | 역할 | seriesOrder | 변경 |
|------|------|-------------|------|
| `2025-09-29-react-performance-01-optimization-basics.mdx` | 측정부터 시작 | 1 | 재작성 (측정만) |
| `2025-09-30-react-performance-02-rendering-cost.mdx` (NEW) | 렌더링 비용 줄이기 | 2 | 신규 |
| `2025-10-06-react-performance-02-code-splitting.mdx` | 코드 분할과 네트워크 | 3 | seriesOrder 수정 + 재작성 |
| `2025-10-05-react-performance-03-advanced-patterns.mdx` | 대형 UI: 가상화와 INP | 4 | 재작성 (Concurrent 분리) |
| `2025-10-07-react-performance-05-concurrent.mdx` (NEW) | Concurrent React | 5 | 신규 (사용자 리뷰 필요) |

---

## 공통 글 구조 (모든 포스트 적용)

1. **오늘 풀 문제** — "이 API가 무엇인가"가 아니라 "실무에서 어떤 상황이 꼬이는가"
2. **정신 모델** — 이후 API를 스스로 판단할 수 있는 기준
3. **최소 코드** — 딱 한 API만 써서 동작 모델 확인 (TypeScript, import 포함)
4. **실무 코드** — 검증, 에러, 캐시, 배포, 보안 함정 포함
5. **망하는 패턴** — 왜 안 되는지 원인까지 분석
6. **Vue/Nuxt 비교** — 기존 기준점으로 개념 연결
7. **마스터 체크** — "이 질문에 답하면 다음 편으로 가도 된다"

문체: `~한다/~된다` 체. "쉽다/강력하다" 홍보 문장 대신 책임 기준으로 설명.

---

## Task 1: 상태 관리 intro 신규 작성 (03-00)

**Files:**
- Create: `content/2025-08-24-react-advanced-03-00-intro.mdx`

### 포스트 구조 및 핵심 내용

```
frontmatter:
  title: "[상태 관리 1/6] 상태 관리가 필요한 순간"
  date: "2025-08-31"
  description: "서버 상태, URL 상태, 로컬 상태, 전역 클라이언트 상태를 구분하고, 각각 어떤 도구가 책임지는지 결정 기준을 잡는다"
  tags: ["React", "고급", "프론트엔드"]
  series: "상태 관리"
  seriesOrder: 1
```

**오늘 풀 문제:**
- 장바구니 상태를 useState로 관리하다가 Redux를 도입했는데, 서버에서 오는 상품 목록도 store에 넣게 됐다.
- API 호출/캐시/리페치를 store에서 직접 관리하게 되면서 코드가 거대해졌다.
- "그래서 React Query를 쓰면 Redux가 필요 없나요?"라는 질문이 나온다.

**정신 모델 — 상태의 4가지 성격:**

```
┌─────────────────────────────────────────────────┐
│  상태 종류        진실의 근원      담당 도구       │
├─────────────────────────────────────────────────┤
│  서버 상태        서버 DB         React Query     │
│  URL 상태         URL             useSearchParams │
│  로컬 상태        컴포넌트        useState        │
│  전역 클라이언트  앱 메모리       Zustand/RTK/…   │
└─────────────────────────────────────────────────┘
```

**최소 코드 — 상태 분류 예제:**
```typescript
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useCartStore } from '@/store/cart'

function ProductList() {
  // URL 상태: 필터는 URL에 있다 — 공유/북마크 가능
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category') ?? 'all'

  // 서버 상태: 상품 목록은 React Query가 캐시/리페치 책임진다
  const { data: products } = useQuery({
    queryKey: ['products', category],
    queryFn: () => fetchProducts(category),
  })

  // 로컬 상태: 이 컴포넌트에서만 쓰는 UI 상태
  const [expanded, setExpanded] = useState(false)

  // 전역 클라이언트 상태: 여러 페이지에서 공유하는 장바구니
  const addToCart = useCartStore(s => s.addItem)
  // ...
}
```

**망하는 패턴:**
1. 서버 상태를 store에 넣기 → 캐시 무효화, 리페치, 낙관적 업데이트를 직접 구현해야 한다
2. 모든 UI 상태를 전역 store에 넣기 → store가 컴포넌트별 임시 상태로 오염된다
3. URL에 넣어야 할 필터를 useState로 관리 → 뒤로가기/공유 시 상태 사라짐

**Vue/Nuxt 비교:**
- Pinia: 클라이언트 전역 상태 담당 → Zustand/RTK 역할
- useFetch/useAsyncData: 서버 상태 → React Query 역할
- useRoute().query: URL 상태 → useSearchParams 역할
- 분리 기준 자체는 동일하다

**마스터 체크:**
1. 상품 목록, 장바구니 아이템 수, 현재 필터, 모달 열림 여부를 각각 어느 상태 종류로 분류하는가?
2. React Query를 쓰면 Zustand가 필요 없는가? 왜인가?

- [ ] **Step 1: 파일 작성** — 위 구조를 바탕으로 전체 MDX 작성 (600줄 이상 목표)
- [ ] **Step 2: 포맷 검증**
  ```bash
  npx prettier@latest --write content/2025-08-24-react-advanced-03-00-intro.mdx
  ```
- [ ] **Step 3: 커밋**
  ```bash
  git add content/2025-08-24-react-advanced-03-00-intro.mdx
  git commit -m "content(state-mgmt): 상태 관리 intro 추가 - 4가지 상태 분류"
  ```

---

## Task 2: Zustand 재작성 (03-01, seriesOrder → 2)

**Files:**
- Modify: `content/2025-08-25-react-advanced-03-01-zustand.mdx`

```
frontmatter 변경:
  title: "[상태 관리 2/6] Zustand — Provider 없이 전역 상태 공유하기"
  seriesOrder: 2
```

**오늘 풀 문제:**
- 모달 열림 여부를 Header와 Modal 두 컴포넌트에서 동기화해야 한다.
- Context를 쓰면 Provider로 감싸야 하고, 값이 바뀔 때마다 하위 트리 전체가 리렌더된다.
- "전역인데 Provider 없이, 구독한 컴포넌트만 리렌더" — 이게 Zustand의 약속이다.

**정신 모델:**
- Zustand store는 React 트리 바깥에 있는 공유 메모리다.
- 컴포넌트는 selector로 필요한 조각만 구독한다.
- store 전체를 구독하면 무관한 변경에도 리렌더된다.

**최소 코드:**
```typescript
import { create } from 'zustand'

interface ModalStore {
  isOpen: boolean
  open: () => void
  close: () => void
}

const useModalStore = create<ModalStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))

// 사용: selector로 필요한 값만 구독
function Header() {
  const open = useModalStore(s => s.open)   // open만 구독
  return <button onClick={open}>열기</button>
}

function Modal() {
  const isOpen = useModalStore(s => s.isOpen)  // isOpen만 구독
  const close = useModalStore(s => s.close)
  if (!isOpen) return null
  return <dialog open onClose={close}>...</dialog>
}
```

**실무 코드 — immer + 복잡한 state:**
```typescript
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'

interface CartStore {
  items: { id: string; qty: number }[]
  addItem: (id: string) => void
  removeItem: (id: string) => void
  clear: () => void
}

const useCartStore = create<CartStore>()(
  persist(
    immer((set) => ({
      items: [],
      addItem: (id) => set((state) => {
        const existing = state.items.find(i => i.id === id)
        if (existing) {
          existing.qty += 1
        } else {
          state.items.push({ id, qty: 1 })
        }
      }),
      removeItem: (id) => set((state) => {
        state.items = state.items.filter(i => i.id !== id)
      }),
      clear: () => set({ items: [] }),
    })),
    { name: 'cart-storage' }
  )
)
```

**망하는 패턴:**
1. `const state = useStore()` — store 전체 구독 → 무관한 변경에도 리렌더
2. 서버 상태(상품 목록)를 store에 저장 → React Query가 할 일을 직접 구현
3. set 내부에서 비동기 없이 직접 fetch → 에러 핸들링/로딩 상태 관리 부재

**Vue 비교:**
- Pinia defineStore ≈ Zustand create
- storeToRefs ≈ selector (반응성 추출)
- Pinia는 Vue DevTools 연동 기본 제공, Zustand는 Redux DevTools 미들웨어 추가

**마스터 체크:**
1. selector 없이 store 전체를 구독하면 어떤 문제가 생기는가?
2. immer 미들웨어를 쓰는 이유는 무엇인가?
3. persist 미들웨어를 쓸 때 localStorage가 없는 SSR 환경에서 어떻게 처리하는가?

- [ ] **Step 1: 파일 재작성** — 위 구조로 전체 MDX 교체 (500줄 이상)
- [ ] **Step 2: 포맷 검증**
  ```bash
  npx prettier@latest --write content/2025-08-25-react-advanced-03-01-zustand.mdx
  ```
- [ ] **Step 3: 커밋**
  ```bash
  git add content/2025-08-25-react-advanced-03-01-zustand.mdx
  git commit -m "content(state-mgmt): Zustand 재작성 - selector 구독 패턴 심화"
  ```

---

## Task 3: Redux Toolkit 재작성 (03-02, seriesOrder → 3)

**Files:**
- Modify: `content/2025-08-26-react-advanced-03-02-redux-toolkit.mdx`

```
frontmatter 변경:
  title: "[상태 관리 3/6] Redux Toolkit — 규칙과 추적이 필요한 팀 상태"
  seriesOrder: 3
```

**오늘 풀 문제:**
- Zustand로 장바구니를 관리하다가, 쿠폰/배송/정책 할인이 붙으며 계산 로직이 복잡해졌다.
- 여러 개발자가 store를 수정하면서 "언제 어디서 상태가 바뀌었는가"를 추적할 수 없다.
- 상태 변경 이력이 필요하고, 미들웨어로 로깅/analytics를 붙여야 한다.

**정신 모델:**
- Redux Toolkit의 핵심은 "상태 변경에 이름을 붙이고 기록하는 것"이다.
- action → reducer 단방향 흐름이 코드 추적을 가능하게 한다.
- RTK Query는 서버 상태 캐시까지 처리하지만, 이미 React Query를 쓴다면 중복이다.

**최소 코드:**
```typescript
import { createSlice, configureStore, PayloadAction } from '@reduxjs/toolkit'

interface CartItem { id: string; qty: number; price: number }
interface CartState {
  items: CartItem[]
  couponCode: string | null
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], couponCode: null } as CartState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find(i => i.id === action.payload.id)
      if (existing) {
        existing.qty += 1
      } else {
        state.items.push(action.payload)
      }
    },
    applyCoupon(state, action: PayloadAction<string>) {
      state.couponCode = action.payload
    },
    clearCart(state) {
      state.items = []
      state.couponCode = null
    },
  },
})

export const { addItem, applyCoupon, clearCart } = cartSlice.actions

const store = configureStore({ reducer: { cart: cartSlice.reducer } })
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

**실무 코드 — createAsyncThunk + 정책 로직:**
```typescript
import { createAsyncThunk, createSelector } from '@reduxjs/toolkit'

// 비동기 action: 쿠폰 검증
export const validateCoupon = createAsyncThunk(
  'cart/validateCoupon',
  async (code: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/coupons/${code}`)
      if (!res.ok) return rejectWithValue('유효하지 않은 쿠폰')
      return await res.json() as { discount: number; type: 'percent' | 'fixed' }
    } catch {
      return rejectWithValue('쿠폰 확인 중 오류가 발생했습니다')
    }
  }
)

// memoized selector: 할인 적용 최종 금액
const selectCartItems = (state: RootState) => state.cart.items
const selectCoupon = (state: RootState) => state.cart.coupon

export const selectTotal = createSelector(
  [selectCartItems, selectCoupon],
  (items, coupon) => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
    if (!coupon) return subtotal
    if (coupon.type === 'percent') return subtotal * (1 - coupon.discount / 100)
    return Math.max(0, subtotal - coupon.discount)
  }
)
```

**망하는 패턴:**
1. 단순 UI 상태(모달, 탭)를 Redux에 넣기 → Zustand면 5줄인 걸 50줄로
2. 서버 상태를 RTK로 캐시 관리 + React Query 병행 → 진실의 근원이 둘
3. createSelector 없이 렌더마다 파생 값 계산 → 불필요한 재연산

**Vue 비교:**
- Pinia는 action이 자유롭다 → 추적 어려움
- RTK는 action에 이름이 있다 → Redux DevTools에서 시간 여행 디버깅 가능
- Pinia에서 비슷한 추적이 필요하면 Pinia plugin + logger 직접 구현

**마스터 체크:**
1. createAsyncThunk에서 rejected 상태를 컴포넌트에서 어떻게 처리하는가?
2. createSelector가 없으면 어떤 문제가 생기는가?
3. React Query와 RTK Query를 같이 쓰는 게 나쁜 이유는 무엇인가?

- [ ] **Step 1: 파일 재작성** (500줄 이상)
- [ ] **Step 2: prettier 포맷**
  ```bash
  npx prettier@latest --write content/2025-08-26-react-advanced-03-02-redux-toolkit.mdx
  ```
- [ ] **Step 3: 커밋**
  ```bash
  git add content/2025-08-26-react-advanced-03-02-redux-toolkit.mdx
  git commit -m "content(state-mgmt): Redux Toolkit 재작성 - 팀 규모 추적 가능 상태"
  ```

---

## Task 4: Jotai 재작성 (03-03, seriesOrder → 4)

**Files:**
- Modify: `content/2025-08-27-react-advanced-03-03-jotai.mdx`

```
frontmatter 변경:
  title: "[상태 관리 4/6] Jotai — 상태 그래프가 필요한 화면"
  seriesOrder: 4
```

**오늘 풀 문제:**
- 체크아웃 화면에서 수량, 쿠폰, 배송 옵션이 바뀔 때마다 최종 금액이 다시 계산된다.
- 이 파생 값들이 서로 의존하고, 일부는 비동기(배송비 API)다.
- Zustand로 하면 파생 값을 selector로 계산하다가 의존 그래프를 직접 관리하게 된다.
- Jotai는 "atom이 atom을 의존한다"는 선언적 그래프로 이 문제를 푼다.

**정신 모델:**
- atom: 상태의 최소 단위
- derived atom: 다른 atom으로 파생된 값 (메모이즈드, 자동 재계산)
- async atom: 비동기 fetch 포함 가능
- write atom: 여러 atom을 한 번에 업데이트하는 명령

**최소 코드:**
```typescript
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'

// 기본 atom
const qtyAtom = atom(1)
const priceAtom = atom(9900)
const couponAtom = atom<number | null>(null) // 할인액 (원)

// derived atom: 자동 재계산
const subtotalAtom = atom((get) => get(qtyAtom) * get(priceAtom))
const totalAtom = atom((get) => {
  const subtotal = get(subtotalAtom)
  const coupon = get(couponAtom)
  return coupon ? Math.max(0, subtotal - coupon) : subtotal
})
```

**실무 코드 — async atom + write atom:**
```typescript
import { atom } from 'jotai'
import { loadable } from 'jotai/utils'

const addressAtom = atom('')

// async atom: 배송비를 주소 기반으로 조회
const shippingAtom = atom(async (get) => {
  const address = get(addressAtom)
  if (!address) return 0
  const res = await fetch(`/api/shipping?address=${encodeURIComponent(address)}`)
  const { cost } = await res.json()
  return cost as number
})

// loadable: Suspense 없이 로딩 상태 처리
const shippingLoadable = loadable(shippingAtom)

// write atom: 여러 atom 초기화
const resetCheckoutAtom = atom(null, (get, set) => {
  set(qtyAtom, 1)
  set(couponAtom, null)
  set(addressAtom, '')
})

function CheckoutSummary() {
  const shipping = useAtomValue(shippingLoadable)
  const total = useAtomValue(totalAtom)
  const reset = useSetAtom(resetCheckoutAtom)

  return (
    <div>
      <p>합계: {total.toLocaleString()}원</p>
      {shipping.state === 'loading' && <p>배송비 계산 중...</p>}
      {shipping.state === 'hasData' && <p>배송비: {shipping.data.toLocaleString()}원</p>}
      <button onClick={reset}>초기화</button>
    </div>
  )
}
```

**망하는 패턴:**
1. 모든 화면에 Jotai 적용 → 단순 전역 상태엔 Zustand가 간단하다
2. atom을 컴포넌트 안에서 생성 → 렌더마다 새 atom 생성 = 상태 초기화
3. async atom에 에러 처리 없음 → useAtomValue가 throw하면 Suspense/ErrorBoundary 필요

**Vue 비교:**
- Vue computed ≈ Jotai derived atom (자동 의존성 추적)
- Jotai는 명시적으로 get(otherAtom)으로 의존 선언
- Vue는 reactive 시스템이 자동 추적, Jotai는 React 렌더 사이클과 분리

**마스터 체크:**
1. derived atom과 createSelector(Redux)의 차이는 무엇인가?
2. atom을 컴포넌트 안에서 생성하면 안 되는 이유는?
3. async atom에서 에러가 발생하면 어떻게 처리하는가?

- [ ] **Step 1: 파일 재작성** (450줄 이상)
- [ ] **Step 2: prettier 포맷**
  ```bash
  npx prettier@latest --write content/2025-08-27-react-advanced-03-03-jotai.mdx
  ```
- [ ] **Step 3: 커밋**
  ```bash
  git add content/2025-08-27-react-advanced-03-03-jotai.mdx
  git commit -m "content(state-mgmt): Jotai 재작성 - atom 의존 그래프 심화"
  ```

---

## Task 5: 선택 프레임워크 재작성 (03-04, seriesOrder → 5)

**Files:**
- Modify: `content/2025-08-28-react-advanced-03-04-comparison.mdx`

```
frontmatter 변경:
  title: "[상태 관리 5/6] 어떤 상태 관리를 선택하는가"
  description: "Context, Zustand, Redux Toolkit, Jotai, React Query를 시나리오별 의사결정 기준으로 비교한다"
  seriesOrder: 5
```

**오늘 풀 문제:**
- 새 기능을 시작할 때마다 "이거 useState? Zustand? Redux?"를 매번 고민한다.
- 표로 비교해봐도 실제 결정이 어렵다 — "팀이 크면 Redux"라는 조언은 너무 추상적이다.

**정신 모델 — 결정 트리:**

```
상태가 필요하다
  ↓
서버/외부 API 데이터인가? → YES → React Query (서버 상태)
  ↓ NO
URL에 반영해야 하는가? (필터, 검색어) → YES → useSearchParams / URL
  ↓ NO
이 컴포넌트 트리 안에서만 쓰는가? → YES → useState / useReducer
  ↓ NO
    여러 페이지에서 공유 / 구조가 단순 → Zustand
    변경 추적 / 복잡한 파생 / 팀 규모 → Redux Toolkit
    파생 값 그래프 / 비동기 의존 → Jotai
```

**시나리오별 판단:**

| 시나리오 | 선택 | 이유 |
|---------|------|------|
| 모달 열림/닫힘 (전역) | Zustand | Provider 없이 3줄 |
| 장바구니 (단순) | Zustand + persist | 아이템 목록 + 로컬 저장 |
| 장바구니 (쿠폰/정책) | Redux Toolkit | action 추적, selector memoize |
| 체크아웃 계산 | Jotai | 파생 atom 그래프 |
| 상품 목록 | React Query | 서버 상태, 캐시/리페치 |
| 현재 필터 | useSearchParams | URL = 공유 가능 |
| 폼 입력 중 값 | useState | 컴포넌트 로컬 |

**망하는 패턴:**
1. 팀이 "일관성"을 위해 모든 상태를 Redux에 → 간단한 UI 상태에 보일러플레이트 과잉
2. 라이브러리 하나로 모든 상태 처리 → 서버 상태/URL 상태를 빠트린다
3. 트렌드 기반 선택 → "요즘 Jotai가 핫하다"는 이유로 도입

**Vue 비교:**
- Pinia → Zustand/RTK 역할
- Vue computed/watchEffect → Jotai atom 의존 그래프
- useFetch/Nuxt useAsyncData → React Query 역할
- 분리 기준 자체는 동일하다

**마스터 체크:**
1. 다음 5개 상태를 어떤 도구로 관리하겠는가? (상품 목록, 장바구니 아이템, 검색 필터, 쿠폰 입력 중 값, 모달 열림)
2. Zustand에서 Redux Toolkit으로 마이그레이션해야 하는 신호는 무엇인가?

- [ ] **Step 1: 파일 재작성** (400줄 이상)
- [ ] **Step 2: prettier 포맷**
  ```bash
  npx prettier@latest --write content/2025-08-28-react-advanced-03-04-comparison.mdx
  ```
- [ ] **Step 3: 커밋**
  ```bash
  git add content/2025-08-28-react-advanced-03-04-comparison.mdx
  git commit -m "content(state-mgmt): 선택 프레임워크 재작성 - 시나리오 의사결정"
  ```

---

## Task 6: E-Commerce 실전 설계 재작성 (03-05, seriesOrder → 6)

**Files:**
- Modify: `content/2025-08-29-react-advanced-03-05-practice-and-next.mdx`

```
frontmatter 변경:
  title: "[상태 관리 6/6] 실전: E-Commerce 상태 설계"
  description: "상품/재고는 React Query, 장바구니는 Zustand, 필터는 URL, 체크아웃은 Jotai — 역할 분리 실전 설계"
  seriesOrder: 6
```

**오늘 풀 문제:**
- E-Commerce 앱에서 상태 관리 도구를 하나로 통일하려다 모든 것이 복잡해진다.
- 해결책은 "역할을 분리하고 도구를 맞게 쓰는 것"이다.

**정신 모델 — 도메인별 역할 분리:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 도메인            상태 성격           도구              이유      │
├─────────────────────────────────────────────────────────────────┤
│ 상품 목록/상세    서버 상태           React Query       캐시/리페치│
│ 재고 확인         서버 상태           React Query       짧은 stale│
│ 장바구니          전역 클라이언트     Zustand + persist 영속 필요  │
│ 상품 필터         URL 상태           useSearchParams    공유/뒤로  │
│ 체크아웃 계산     파생 상태           Jotai atom        의존 그래프│
│ 결제 폼 입력 중   로컬 상태           useState          임시 값    │
└─────────────────────────────────────────────────────────────────┘
```

**실무 코드 — 전체 연결:**
```typescript
// store/cart.ts — Zustand
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface CartItem { productId: string; qty: number; price: number }
interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  clear: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    immer((set) => ({
      items: [],
      addItem: (item) => set((s) => {
        const existing = s.items.find(i => i.productId === item.productId)
        if (existing) { existing.qty += item.qty } else { s.items.push(item) }
      }),
      removeItem: (id) => set((s) => {
        s.items = s.items.filter(i => i.productId !== id)
      }),
      clear: () => set({ items: [] }),
    })),
    { name: 'cart' }
  )
)
```

```typescript
// hooks/useProducts.ts — React Query
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'

export function useProducts() {
  const [params] = useSearchParams()
  const category = params.get('category') ?? 'all'
  const sort = params.get('sort') ?? 'latest'

  return useQuery({
    queryKey: ['products', { category, sort }],
    queryFn: () => fetchProducts({ category, sort }),
    staleTime: 60_000, // 1분 캐시
  })
}
```

```typescript
// atoms/checkout.ts — Jotai
import { atom } from 'jotai'
import { useCartStore } from '@/store/cart'

const couponDiscountAtom = atom<number>(0)
const shippingMethodAtom = atom<'standard' | 'express'>('standard')

const shippingCostAtom = atom((get) =>
  get(shippingMethodAtom) === 'express' ? 5000 : 0
)

// 장바구니 소계를 Jotai atom으로 읽기
const cartSubtotalAtom = atom(() => {
  const items = useCartStore.getState().items
  return items.reduce((sum, i) => sum + i.price * i.qty, 0)
})

const totalAtom = atom((get) => {
  const subtotal = get(cartSubtotalAtom)
  const shipping = get(shippingCostAtom)
  const discount = get(couponDiscountAtom)
  return Math.max(0, subtotal + shipping - discount)
})
```

**망하는 패턴:**
1. 장바구니를 React Query로 관리 → 서버 상태가 아니므로 캐시 무효화 시점이 불명확
2. 필터를 Zustand store에 → 뒤로가기 시 필터가 유지되지 않음
3. 체크아웃 계산을 컴포넌트 안에서 — 여러 단계 폼에서 계산 로직 중복

**마스터 체크:**
1. 위 설계에서 결제 완료 후 장바구니, React Query 캐시, Jotai atom을 어떤 순서로 초기화하는가?
2. SSR 환경에서 Zustand persist가 hydration 불일치를 일으키는 경우는 언제이고 어떻게 방지하는가?

- [ ] **Step 1: 파일 재작성** (500줄 이상)
- [ ] **Step 2: prettier 포맷**
  ```bash
  npx prettier@latest --write content/2025-08-29-react-advanced-03-05-practice-and-next.mdx
  ```
- [ ] **Step 3: 커밋**
  ```bash
  git add content/2025-08-29-react-advanced-03-05-practice-and-next.mdx
  git commit -m "content(state-mgmt): E-Commerce 실전 설계 재작성 - 역할 분리"
  ```

---

## Task 7: React 성능 01 재작성 (측정 전용)

**Files:**
- Modify: `content/2025-09-29-react-performance-01-optimization-basics.mdx`

```
frontmatter 변경:
  title: "[React 성능 1/5] 측정부터 시작한다"
  description: "Lab/Field 지표 분류, Chrome DevTools와 React Profiler로 병목을 찾는 방법"
  seriesOrder: 1
```

**범위 조정:** 기존 파일에서 memo/useMemo/useCallback 내용을 제거하고, 측정과 병목 분류에만 집중한다. 렌더링 최적화는 Task 8(성능 2편)로 이동.

**오늘 풀 문제:**
- "느리다"는 신고가 들어왔다. 무엇부터 보는가?
- 측정 없이 memo/useMemo를 추가하다가 오히려 느려진 경험.

**정신 모델 — 병목 4분류:**

```
┌─────────────────────────────────────────────────────┐
│ 병목 종류     증상               DevTools 기준        │
├─────────────────────────────────────────────────────┤
│ CPU          인터랙션 후 화면 멈춤  JS Profile: Long Task│
│ 네트워크     화면 나타남 지연       Waterfall: LCP 리소스│
│ 레이아웃     스크롤 끊김            Perf: Layout Shift  │
│ 입력 지연    클릭/타이핑 반응 느림  Perf: INP           │
└─────────────────────────────────────────────────────┘
```

**측정 루프:**
```
1. Profiler 열기 — 클릭 등 인터랙션 기록
2. Flame chart에서 Long Task(50ms+) 확인
3. React Profiler: 어떤 컴포넌트가 얼마나 자주, 오래 렌더됐는가
4. 원인 분류 후 처방 — CPU면 렌더 최적화, 네트워크면 번들/캐시
5. 처방 후 재측정 — 비교 없이 "개선됐다"고 말하지 않는다
```

**실무 코드 — React Profiler API:**
```typescript
import { Profiler, ProfilerOnRenderCallback } from 'react'

const onRender: ProfilerOnRenderCallback = (
  id, phase, actualDuration, baseDuration
) => {
  if (actualDuration > 16) {
    console.warn(`[Perf] ${id} ${phase}: ${actualDuration.toFixed(1)}ms`)
  }
}

function App() {
  return (
    <Profiler id="ProductList" onRender={onRender}>
      <ProductList />
    </Profiler>
  )
}
```

**Web Vitals 분류:**
- LCP (Largest Contentful Paint): 최대 콘텐츠 렌더 — 2.5초 이하
- INP (Interaction to Next Paint): 입력 반응성 — 200ms 이하
- CLS (Cumulative Layout Shift): 레이아웃 안정성 — 0.1 이하

**마스터 체크:**
1. React Profiler에서 actualDuration과 baseDuration의 차이는 무엇인가?
2. LCP가 느릴 때 CPU 병목과 네트워크 병목을 어떻게 구분하는가?
3. memo를 추가했는데 왜 오히려 느려질 수 있는가?

- [ ] **Step 1: 파일 재작성** (400줄, memo 내용 제거)
- [ ] **Step 2: prettier 포맷**
  ```bash
  npx prettier@latest --write content/2025-09-29-react-performance-01-optimization-basics.mdx
  ```
- [ ] **Step 3: 커밋**
  ```bash
  git add content/2025-09-29-react-performance-01-optimization-basics.mdx
  git commit -m "content(perf): 성능 01 재작성 - 측정 전용"
  ```

---

## Task 8: React 성능 02 신규 작성 (렌더링 비용)

**Files:**
- Create: `content/2025-09-30-react-performance-02-rendering-cost.mdx`

```
frontmatter:
  title: "[React 성능 2/5] 렌더링 비용을 줄인다 — memo, useMemo, useCallback"
  date: "2025-09-30"
  description: "memo/useMemo/useCallback은 최적화 도구가 아니라 비용 있는 캐시다. 언제 쓰고 언제 쓰지 않는가"
  tags: ["React", "성능", "중급", "프론트엔드"]
  series: "React 성능"
  seriesOrder: 2
```

**오늘 풀 문제:**
- "느리다"는 신고 후 컴포넌트에 memo를 붙였더니 더 느려졌다.
- useMemo를 everywhere에 달았더니 코드가 복잡해졌다.
- "memo는 언제 쓰는가"에 대한 정확한 기준이 없다.

**정신 모델 — memo는 캐시다:**
```
렌더가 비싸다 → memo로 리렌더 방지
               단, props 비교 비용 + 캐시 메모리 비용이 생긴다
               props가 자주 바뀌면 캐시 히트율이 낮다 → 비용만 늘고 이득 없음

useMemo는 값 캐시, useCallback은 함수 캐시
  둘 다 "계산/생성 비용 > 캐시 비용"일 때만 의미 있다
```

**최소 코드:**
```typescript
import { memo, useMemo, useCallback } from 'react'

// memo: props가 안 바뀌면 리렌더 스킵
const ExpensiveChart = memo(function ExpensiveChart({
  data,
  onSelect,
}: {
  data: number[]
  onSelect: (idx: number) => void
}) {
  // 실제로 렌더 비용이 커야 memo가 이득
  return <canvas ref={/* heavy canvas drawing */} />
})

function Dashboard({ userId }: { userId: string }) {
  // useMemo: data 변환이 실제로 비싼 경우
  const chartData = useMemo(
    () => transformRawData(rawData),  // 1000개 데이터 변환
    [rawData]
  )

  // useCallback: 자식에게 memo와 함께 넘길 함수
  const handleSelect = useCallback(
    (idx: number) => setSelected(idx),
    []  // 의존성 없으면 한 번만 생성
  )

  return <ExpensiveChart data={chartData} onSelect={handleSelect} />
}
```

**망하는 패턴:**
1. `const x = useMemo(() => a + b, [a, b])` — 덧셈은 캐시 비용보다 빠르다
2. `const fn = useCallback(() => doSomething(), [])` — 자식이 memo가 아니면 의미 없다
3. 모든 컴포넌트에 memo — props 비교 비용이 렌더 비용보다 클 수 있다

**언제 쓰는가 (체크리스트):**
- memo: 자식 컴포넌트 렌더가 눈에 띄게 비싸고, 부모가 자주 리렌더된다
- useMemo: Profiler에서 해당 계산이 병목으로 나온다
- useCallback: memo 처리된 자식에게 함수를 prop으로 전달한다

**Vue 비교:**
- Vue computed ≈ useMemo (자동 의존성 추적, 자동 캐시)
- Vue에는 memo에 해당하는 명시적 도구가 없다 (reactivity 자체가 세밀)
- 대신 v-once, shallowReactive 등 세분화

**마스터 체크:**
1. `const doubled = useMemo(() => items.map(i => i * 2), [items])`는 적절한가? 왜인가?
2. memo 없이 useCallback만 써도 리렌더를 막을 수 있는가?
3. Profiler 없이 memo/useMemo를 추가하는 게 왜 위험한가?

- [ ] **Step 1: 파일 작성** (400줄 이상)
- [ ] **Step 2: prettier 포맷**
  ```bash
  npx prettier@latest --write content/2025-09-30-react-performance-02-rendering-cost.mdx
  ```
- [ ] **Step 3: 커밋**
  ```bash
  git add content/2025-09-30-react-performance-02-rendering-cost.mdx
  git commit -m "content(perf): 성능 02 신규 - 렌더링 비용 memo/useMemo/useCallback"
  ```

---

## Task 9: React 성능 03 재작성 (코드 분할, seriesOrder → 3)

**Files:**
- Modify: `content/2025-10-06-react-performance-02-code-splitting.mdx`

```
frontmatter 변경:
  title: "[React 성능 3/5] 코드 분할과 네트워크"
  seriesOrder: 3
```

**핵심 변경:** seriesOrder를 2→3으로 수정, 제목의 "2/3"을 "3/5"로 변경. 내용 구조는 공통 7단계 포맷으로 재작성.

**오늘 풀 문제:**
- 앱이 커지면서 초기 JS 번들이 커졌다. 첫 페이지 로딩이 느리다.
- 모든 페이지 코드가 한 번에 다운로드된다.
- "code splitting이라는 걸 들었는데, 어떤 단위로 쪼개는가?"

**정신 모델:**
```
번들 크기 → TTI(Time to Interactive)에 직결
route split: 페이지별 청크 (Next.js가 자동)
component split: 무거운 컴포넌트 → dynamic import
preload/prefetch: 다음 페이지 미리 로드
```

**최소 코드:**
```typescript
import dynamic from 'next/dynamic'

// 무거운 차트 라이브러리 — 필요할 때만 로드
const HeavyChart = dynamic(
  () => import('@/components/HeavyChart'),
  {
    loading: () => <div className="h-64 bg-gray-100 animate-pulse" />,
    ssr: false,  // 클라이언트 전용 라이브러리
  }
)

function Dashboard() {
  const [showChart, setShowChart] = useState(false)
  return (
    <>
      <button onClick={() => setShowChart(true)}>차트 보기</button>
      {showChart && <HeavyChart />}
    </>
  )
}
```

**망하는 패턴:**
1. 작은 컴포넌트에 dynamic import → 청크 요청 오버헤드가 더 크다
2. ssr: false 남용 → SEO/SSR이 필요한 컴포넌트까지 클라이언트 전용
3. prefetch 없는 SPA → 페이지 이동 시마다 waterfall

**마스터 체크:**
1. Next.js에서 route-level split이 자동으로 되는 이유는 무엇인가?
2. dynamic import에서 loading 컴포넌트가 없으면 어떻게 되는가?
3. LCP와 코드 분할의 관계는 무엇인가?

- [ ] **Step 1: 파일 재작성** (seriesOrder 수정 + 공통 구조로 재작성, 400줄 이상)
- [ ] **Step 2: prettier 포맷**
  ```bash
  npx prettier@latest --write content/2025-10-06-react-performance-02-code-splitting.mdx
  ```
- [ ] **Step 3: 커밋**
  ```bash
  git add content/2025-10-06-react-performance-02-code-splitting.mdx
  git commit -m "content(perf): 성능 03 코드 분할 재작성 - seriesOrder 3"
  ```

---

## Task 10: React 성능 04 재작성 (대형 UI, seriesOrder → 4)

**Files:**
- Modify: `content/2025-10-05-react-performance-03-advanced-patterns.mdx`

```
frontmatter 변경:
  title: "[React 성능 4/5] 대형 UI — 가상화와 입력 반응성"
  description: "1000개 아이템 리스트, 드래그, 검색 실시간 필터에서 INP를 잡는 방법"
  seriesOrder: 4
```

**핵심 변경:** Concurrent React 내용을 제거하고 가상화/INP에만 집중. Concurrent는 Task 11로.

**오늘 풀 문제:**
- 상품 목록 1000개를 렌더하니 초기 페인트가 느리다.
- 검색 입력할 때마다 목록이 필터링되며 버벅인다.
- 드래그 중 다른 인터랙션이 블로킹된다.

**정신 모델:**
```
가상화: DOM 노드를 뷰포트 안의 것만 유지
        스크롤 = 재렌더 비용은 있으나 DOM 노드 수 고정
INP: Long Task(50ms+)를 쪼개면 입력 반응성 향상
     yield: scheduler.yield() 또는 setTimeout(0)
```

**최소 코드 — 가상화:**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'

function ProductList({ items }: { items: Product[] }) {
  const parentRef = useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  })

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: rowVirtualizer.getTotalSize() }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtualRow.start}px)`,
              height: `${virtualRow.size}px`,
            }}
          >
            <ProductCard product={items[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

**실무 코드 — INP 개선:**
```typescript
import { useState, useCallback } from 'react'

function SearchableList({ items }: { items: Product[] }) {
  const [query, setQuery] = useState('')
  const [filtered, setFiltered] = useState(items)

  const handleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)  // 즉시 입력 업데이트 (INP 유지)

    // 무거운 필터링은 비동기로 분리
    await Promise.resolve()  // yield to browser
    setFiltered(items.filter(p =>
      p.name.toLowerCase().includes(value.toLowerCase())
    ))
  }, [items])

  return (
    <>
      <input value={query} onChange={handleChange} />
      <ProductList items={filtered} />
    </>
  )
}
```

**망하는 패턴:**
1. 가상화 없이 1000개 DOM 렌더 → 초기 페인트 느림
2. input onChange에서 동기 필터링 → Long Task → INP 악화
3. overscan 너무 크게 → 가상화 이점 상쇄

**마스터 체크:**
1. 가상화가 초기 렌더를 빠르게 하는 원리는 무엇인가?
2. INP와 FID(First Input Delay)의 차이는 무엇인가?
3. Long Task를 쪼개는 방법 두 가지는 무엇인가?

- [ ] **Step 1: 파일 재작성** (400줄, Concurrent 내용 제거)
- [ ] **Step 2: prettier 포맷**
  ```bash
  npx prettier@latest --write content/2025-10-05-react-performance-03-advanced-patterns.mdx
  ```
- [ ] **Step 3: 커밋**
  ```bash
  git add content/2025-10-05-react-performance-03-advanced-patterns.mdx
  git commit -m "content(perf): 성능 04 대형 UI 재작성 - 가상화/INP 집중"
  ```

---

## Task 11: React 성능 05 신규 작성 (Concurrent React) [사용자 리뷰 필요]

**Files:**
- Create: `content/2025-10-07-react-performance-05-concurrent.mdx`

```
frontmatter:
  title: "[React 성능 5/5] Concurrent React — 중요한 업데이트를 먼저 보여준다"
  date: "2025-10-07"
  description: "useTransition, useDeferredValue, Suspense로 UI 우선순위를 제어하는 방법"
  tags: ["React", "성능", "고급", "프론트엔드"]
  series: "React 성능"
  seriesOrder: 5
```

**오늘 풀 문제:**
- 검색창에 타이핑하면 결과 목록이 갱신되면서 입력 커서가 버벅인다.
- 탭을 클릭하면 무거운 콘텐츠를 로드하다가 현재 화면이 사라진다.
- "빠르게 만드는 것"이 아니라 "중요한 업데이트를 먼저 보여주는 것"이 목표다.

**정신 모델:**
```
React는 기본적으로 모든 setState가 동등한 우선순위다.
Concurrent 모드는 업데이트를 두 종류로 나눈다:
  Urgent: 타이핑, 클릭 — 즉시 반응해야 한다
  Transition: 탭 전환, 검색 결과 — 잠시 기다려도 된다

useTransition: Transition 업데이트를 표시 (isPending)
useDeferredValue: 값의 업데이트를 뒤로 미룬다
```

**최소 코드:**
```typescript
import { useTransition, useDeferredValue, useState } from 'react'

// useTransition: 탭 전환 — 탭은 즉시, 콘텐츠는 ready 후
function TabPanel() {
  const [tab, setTab] = useState('profile')
  const [isPending, startTransition] = useTransition()

  function selectTab(next: string) {
    startTransition(() => {
      setTab(next)  // 이 setState는 Urgent 업데이트를 막지 않는다
    })
  }

  return (
    <>
      <button onClick={() => selectTab('profile')}>Profile</button>
      <button onClick={() => selectTab('posts')}>Posts</button>
      {isPending && <Spinner />}
      <TabContent tab={tab} />
    </>
  )
}
```

```typescript
// useDeferredValue: 검색 — 입력은 즉시, 필터링은 deferral
function SearchPanel() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const isStale = query !== deferredQuery

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <div style={{ opacity: isStale ? 0.5 : 1 }}>
        {/* deferredQuery로 렌더 — query보다 한 박자 늦게 업데이트 */}
        <SearchResults query={deferredQuery} />
      </div>
    </>
  )
}
```

**망하는 패턴:**
1. 모든 setState를 startTransition으로 감싸기 → Urgent 업데이트가 지연됨
2. useTransition 없이 긴 렌더 — 타이핑이 버벅임
3. useDeferredValue와 useTransition 혼용 — 역할이 다르다 (값 vs 업데이트 표시)

**Vue 비교:**
- Vue에는 Concurrent와 직접 대응하는 개념이 없다
- v-memo, shallowRef로 부분적 렌더 최적화
- 전체 업데이트 우선순위 제어는 React의 차별점

**마스터 체크:**
1. useTransition과 useDeferredValue의 역할 차이는 무엇인가?
2. startTransition 안에서 사용자 입력 setState를 하면 어떻게 되는가?
3. isPending을 언제 UI에 표시해야 하는가?

> **⚠️ 사용자 리뷰 필요:** 이 파일 작성 후 사용자가 Concurrent 내용을 리뷰한다.

- [ ] **Step 1: 파일 작성** (400줄 이상)
- [ ] **Step 2: prettier 포맷**
  ```bash
  npx prettier@latest --write content/2025-10-07-react-performance-05-concurrent.mdx
  ```
- [ ] **Step 3: 커밋 (초안)**
  ```bash
  git add content/2025-10-07-react-performance-05-concurrent.mdx
  git commit -m "content(perf): 성능 05 Concurrent React 초안 (리뷰 필요)"
  ```
- [ ] **Step 4: 사용자에게 리뷰 요청**

---

## Task 12: 최종 검증

- [ ] **Step 1: TypeScript 타입 체크**
  ```bash
  npx tsc --noEmit
  ```
  Expected: 오류 없음 (MDX 파일은 타입 체크 대상 아님, tsconfig 확인)

- [ ] **Step 2: 전체 빌드**
  ```bash
  npm run build
  ```
  Expected: 빌드 성공, 새 MDX 파일 처리됨

- [ ] **Step 3: 포맷 최종 확인**
  ```bash
  git diff --check
  ```

---

## 자기 검토 (Spec Coverage)

| 요구사항 | 담당 Task |
|---------|-----------|
| 03-00 상태 관리 intro (4가지 분류) | Task 1 |
| Zustand (Provider 없는 전역, selector 구독) | Task 2 |
| Redux Toolkit (추적/규칙, createSelector) | Task 3 |
| Jotai (derived/async/write atom) | Task 4 |
| 선택 프레임 (시나리오별 의사결정) | Task 5 |
| E-Commerce 실전 설계 | Task 6 |
| 성능 01 측정 전용 | Task 7 |
| 성능 02 렌더링 비용 (memo/useMemo/useCallback) | Task 8 |
| 성능 03 코드 분할 (seriesOrder 3) | Task 9 |
| 성능 04 가상화/INP (Concurrent 제거) | Task 10 |
| 성능 05 Concurrent React (사용자 리뷰) | Task 11 |
| 최종 빌드/검증 | Task 12 |
| 공통 구조 7단계 + ~한다/~된다 체 | 전 Tasks |
| TypeScript + import 포함 코드 예제 | 전 Tasks |
| Vue/Nuxt 비교 | 전 Tasks |
| 마스터 체크 | 전 Tasks |
