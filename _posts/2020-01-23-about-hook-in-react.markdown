---
layout: post
title: "리액트 Hook 정리"
date: 2020-01-23 17:58:13 +0900
lastmod : 2020-01-23 17:58:13 +0900
categories: [React]
sitemap :
  changefreq : daily
  priority : 1.0
---

React Hooks
[출처] 리액트를 다루는 기술(개정판) - 김민준

```
// TODO 설명과 예제를 전부 직접 만든 것으로 바꾸자.
```

---

<br>

## useState

가장 기본적인 Hook. 컴포넌트에서도 가변적인 상태를 지닐 수 있게 해줌.
함수형 컴포넌트에서 상태를 관리해야한다면, 이 Hook을 사용하면 된다.

사용 예.

```javascript
// 기본값을 0으로 설정하겠다는 의미
const [value, setValue] = useState(0);

const onChangeValue = e => setValue(e.target.value);
```

하나의 **useState** 함수는 하나의 상태값만 관리할 수 있기 때문에,
관리해야할 상태가 여러개라면 **useState** 를 여러번 사용해야함.

사용 예.

```javascript
const [value, setValue] = useState(0);
const [name, setName -] = useState('');

const onChangeValue = e => setValue(e.target.value);
const onChangeName = e => setValue(e.target.value);
```

---

<br>

## useEffect

리액트 컴포넌트가 렌더링될 때마다 특정 작업을 수행하도록 설정할 수 있는 Hook.
클래스형 컴포넌트의 **componentDidMount** 와 **componentDidUpdate** 를 합친 형태

사용 예.

```javascript
useEffect(() => {
  console.log("렌더링 완료!");
});
```

마운트될 때만 실행하고 싶을 때

```javascript
useEffect(() => {
  console.log("마운트될 때만 실행!");
}, []); // 빈 배열 []을 두번째 파라미터로 전달
```

특정 값이 업데이트될 때만 실행하고 싶을 때

```javascript
useEffect(() => {
  console.log("name 값이 업데이트될 때만 실행!");
}, [name]); // useState로 관리되는 값이나 props로 전달받은 값을 넣어도 됨.
```

기본적으로 렌더링된 직후마다 실행되지만, 두번째 파라미터 배열에 넣는 값에 따라
실행 조건을 바꿀 수 있음.

컴포넌트가 언마운트되거나 업데이트되기 직전에 작업을 수행하려는 경우,
**useEffect** 함수에서 **cleanup** 함수를 반환해줘야 함.

언마운트, 업데이트 직전마다 실행

```javascript
useEffect(() => {
  console.log("effect");
  return () => {
    console.log("cleanup");
  };
});
```

언마운트될 때만 실행

```javascript
useEffect(() => {
  console.log("effect");
  return () => {
    console.log("cleanup");
  };
}, []); // 빈 배열 []을 두번째 파라미터로 전달
```

---

<br>

## useReducer

**useState** 보다 더 다양한 컴포넌트 상황에 따라, 다양한 상태를 다른 값으로 업데이트하려고 할 때 사용하는 Hook.

리듀서는 현재 상태, 업데이트를 위해 필요한 정보를 담은 액션 값을 전달받아 새로운 상태를 반환하는 함수.

리듀서 함수에서 새로운 상태를 만들 때는 반드시 불변성을 지켜야 함.

사용 예. (카운터 구현하기)

```javascript
function reducer(state, action) {
  // action.type에 따라 다른 작업 수행
  switch (action.type) {
    case "INCREMENT":
      return { value: state.value + 1 };
    case "DECREMENT":
      return { value: state.value - 1 };
    default:
      return state;
  }
}

const Counter = () => {
  // 리듀서의 첫 파라미터는 리듀서 함수, 두 번째는 해당 리듀서의 기본값을 넣음.
  // state: 현재 가리키고 있는 상태
  // dispatch: 액션을 발생시키는 함수
  const [state, dispatch] = userReducer(reducer, { value: 0 });

  return (
    <div>
      <p>
        현재 카운터 값: <b>{state.value}</b>
      </p>
      <button onClick={() => dispatch({ type: "INCREMENT" })}>+1</button>
      <button onClick={() => dispatch({ type: "DECREMENT" })}>-1</button>
    </div>
  );
};

export default Counter;
```

**useReducer** 의 가장 큰 장점은 컴포넌트 업데이트 로직을 컴포넌트 바깥으로 뺄 수 있다는 것.

### 인풋 상태 관리하기

```javascript
function reducer(state, action) {
  return {
    ...state,
    [action.name]: action.value
  };
}

const Info = () => {
  const [state, dispatch] = userReducer(reducer, {
    name: "",
    nickname: ""
  });

  const { name, nickname } = state;

  const onChange = e => {
    dispatch(e.target);
  };

  return (
    <div>
      <div>
        <input name="name" value={name} onChange={onChange} />
        <input name="nickname" value={nickname} onChange={onChange} />
      </div>
      <div>
        <b>이름: </b>
        {name}
      </div>
      <div>
        <b>별명: </b>
        {nickname}
      </div>
    </div>
  );
};

export default Counter;
```

**useReducer** 에서 액션은 그 어떤 값도 사용 가능함. 위 코드는 이벤트 객체가 지니고 있는 **e.target** 값 자체를 액션 값으로 사용함.
이런 식으로 인풋을 관리하면 아무리 잇풋 갯수가 많아져도 코드를 짧고 깔끔하게 유지할 수 있음.

---

<br>

## useMomo

함수형 컴포넌트 내부에서 발생하는 연산을 최적화할 수 있는 Hook.
렌더링하는 과정에서 **특정 값이 바뀌었을 때만 연산을 실행** 하고, 값이 바뀌지 않았다면 이전 연산 결과를 재사용하는 방식.

```javascript
const getAverage = numbers => {
  console.log("평균값 계산중");
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((a, b) => a + b);
  return sum / numbers.length;
};

const Average = () => {
  const [list, setList] = useState([]);
  const [number, setNumber] = useState("");

  const onChange = e => {
    setNumber(e.target.value);
  };

  const onInsert = () => {
    const nextList = list.concat(parseInt(number));
    setList(nextList);
    setNumber("");
  };

  const avg = useMemo(() => getAverage(list), [list]);

  return (
    <div>
      <input value={number} onChange={onChange} />
      <button onClick={onInsert}>등록</button>
      <ul>
        {list.map((value, index) => (
          <li key={index}> {value} </li>
        ))}
      </ul>
      <div>
        <b>평균값: </b> {avg}
      </div>
    </div>
  );
};
```

---

<br>

## useCallback

**useMemo** 와 상당히 비슷한 함수로, 주로 렌더링 성능을 최적화해야하는 상황에서 사용.
이 Hook을 사용하면 이벤트 핸들러 함수를 필요할 때만 생성할 수 있음.

위 소스코드에서 아래에 작성한 부분으로 수정하거나 추가하자.

```javascript
const onChange = useCallback(e => {
  setNumber(e.target.value);
}, []); // 컴포넌트가 처음 랜더링될 때만 함수 생성

const onInsert = useCallback(() => {
  const nextList = list.concat(parseInt(number));
  setList(nextList);
  setNumber("");
}, [number, list]); // number 혹은 list가 바뀌었을 때만 함수 생성
```

첫번째 파라미터에는 생성하려는 **함수** 를 넣고, 두 번째 파라미터에는 **배열** 을 넣으면 됨.

이 배열에는 어떤 값이 바뀌었을 때 함수를 새로 생성해야하는지 명시해야함.

비어있는 배열 []을 넣게되면 컴포넌트가 랜더링될 때 한 번만 함수가 생성되며,
**[number, list]** 이렇게 넣으면 **number** 나 **list** 값에 변화가 생길 때마다 생성됨.

```javascript
useCallback(() => {
  console.log("hello world");
}, []);

useMemo(() => {
  const fn = () => {
    console.log("hello world");
  };
  return fn;
}, []);
```

위 두 코드는 완전히 동일한 동작을 함. **useCallback** 은 결국 **useMemo** 로 함수를 반환해야하는 상황에서 더 편하게 사용할 수 있는 Hook.
숫자, 문자열, 객체처럼 일반 값을 재사용하려면 **useMemo** 를 사용하고, 함수를 재사용하려면 **useCallback** 을 사용하자.

---

<br>

## useRef

함수형 컴포넌트에서 쉽게 **ref** 를 사용할 수 있게 하는 Hook.

```javascript
// 선언
const inputEl = useRef(null);

// 사용
const onInsert = useCallback(() => {
    ...
    inputEl.current.focus();  // 사용 - 함수 내부에서 focus 동작을 수행
}, [number, list]);

// DOM 객체에 ref 설정
<input value={number} onChange={onChange} ref={inputEl} />
```

로컬 변수 사용하기
추가로 컴포넌트 로컬 변수를 사용해야할 때도 **useRef** 를 사용할 수 있음.

### 로컬변수) 렌더링과 상관없이 바뀔 수 있는 값을 의미.

사용 예.

```javascript
const RefSample = () => {
  const id = useRef(1);

  const setId = n => {
    id.current = n;
  };

  const printId = () => {
    console.log(id.current);
  };

  return <div>refsample</div>;
};

export default RefSample;
```

**ref** 값이 바뀌어도 컴포넌트가 렌더링되지 않으므로,
렌더링과 관련되지 않은 값을 관리할 때만 이러한 방식으로 코드를 작성하자.
