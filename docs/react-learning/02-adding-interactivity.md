# React 학습 가이드 - 상호작용 추가하기 (Adding Interactivity)

> React 공식 문서를 기반으로 한 학습 자료  
> 원문: [Adding Interactivity - React](https://react.dev/learn/adding-interactivity)

---

## 📚 목차

1. [개요](#개요)
2. [이벤트에 응답하기](#이벤트에-응답하기)
3. [State: 컴포넌트의 메모리](#state-컴포넌트의-메모리)
4. [렌더와 커밋](#렌더와-커밋)
5. [스냅샷으로서의 State](#스냅샷으로서의-state)
6. [State 업데이트 큐](#state-업데이트-큐)
7. [객체 State 업데이트하기](#객체-state-업데이트하기)
8. [배열 State 업데이트하기](#배열-state-업데이트하기)

---

## 개요

화면의 일부 요소는 **사용자 입력에 응답하여 업데이트**됩니다.

**예시:**

- 이미지 갤러리에서 사진 클릭 → 활성 이미지 변경
- 검색 상자에 입력 → 검색 결과 업데이트
- "구매" 버튼 클릭 → 장바구니에 상품 추가

React에서는 시간에 따라 변하는 데이터를 **state**라고 부릅니다.

### 이 챕터에서 배울 내용

- ✅ 사용자 이벤트 처리 방법
- ✅ State로 컴포넌트에 정보 기억시키기
- ✅ React가 UI를 업데이트하는 2단계 (렌더링 & 커밋)
- ✅ State 변경 직후 업데이트되지 않는 이유
- ✅ 여러 State 업데이트를 큐에 넣는 방법
- ✅ State에서 객체를 업데이트하는 방법
- ✅ State에서 배열을 업데이트하는 방법

---

## 이벤트에 응답하기

### 이벤트 핸들러란?

React에서는 JSX에 **이벤트 핸들러**를 추가하여 사용자 상호작용에 응답할 수 있습니다.

**이벤트 핸들러**는 다음과 같은 사용자 동작에 응답하는 함수입니다:

- 클릭
- 호버 (마우스 올리기)
- 폼 입력에 포커스
- 키보드 입력 등

### 기본 사용법

```jsx
export default function Button() {
  function handleClick() {
    alert('버튼을 클릭했습니다!');
  }

  return (
    <button onClick={handleClick}>
      클릭하세요
    </button>
  );
}
```

**핵심 포인트:**

1. `handleClick` 함수 정의
2. `onClick={handleClick}`으로 전달
3. ⚠️ `onClick={handleClick()}` ❌ - 함수를 호출하지 마세요!

### 이벤트 핸들러 작성 패턴

#### 1. **컴포넌트 내부에서 정의 (권장)**

```jsx
function Button() {
  function handleClick() {
    alert('클릭됨!');
  }
  
  return <button onClick={handleClick}>클릭</button>;
}
```

#### 2. **인라인으로 정의**

```jsx
function Button() {
  return (
    <button onClick={function handleClick() {
      alert('클릭됨!');
    }}>
      클릭
    </button>
  );
}
```

#### 3. **화살표 함수 (간단한 경우)**

```jsx
function Button() {
  return (
    <button onClick={() => {
      alert('클릭됨!');
    }}>
      클릭
    </button>
  );
}
```

#### 4. **한 줄 인라인**

```jsx
<button onClick={() => alert('클릭됨!')}>클릭</button>
```

### ⚠️ 일반적인 실수

```jsx
// ❌ 함수를 호출함 (즉시 실행됨!)
<button onClick={handleClick()}>

// ✅ 함수를 전달함 (클릭 시 실행됨)
<button onClick={handleClick}>

// ❌ 화살표 함수 없이 호출
<button onClick={alert('클릭됨!')}>

// ✅ 화살표 함수로 감싸기
<button onClick={() => alert('클릭됨!')}>
```

### 이벤트 핸들러에서 Props 읽기

이벤트 핸들러는 컴포넌트 내부에 정의되므로 props에 접근할 수 있습니다.

```jsx
function AlertButton({ message, children }) {
  return (
    <button onClick={() => alert(message)}>
      {children}
    </button>
  );
}

export default function Toolbar() {
  return (
    <div>
      <AlertButton message="영상을 재생합니다!">
        영상 재생
      </AlertButton>
      <AlertButton message="이미지를 업로드합니다!">
        이미지 업로드
      </AlertButton>
    </div>
  );
}
```

### 이벤트 핸들러를 Props로 전달하기

부모 컴포넌트가 자식의 이벤트 핸들러를 지정하고 싶을 때 유용합니다.

```jsx
function Button({ onClick, children }) {
  return (
    <button onClick={onClick}>
      {children}
    </button>
  );
}

function PlayButton({ movieName }) {
  function handlePlayClick() {
    alert(`${movieName} 재생 중!`);
  }

  return (
    <Button onClick={handlePlayClick}>
      "{movieName}" 재생
    </Button>
  );
}

export default function Toolbar() {
  return (
    <div>
      <PlayButton movieName="기생충" />
      <PlayButton movieName="오징어 게임" />
    </div>
  );
}
```

**디자인 시스템에서 흔한 패턴:**

- `Button` 같은 컴포넌트는 스타일만 정의
- 실제 동작은 부모 컴포넌트에서 `onClick` prop으로 전달

### 이벤트 핸들러 Props 명명 규칙

**관례적으로 `on`으로 시작:**

```jsx
function Button({ onSmash, children }) {
  return (
    <button onClick={onSmash}>
      {children}
    </button>
  );
}

export default function App() {
  return (
    <div>
      <Button onSmash={() => alert('영상 재생!')}>
        영상 재생
      </Button>
      <Button onSmash={() => alert('이미지 업로드!')}>
        이미지 업로드
      </Button>
    </div>
  );
}
```

**명명 규칙:**

- 이벤트 핸들러 prop: `onSmash`, `onClick`, `onPlayVideo` 등
- 핸들러 함수: `handleSmash`, `handleClick`, `handlePlayVideo` 등

### 이벤트 전파 (Event Propagation)

이벤트 핸들러는 **자식 컴포넌트의 이벤트도 포착**합니다. 이를 "버블링" 또는 "전파"라고 합니다.

```jsx
export default function Toolbar() {
  return (
    <div
      className="Toolbar"
      onClick={() => {
        alert('툴바를 클릭했습니다!');
      }}
    >
      <button onClick={() => alert('영상 재생!')}>
        영상 재생
      </button>
      <button onClick={() => alert('이미지 업로드!')}>
        이미지 업로드
      </button>
    </div>
  );
}
```

**동작:**

1. 버튼 클릭 → 버튼의 `onClick` 실행
2. 부모 `<div>`의 `onClick` 실행 (전파!)

### 이벤트 전파 중단하기

```jsx
function Button({ onClick, children }) {
  return (
    <button onClick={e => {
      e.stopPropagation();  // 전파 중단!
      onClick();
    }}>
      {children}
    </button>
  );
}

export default function Toolbar() {
  return (
    <div className="Toolbar" onClick={() => alert('툴바 클릭!')}>
      <Button onClick={() => alert('영상 재생!')}>
        영상 재생
      </Button>
      <Button onClick={() => alert('이미지 업로드!')}>
        이미지 업로드
      </Button>
    </div>
  );
}
```

**이제 버튼 클릭 시 부모의 `onClick`은 실행되지 않습니다.**

### 기본 동작 방지하기

일부 브라우저 이벤트는 기본 동작이 있습니다. `e.preventDefault()`로 방지할 수 있습니다.

```jsx
export default function Signup() {
  return (
    <form onSubmit={e => {
      e.preventDefault();  // 페이지 새로고침 방지!
      alert('제출되었습니다!');
    }}>
      <input />
      <button>전송</button>
    </form>
  );
}
```

**`stopPropagation()` vs `preventDefault()`**

| 메서드 | 설명 |
|--------|------|
| `e.stopPropagation()` | 상위 핸들러 실행 중단 |
| `e.preventDefault()` | 기본 브라우저 동작 방지 |

### 이벤트 핸들러에서 부작용 처리 가능

이벤트 핸들러는 **순수할 필요가 없습니다!** 부작용을 일으키기에 가장 좋은 곳입니다.

**예시:**

- 입력 필드 값 변경
- 버튼 클릭으로 리스트 변경
- API 호출

### Vue와 비교

```html
<!-- Vue: @ 또는 v-on -->
<template>
  <button @click="handleClick">클릭</button>
  <button v-on:click="handleClick">클릭</button>
</template>

<script setup>
function handleClick() {
  alert('클릭됨!')
}
</script>
```

```jsx
// React: onClick
function Button() {
  function handleClick() {
    alert('클릭됨!')
  }
  
  return <button onClick={handleClick}>클릭</button>
}
```

**차이점:**

- Vue: `@click` (kebab-case)
- React: `onClick` (camelCase)

---

## State: 컴포넌트의 메모리

### 일반 변수로는 충분하지 않은 이유

```jsx
// ❌ 작동하지 않음!
import { sculptureList } from './data.js';

export default function Gallery() {
  let index = 0;  // 일반 변수

  function handleClick() {
    index = index + 1;  // 변경되지만 리렌더링 안됨!
  }

  let sculpture = sculptureList[index];
  return (
    <>
      <button onClick={handleClick}>다음</button>
      <h2>{sculpture.name}</h2>
      <img src={sculpture.url} alt={sculpture.name} />
    </>
  );
}
```

**작동하지 않는 이유:**

1. **로컬 변수는 렌더링 간에 유지되지 않음** - React가 컴포넌트를 두 번째로 렌더링할 때 처음부터 다시 렌더링함 (변수 변경 무시)
2. **로컬 변수 변경은 렌더링을 트리거하지 않음** - React는 새 데이터로 컴포넌트를 다시 렌더링해야 한다는 것을 모름

### 컴포넌트를 업데이트하려면

1. 렌더링 간에 데이터 **유지**
2. 새 데이터로 컴포넌트 **리렌더링** 트리거

`useState` Hook이 이 두 가지를 제공합니다:

- **State 변수**: 렌더링 간 데이터 유지
- **State setter 함수**: 변수를 업데이트하고 리렌더링 트리거

### useState Hook 사용하기

```jsx
import { useState } from 'react';
import { sculptureList } from './data.js';

export default function Gallery() {
  const [index, setIndex] = useState(0);  // State!

  function handleClick() {
    setIndex(index + 1);  // State 업데이트 → 리렌더링!
  }

  let sculpture = sculptureList[index];
  return (
    <>
      <button onClick={handleClick}>다음</button>
      <h2>{sculpture.name}</h2>
      <img src={sculpture.url} alt={sculpture.name} />
    </>
  );
}
```

### useState 해부하기

```jsx
const [index, setIndex] = useState(0);
```

**구성 요소:**

- `index`: 현재 state 값
- `setIndex`: state를 업데이트하는 함수
- `useState(0)`: 초기값은 `0`

**명명 규칙:**

```jsx
const [something, setSomething] = useState(initialValue);
```

### Hook이란?

**Hook**은 `use`로 시작하는 특별한 함수입니다.

**Hook의 규칙:**

1. **컴포넌트 최상위에서만 호출** (조건문, 반복문 내부 ❌)
2. **React 함수 컴포넌트 또는 커스텀 Hook에서만 호출**

```jsx
// ✅ 올바른 사용
function MyComponent() {
  const [state, setState] = useState(0);
  // ...
}

// ❌ 잘못된 사용
function MyComponent() {
  if (condition) {
    const [state, setState] = useState(0);  // 조건부 Hook ❌
  }
}
```

### 여러 State 변수 사용하기

```jsx
import { useState } from 'react';
import { sculptureList } from './data.js';

export default function Gallery() {
  const [index, setIndex] = useState(0);
  const [showMore, setShowMore] = useState(false);

  function handleNextClick() {
    setIndex(index + 1);
  }

  function handleMoreClick() {
    setShowMore(!showMore);
  }

  let sculpture = sculptureList[index];
  return (
    <>
      <button onClick={handleNextClick}>다음</button>
      <h2>{sculpture.name}</h2>
      <button onClick={handleMoreClick}>
        {showMore ? '숨기기' : '상세 정보'}
      </button>
      {showMore && <p>{sculpture.description}</p>}
      <img src={sculpture.url} alt={sculpture.name} />
    </>
  );
}
```

**State 변수가 서로 관련 없으면 분리하는 것이 좋습니다.**

### State는 격리되고 비공개입니다

State는 **컴포넌트 인스턴스마다 로컬**입니다.

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}

export default function App() {
  return (
    <div>
      <Counter />  {/* 독립적인 state */}
      <Counter />  {/* 독립적인 state */}
    </div>
  );
}
```

**각 `Counter`는 자신만의 `count` state를 가집니다.**

### Vue와 비교

```html
<!-- Vue: ref() -->
<script setup>
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}
</script>

<template>
  <button @click="increment">{{ count }}</button>
</template>
```

```jsx
// React: useState()
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  
  function increment() {
    setCount(count + 1)
  }
  
  return <button onClick={increment}>{count}</button>
}
```

**차이점:**

- Vue: `count.value`로 접근/변경
- React: `count` (읽기), `setCount(newValue)` (쓰기)

---

## 렌더와 커밋

### React의 UI 업데이트 3단계

컴포넌트가 화면에 표시되기까지 3단계를 거칩니다:

```
1. 트리거 (Trigger)
   ↓
2. 렌더 (Render)
   ↓
3. 커밋 (Commit)
```

**레스토랑 비유:**

1. **트리거**: 손님 주문을 주방으로 전달
2. **렌더**: 주방에서 음식 준비
3. **커밋**: 테이블에 음식 제공

### 1단계: 렌더 트리거

렌더링이 일어나는 두 가지 이유:

#### (1) 초기 렌더

```jsx
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root'));
root.render(<App />);  // 초기 렌더 트리거!
```

#### (2) State 업데이트

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}
```

`setCount()` 호출 → 리렌더링 트리거!

### 2단계: 컴포넌트 렌더

**"렌더링"** = React가 컴포넌트(함수)를 호출하는 것

- **초기 렌더**: 루트 컴포넌트 호출
- **이후 렌더**: state 업데이트가 트리거한 컴포넌트 호출

**재귀적 프로세스:**

1. 업데이트된 컴포넌트를 호출
2. 해당 컴포넌트가 다른 컴포넌트를 반환하면 다음 렌더링
3. 중첩된 컴포넌트가 없을 때까지 반복

### 예제: 렌더링 과정

```jsx
export default function Gallery() {
  return (
    <section>
      <h1>Inspiring Sculptures</h1>
      <Image />
      <Image />
      <Image />
    </section>
  );
}

function Image() {
  return (
    <img
      src="https://i.imgur.com/ZF6s192.jpg"
      alt="Photo"
    />
  );
}
```

**초기 렌더:**

1. React가 `Gallery()` 호출
2. `<section>`, `<h1>`, `<Image />` 발견
3. React가 `Image()` 호출 (3번)
4. React가 `<img>` 태그 기록

**이후 렌더:** (state 업데이트 시)

- React가 이전 렌더와 비교하여 변경 사항 계산

### 3단계: DOM에 변경사항 커밋

컴포넌트를 렌더링(호출)한 후, React는 DOM을 수정합니다.

- **초기 렌더**: `appendChild()` DOM API로 노드 생성
- **리렌더링**: 변경된 부분만 DOM에 적용 (최소한의 작업!)

**중요:** React는 렌더링 간에 차이가 있을 때만 DOM 노드를 변경합니다.

### 예제: 변경 없으면 DOM 업데이트 안함

```jsx
export default function Clock({ time }) {
  return (
    <>
      <h1>{time}</h1>
      <input />
    </>
  );
}
```

```jsx
// 매초 리렌더링
setInterval(() => {
  root.render(<Clock time={new Date().toLocaleTimeString()} />);
}, 1000);
```

**결과:**

- `<h1>`만 업데이트됨 (시간 변경)
- `<input>`은 업데이트 안됨 (props/state 변경 없음)
- 입력 중인 텍스트 유지됨!

### 브라우저 페인팅

렌더링 완료 후 DOM 업데이트되면, 브라우저가 화면을 다시 그립니다.

**용어 구분:**

- **"렌더링"** (React): 컴포넌트 호출
- **"페인팅"** (브라우저): 화면에 그리기

### Vue와 비교

Vue도 유사한 가상 DOM (Virtual DOM) 방식을 사용합니다:

1. **반응성 트리거**: `ref.value` 변경
2. **가상 DOM Diff**: 이전/새 가상 DOM 비교
3. **실제 DOM 패치**: 변경사항만 적용

---

## 스냅샷으로서의 State

### State는 스냅샷처럼 동작합니다

```jsx
import { useState } from 'react';

export default function Counter() {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button onClick={() => {
        setNumber(number + 1);
        setNumber(number + 1);
        setNumber(number + 1);
      }}>+3</button>
    </>
  );
}
```

**예상:** 버튼 클릭 → `number`가 3 증가?  
**실제:** `number`가 1만 증가!

### 왜 이런 일이 발생하나?

**State는 스냅샷처럼 동작합니다.**

```jsx
<button onClick={() => {
  setNumber(number + 1);  // setNumber(0 + 1)
  setNumber(number + 1);  // setNumber(0 + 1)
  setNumber(number + 1);  // setNumber(0 + 1)
}}>+3</button>
```

`number`는 렌더링 시점에 `0`이므로, 세 번 모두 `setNumber(1)`을 호출합니다!

### 렌더링 시점의 State는 고정됨

```jsx
import { useState } from 'react';

export default function Counter() {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button onClick={() => {
        setNumber(number + 5);
        alert(number);  // 여전히 0!
      }}>+5</button>
    </>
  );
}
```

**`alert(number)`는 `0`을 표시합니다!**

`setNumber(number + 5)`를 호출해도, 해당 렌더링의 `number`는 여전히 `0`입니다.

### 시간에 따른 State

```jsx
import { useState } from 'react';

export default function Counter() {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button onClick={() => {
        setNumber(number + 5);
        setTimeout(() => {
          alert(number);  // 3초 후에도 0!
        }, 3000);
      }}>+5</button>
    </>
  );
}
```

**버튼 클릭 → 3초 대기 → alert는 `0` 표시**

React는 이벤트 핸들러가 실행될 때의 state 값을 "고정"합니다.

### State 업데이트 스케줄링

`setNumber(number + 5)`는 다음을 요청합니다:

1. `number`를 `0 + 5`로 설정
2. 리렌더링 스케줄

**즉각 업데이트되지 않습니다!**

### 실전 예제: 클릭 추적

```jsx
import { useState } from 'react';

export default function TrafficLight() {
  const [walk, setWalk] = useState(true);

  function handleClick() {
    setWalk(!walk);
    alert(walk ? '정지 다음입니다' : '걷기 다음입니다');
  }

  return (
    <>
      <button onClick={handleClick}>
        신호 변경
      </button>
      <h1 style={{
        color: walk ? 'darkgreen' : 'darkred'
      }}>
        {walk ? '걷기' : '정지'}
      </h1>
    </>
  );
}
```

**'걷기' 상태에서 버튼 클릭:**

1. `setWalk(false)` 호출 (다음 렌더링을 '정지'로 스케줄)
2. `alert(walk ? ...)` 실행 → `walk`는 여전히 `true`
3. "정지 다음입니다" 표시 (올바름!)

### Vue와 비교

```html
<script setup>
import { ref, nextTick } from 'vue'

const count = ref(0)

async function increment() {
  count.value++
  console.log(count.value)  // 1 (즉시 반영!)
  
  await nextTick()
  // DOM 업데이트 완료
}
</script>
```

```jsx
// React
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  
  function increment() {
    setCount(count + 1)
    console.log(count)  // 0 (스냅샷!)
  }
  
  return <button onClick={increment}>{count}</button>
}
```

**차이점:**

- Vue: `ref.value` 변경 시 즉시 반영 (반응형)
- React: State는 다음 렌더링까지 변경 안됨 (스냅샷)

---

## State 업데이트 큐

### 한 이벤트에서 여러 State 업데이트

```jsx
import { useState } from 'react';

export default function Counter() {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button onClick={() => {
        setNumber(number + 1);
        setNumber(number + 1);
        setNumber(number + 1);
      }}>+3</button>
    </>
  );
}
```

**결과:** `number`는 1만 증가 (3이 아님!)

**이유:** 각 렌더링의 state 값은 고정되어 있기 때문

```jsx
setNumber(0 + 1);  // setNumber(1)
setNumber(0 + 1);  // setNumber(1)
setNumber(0 + 1);  // setNumber(1)
```

### 다음 렌더링 전에 여러 번 업데이트하기

**업데이터 함수 (Updater Function)**를 전달하세요:

```jsx
import { useState } from 'react';

export default function Counter() {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button onClick={() => {
        setNumber(n => n + 1);
        setNumber(n => n + 1);
        setNumber(n => n + 1);
      }}>+3</button>
    </>
  );
}
```

**이제 `number`는 3 증가합니다!**

### 업데이터 함수란?

```jsx
setNumber(n => n + 1);
```

- `n => n + 1`: **업데이터 함수**
- `n`: 이전 state 값
- 반환값: 다음 state 값

**React의 처리 방식:**

1. `n => n + 1` 함수를 큐에 추가
2. `n => n + 1` 함수를 큐에 추가
3. `n => n + 1` 함수를 큐에 추가
4. 다음 렌더링 시 큐를 순차적으로 실행

**실행 순서:**

| 큐에 추가된 업데이트 | `n` | 반환값 |
|------------------|-----|--------|
| `n => n + 1` | `0` | `0 + 1 = 1` |
| `n => n + 1` | `1` | `1 + 1 = 2` |
| `n => n + 1` | `2` | `2 + 1 = 3` |

최종 결과: `number = 3`

### 업데이트 값과 업데이터 함수 혼합

```jsx
<button onClick={() => {
  setNumber(number + 5);      // 0 + 5 = 5로 설정
  setNumber(n => n + 1);      // 5 + 1 = 6
  setNumber(42);              // 42로 설정
}}>
```

**실행 순서:**

| 큐에 추가된 업데이트 | `n` | 반환값 |
|------------------|-----|--------|
| "5로 대체" | `0` (미사용) | `5` |
| `n => n + 1` | `5` | `5 + 1 = 6` |
| "42로 대체" | `6` (미사용) | `42` |

최종 결과: `number = 42`

### 명명 규칙

업데이터 함수 매개변수는 state 변수의 **첫 글자**로 명명하는 것이 관례입니다:

```jsx
setEnabled(e => !e);
setLastName(ln => ln.reverse());
setFriendCount(fc => fc * 2);
```

또는 전체 이름 반복:

```jsx
setEnabled(enabled => !enabled);
setLastName(lastName => lastName.reverse());
```

### 실전 예제: 복잡한 State 업데이트

```jsx
import { useState } from 'react';

export default function RequestTracker() {
  const [pending, setPending] = useState(0);
  const [completed, setCompleted] = useState(0);

  async function handleClick() {
    setPending(p => p + 1);
    await delay(3000);
    setPending(p => p - 1);
    setCompleted(c => c + 1);
  }

  return (
    <>
      <h3>대기중: {pending}</h3>
      <h3>완료됨: {completed}</h3>
      <button onClick={handleClick}>
        구매
      </button>
    </>
  );
}

function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
```

**빠르게 3번 클릭 시:**

1. `pending`: 0 → 1 → 2 → 3
2. 3초 후
3. `pending`: 3 → 2 → 1 → 0
4. `completed`: 0 → 1 → 2 → 3

### Vue와 비교

Vue는 자동으로 배치 업데이트를 처리하므로 명시적인 업데이터 함수가 필요 없습니다:

```html
<script setup>
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++  // 자동으로 큐에 추가
  count.value++
  count.value++
  // 3 증가
}
</script>
```

---

## 객체 State 업데이트하기

### State는 불변으로 취급하세요

**잘못된 방법:**

```jsx
const [position, setPosition] = useState({ x: 0, y: 0 });

// ❌ 직접 수정 (돌연변이)
position.x = 5;
```

기술적으로는 가능하지만, **React는 이 변경을 감지하지 못합니다!**

**올바른 방법:**

```jsx
// ✅ 새 객체 생성
setPosition({
  x: 5,
  y: 0
});
```

### 예제: 폼 입력

```jsx
import { useState } from 'react';

export default function Form() {
  const [person, setPerson] = useState({
    firstName: 'Barbara',
    lastName: 'Hepworth',
    email: 'bhepworth@sculpture.com'
  });

  function handleFirstNameChange(e) {
    setPerson({
      ...person,            // 기존 필드 복사
      firstName: e.target.value  // firstName만 업데이트
    });
  }

  function handleLastNameChange(e) {
    setPerson({
      ...person,
      lastName: e.target.value
    });
  }

  function handleEmailChange(e) {
    setPerson({
      ...person,
      email: e.target.value
    });
  }

  return (
    <>
      <label>
        First name:
        <input
          value={person.firstName}
          onChange={handleFirstNameChange}
        />
      </label>
      <label>
        Last name:
        <input
          value={person.lastName}
          onChange={handleLastNameChange}
        />
      </label>
      <label>
        Email:
        <input
          value={person.email}
          onChange={handleEmailChange}
        />
      </label>
      <p>
        {person.firstName}{' '}
        {person.lastName}{' '}
        ({person.email})
      </p>
    </>
  );
}
```

### Spread 문법 `...` 사용하기

**Spread 문법**은 객체를 복사할 때 유용합니다:

```jsx
setPerson({
  ...person,       // 모든 기존 필드 복사
  firstName: 'Kim' // firstName만 덮어쓰기
});
```

**동작 원리:**

```jsx
// 이전
{ firstName: 'Barbara', lastName: 'Hepworth', email: 'bhepworth@sculpture.com' }

// Spread 후
{ firstName: 'Kim', lastName: 'Hepworth', email: 'bhepworth@sculpture.com' }
```

### 단일 이벤트 핸들러로 여러 필드 처리

```jsx
import { useState } from 'react';

export default function Form() {
  const [person, setPerson] = useState({
    firstName: 'Barbara',
    lastName: 'Hepworth',
    email: 'bhepworth@sculpture.com'
  });

  function handleChange(e) {
    setPerson({
      ...person,
      [e.target.name]: e.target.value  // 계산된 속성명
    });
  }

  return (
    <>
      <label>
        First name:
        <input
          name="firstName"
          value={person.firstName}
          onChange={handleChange}
        />
      </label>
      <label>
        Last name:
        <input
          name="lastName"
          value={person.lastName}
          onChange={handleChange}
        />
      </label>
      <label>
        Email:
        <input
          name="email"
          value={person.email}
          onChange={handleChange}
        />
      </label>
      <p>
        {person.firstName}{' '}
        {person.lastName}{' '}
        ({person.email})
      </p>
    </>
  );
}
```

**`[e.target.name]`** - 계산된 속성명 사용

### 중첩된 객체 업데이트

```jsx
const [person, setPerson] = useState({
  name: 'Niki de Saint Phalle',
  artwork: {
    title: 'Blue Nana',
    city: 'Hamburg',
    image: 'https://i.imgur.com/Sd1AgUOm.jpg',
  }
});
```

**`artwork.city` 업데이트:**

```jsx
// ❌ 돌연변이
person.artwork.city = 'New Delhi';

// ✅ 새 객체 생성
setPerson({
  ...person,
  artwork: {
    ...person.artwork,
    city: 'New Delhi'
  }
});
```

### Immer로 간결한 업데이트 로직

중첩된 객체 업데이트는 복잡해질 수 있습니다. **Immer** 라이브러리를 사용하면 간결하게 작성할 수 있습니다:

```bash
npm install use-immer
```

```jsx
import { useImmer } from 'use-immer';

export default function Form() {
  const [person, updatePerson] = useImmer({
    name: 'Niki de Saint Phalle',
    artwork: {
      title: 'Blue Nana',
      city: 'Hamburg',
      image: 'https://i.imgur.com/Sd1AgUOm.jpg',
    }
  });

  function handleCityChange(e) {
    updatePerson(draft => {
      draft.artwork.city = e.target.value;  // 직접 수정처럼 보임!
    });
  }

  // ...
}
```

**Immer는 내부적으로 불변 업데이트를 처리합니다.**

### Vue와 비교

```html
<script setup>
import { reactive } from 'vue'

const person = reactive({
  firstName: 'Barbara',
  lastName: 'Hepworth'
})

// ✅ Vue는 직접 수정 가능 (반응형)
person.firstName = 'Kim'
</script>
```

```jsx
// React: 불변 업데이트 필요
const [person, setPerson] = useState({
  firstName: 'Barbara',
  lastName: 'Hepworth'
})

// ❌ 직접 수정 불가
person.firstName = 'Kim'

// ✅ 새 객체 생성
setPerson({ ...person, firstName: 'Kim' })
```

---

## 배열 State 업데이트하기

### 배열도 불변으로 취급하세요

JavaScript에서 배열은 변경 가능하지만, state에 저장할 때는 **불변으로 취급**해야 합니다.

**피해야 할 메서드 (돌연변이):**

| 피하기 | 대신 사용 | 이유 |
|--------|----------|------|
| `push`, `unshift` | `concat`, `[...arr]` | 끝/시작에 추가 |
| `pop`, `shift`, `splice` | `filter`, `slice` | 제거 |
| `reverse`, `sort` | 배열 복사 후 사용 | 정렬/역순 |
| `arr[i] = ...` | `map` | 요소 대체 |

### 배열에 요소 추가하기

```jsx
import { useState } from 'react';

export default function List() {
  const [artists, setArtists] = useState([]);

  return (
    <>
      <h1>Inspiring sculptors:</h1>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <button onClick={() => {
        setArtists([
          ...artists,                    // 기존 배열 복사
          { id: nextId++, name: name }   // 새 요소 추가
        ]);
      }}>
        Add
      </button>
      <ul>
        {artists.map(artist => (
          <li key={artist.id}>{artist.name}</li>
        ))}
      </ul>
    </>
  );
}
```

**Spread 문법:**

- `[...artists, newItem]`: 끝에 추가
- `[newItem, ...artists]`: 시작에 추가

### 배열에서 요소 제거하기

```jsx
import { useState } from 'react';

const initialArtists = [
  { id: 0, name: 'Marta Colvin Andrade' },
  { id: 1, name: 'Lamidi Olonade Fakeye'},
  { id: 2, name: 'Louise Nevelson'},
];

export default function List() {
  const [artists, setArtists] = useState(initialArtists);

  return (
    <>
      <h1>Inspiring sculptors:</h1>
      <ul>
        {artists.map(artist => (
          <li key={artist.id}>
            {artist.name}{' '}
            <button onClick={() => {
              setArtists(
                artists.filter(a => a.id !== artist.id)
              );
            }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
```

**`filter()` 메서드:**

- 조건에 맞는 요소만 포함하는 새 배열 생성
- 원본 배열은 변경되지 않음

### 배열 변환하기

```jsx
import { useState } from 'react';

let initialShapes = [
  { id: 0, type: 'circle', x: 50, y: 100 },
  { id: 1, type: 'square', x: 150, y: 100 },
  { id: 2, type: 'circle', x: 250, y: 100 },
];

export default function ShapeEditor() {
  const [shapes, setShapes] = useState(initialShapes);

  function handleClick() {
    const nextShapes = shapes.map(shape => {
      if (shape.type === 'square') {
        return shape;  // 변경 안함
      } else {
        return {
          ...shape,
          y: shape.y + 50  // 아래로 50px 이동
        };
      }
    });
    setShapes(nextShapes);
  }

  return (
    <>
      <button onClick={handleClick}>
        Move circles down!
      </button>
      {shapes.map(shape => (
        <div
          key={shape.id}
          style={{
            background: 'purple',
            position: 'absolute',
            left: shape.x,
            top: shape.y,
            borderRadius: shape.type === 'circle' ? '50%' : '',
            width: 20,
            height: 20,
          }}
        />
      ))}
    </>
  );
}
```

### 배열의 특정 위치에 삽입하기

```jsx
import { useState } from 'react';

let nextId = 3;
const initialArtists = [
  { id: 0, name: 'Marta Colvin Andrade' },
  { id: 1, name: 'Lamidi Olonade Fakeye'},
  { id: 2, name: 'Louise Nevelson'},
];

export default function List() {
  const [name, setName] = useState('');
  const [artists, setArtists] = useState(initialArtists);

  function handleClick() {
    const insertAt = 1;  // 인덱스 1에 삽입
    const nextArtists = [
      ...artists.slice(0, insertAt),  // insertAt 이전 요소들
      { id: nextId++, name: name },   // 새 요소
      ...artists.slice(insertAt)      // insertAt 이후 요소들
    ];
    setArtists(nextArtists);
    setName('');
  }

  return (
    <>
      <h1>Inspiring sculptors:</h1>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <button onClick={handleClick}>
        Insert
      </button>
      <ul>
        {artists.map(artist => (
          <li key={artist.id}>{artist.name}</li>
        ))}
      </ul>
    </>
  );
}
```

### 배열 역순/정렬

```jsx
import { useState } from 'react';

const initialList = [
  { id: 0, title: 'Big Bellies' },
  { id: 1, title: 'Lunar Landscape' },
  { id: 2, title: 'Terracotta Army' },
];

export default function List() {
  const [list, setList] = useState(initialList);

  function handleReverse() {
    const nextList = [...list];  // 복사
    nextList.reverse();          // 복사본 변경
    setList(nextList);
  }

  function handleSort() {
    const nextList = [...list];
    nextList.sort((a, b) => a.title.localeCompare(b.title));
    setList(nextList);
  }

  return (
    <>
      <button onClick={handleReverse}>
        Reverse
      </button>
      <button onClick={handleSort}>
        Sort
      </button>
      <ul>
        {list.map(artwork => (
          <li key={artwork.id}>{artwork.title}</li>
        ))}
      </ul>
    </>
  );
}
```

**⚠️ 주의:**

- `reverse()`와 `sort()`는 원본 배열을 변경
- 먼저 배열을 복사한 후 사용해야 함

### 배열 내부 객체 업데이트

```jsx
import { useState } from 'react';

let nextId = 3;
const initialList = [
  { id: 0, title: 'Big Bellies', seen: false },
  { id: 1, title: 'Lunar Landscape', seen: false },
  { id: 2, title: 'Terracotta Army', seen: true },
];

export default function BucketList() {
  const [list, setList] = useState(initialList);

  function handleToggle(artworkId, nextSeen) {
    setList(list.map(artwork => {
      if (artwork.id === artworkId) {
        return { ...artwork, seen: nextSeen };  // 새 객체 생성
      } else {
        return artwork;
      }
    }));
  }

  return (
    <>
      <h1>Art Bucket List</h1>
      <h2>My list of art to see:</h2>
      <ItemList
        artworks={list}
        onToggle={handleToggle}
      />
    </>
  );
}

function ItemList({ artworks, onToggle }) {
  return (
    <ul>
      {artworks.map(artwork => (
        <li key={artwork.id}>
          <label>
            <input
              type="checkbox"
              checked={artwork.seen}
              onChange={e => {
                onToggle(
                  artwork.id,
                  e.target.checked
                );
              }}
            />
            {artwork.title}
          </label>
        </li>
      ))}
    </ul>
  );
}
```

### Immer로 간결한 배열 업데이트

```jsx
import { useState } from 'react';
import { useImmer } from 'use-immer';

let nextId = 3;
const initialList = [
  { id: 0, title: 'Big Bellies', seen: false },
  { id: 1, title: 'Lunar Landscape', seen: false },
  { id: 2, title: 'Terracotta Army', seen: true },
];

export default function BucketList() {
  const [list, updateList] = useImmer(initialList);

  function handleToggle(artworkId, nextSeen) {
    updateList(draft => {
      const artwork = draft.find(a => a.id === artworkId);
      artwork.seen = nextSeen;  // 직접 수정처럼 작성!
    });
  }

  return (
    <>
      <h1>Art Bucket List</h1>
      <ItemList
        artworks={list}
        onToggle={handleToggle}
      />
    </>
  );
}
```

### 배열 메서드 참조표

| 동작 | 피하기 (돌연변이) | 권장 (새 배열 반환) |
|------|----------------|------------------|
| 추가 | `push`, `unshift` | `concat`, `[...arr]` spread |
| 제거 | `pop`, `shift`, `splice` | `filter`, `slice` |
| 교체 | `splice`, `arr[i] = ...` | `map` |
| 정렬 | `reverse`, `sort` | 복사 후 사용 |

**항상 새 배열을 반환하는 메서드:**

- `concat`
- `filter`
- `slice`
- `map`
- Spread 문법 `[...arr]`

### Vue와 비교

```html
<script setup>
import { reactive } from 'vue'

const artists = reactive([])

// ✅ Vue는 직접 수정 가능 (반응형)
artists.push({ id: 1, name: 'Kim' })
artists.splice(0, 1)
</script>
```

```jsx
// React: 불변 업데이트 필요
const [artists, setArtists] = useState([])

// ❌ 직접 수정 불가
artists.push({ id: 1, name: 'Kim' })

// ✅ 새 배열 생성
setArtists([...artists, { id: 1, name: 'Kim' }])
setArtists(artists.filter((a, i) => i !== 0))
```

---

## 다음 단계

### 이 챕터에서 배운 내용 요약

✅ **이벤트 핸들러**: `onClick`, `onChange` 등으로 사용자 입력에 응답  
✅ **useState Hook**: 컴포넌트에 메모리(state) 추가  
✅ **렌더와 커밋**: React의 3단계 UI 업데이트 과정  
✅ **State 스냅샷**: State는 렌더링 시점에 고정됨  
✅ **State 업데이트 큐**: 업데이터 함수로 여러 업데이트 배치  
✅ **객체 업데이트**: Spread 문법으로 불변 업데이트  
✅ **배열 업데이트**: `map`, `filter` 등으로 새 배열 생성

### 연습 문제

#### 1. 카운터 구현

```jsx
// TODO: +1, -1, Reset 버튼이 있는 카운터 만들기
import { useState } from 'react';

export default function Counter() {
  // 여기에 코드 작성
}
```

#### 2. 할 일 목록 (CRUD)

```jsx
// TODO: 추가, 완료 토글, 삭제 기능이 있는 할 일 목록
import { useState } from 'react';

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  
  // 여기에 코드 작성
}
```

#### 3. 쇼핑 카트

```jsx
// TODO: 상품 추가, 수량 변경, 제거 기능
import { useState } from 'react';

const products = [
  { id: 1, name: 'Laptop', price: 1200 },
  { id: 2, name: 'Phone', price: 800 },
  { id: 3, name: 'Headphones', price: 100 },
];

export default function ShoppingCart() {
  const [cart, setCart] = useState([]);
  
  // 여기에 코드 작성
}
```

### 다음에 학습할 내용

다음 챕터에서는 **State 관리하기 (Managing State)**를 학습합니다.

**배울 내용:**

- State로 입력에 반응하기
- State 구조 선택하기
- 컴포넌트 간 State 공유
- State 보존 및 재설정
- Reducer로 State 로직 추출
- Context로 데이터 깊이 전달
- Reducer와 Context로 확장하기

---

## 참고 자료

- [React 공식 문서 - Adding Interactivity](https://react.dev/learn/adding-interactivity)
- [React 공식 문서 - Managing State](https://react.dev/learn/managing-state)
- [useState Hook](https://react.dev/reference/react/useState)
- [이벤트 처리](https://react.dev/learn/responding-to-events)

---

**작성일**: 2025-10-11  
**출처**: [React Official Documentation](https://react.dev/learn/adding-interactivity)  
**대상**: React 초급-중급 학습자

---

## 학습 체크리스트

- [ ] 이벤트 핸들러를 작성할 수 있다
- [ ] `useState`로 state를 관리할 수 있다
- [ ] 렌더링 프로세스를 이해한다
- [ ] State가 스냅샷처럼 동작함을 이해한다
- [ ] 업데이터 함수를 사용할 수 있다
- [ ] 객체 state를 불변으로 업데이트할 수 있다
- [ ] 배열 state를 불변으로 업데이트할 수 있다
- [ ] `map`, `filter` 등의 배열 메서드를 활용할 수 있다

모든 항목을 체크했다면 다음 챕터로 넘어가세요! 🚀
