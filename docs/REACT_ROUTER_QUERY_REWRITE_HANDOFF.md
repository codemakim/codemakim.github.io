# React Router / React Query 문서 재작성 핸드오프

> 목적: 새 세션에서 "문서 수정 작업 이어서 진행해줘"라고 요청했을 때, 기존 판단과 진행 상황을 다시 긴 탐색으로 반복하지 않기 위한 작업 메모다.

## 새 세션 시작 절차

1. 이 문서를 먼저 읽는다.
2. `content/AGENTS.md`를 읽어 블로그 포스트 작성 규칙을 확인한다.
3. 필요한 경우에만 `docs/ARCHITECTURE.md`를 짧게 확인한다.
4. 이미 재작성된 글은 전체를 다시 정독하지 말고, 이 문서의 체크리스트와 변경 방향만 확인한다.
5. 이어서 수정할 글 2~3편만 열어 작업한다.
6. 수정 후 `npx prettier@latest --write <수정한 mdx 파일들>`로 포맷한다.
7. `npx tsc --noEmit`과 `npm run build`로 검증한다.

주의: 현재 `npm run format`은 `prettier`가 프로젝트 의존성에 없어 실패한다. 포맷은 일회성 `npx prettier@latest --write ...`로 처리했다.

## 전체 판단 요약

React 기초 시리즈는 초급 독자가 따라가기 쉬운 편이다.

- 글이 짧게 쪼개져 있다.
- React 개념을 한 번에 많이 밀어 넣지 않는다.
- "왜 안 되는가"와 "어떻게 고치는가"가 예제 중심으로 이어진다.
- Vue 비교가 독자에게 익숙한 기준점을 제공한다.

반면 기존 React Router / React Query 글은 내용 자체가 틀렸다기보다 난이도 상승 폭이 크다.

- 초반부터 실무 용어와 운영 기준이 많이 나온다.
- 공식 문서 요약처럼 읽히는 문단이 있다.
- React 기초를 막 끝낸 독자에게는 "문제 상황 -> 필요성 -> 최소 API" 사다리가 부족하다.
- 일부 글은 좋은 실무 내용이 있지만, 초입에서 개념 밀도가 높아 진입 장벽이 생긴다.

재작성 목표는 고급 내용을 삭제하는 것이 아니라, 초급에서 중급으로 올라가는 계단을 만드는 것이다.

## 공통 재작성 구조

`content/AGENTS.md` 규칙에 맞춰 다음 구조를 기본으로 쓴다.

1. 왜 필요한가
2. 원리/기준
3. 최소 예제
4. 실무 예제
5. 함정/디버깅
6. Vue 또는 Vue Router / Vue Query 비교
7. 체크리스트

문체 규칙:

- 한국어로 작성한다.
- 문장 종결은 `~한다/~된다` 체를 쓴다.
- `~같다`, `~라고 생각한다`, 존댓말을 피한다.
- 느낌표와 이모지를 쓰지 않는다.
- 코드 예제는 필요한 import를 포함하고, 그대로 옮겨도 흐름을 이해할 수 있게 작성한다.

## React Router 시리즈 확인 결과

React Router 시리즈는 12편이 모두 존재한다. 이전 세션에서 9편까지만 있다고 말한 것은 검색 범위를 좁혀서 생긴 착오다.

| 상태   | 파일                                                                  | 제목                                                            | seriesOrder |
| ------ | --------------------------------------------------------------------- | --------------------------------------------------------------- | ----------- |
| 완료   | `content/2025-08-11-react-advanced-01-01-basic-routing.mdx`           | `[React Router 1/12] React Router - 기본 라우팅`                | 1           |
| 완료   | `content/2025-08-12-react-advanced-01-02-nested-routes.mdx`           | `[React Router 2/12] React Router - 중첩 라우트`                | 2           |
| 완료   | `content/2025-08-13-react-advanced-01-03-dynamic-routes.mdx`          | `[React Router 3/12] React Router - 동적 라우트`                | 3           |
| 완료   | `content/2025-08-14-react-advanced-01-04-programmatic-navigation.mdx` | `[React Router 4/12] React Router - 프로그래밍 방식 네비게이션` | 4           |
| 완료   | `content/2025-08-15-react-advanced-01-05-router-hooks.mdx`            | `[React Router 5/12] React Router - Router Hooks`               | 5           |
| 완료   | `content/2025-08-16-react-advanced-01-06-protected-routes.mdx`        | `[React Router 6/12] React Router - Protected Routes`           | 6           |
| 미완료 | `content/2025-08-17-react-advanced-01-07-loading-error-handling.mdx`  | `[React Router 7/12] React Router - 로딩 및 에러 처리`          | 7           |
| 미완료 | `content/2025-08-18-react-advanced-01-08-advanced-patterns.mdx`       | `[React Router 8/12] React Router - 고급 패턴`                  | 8           |
| 미완료 | `content/2025-08-18-react-advanced-01-09-practice-and-next.mdx`       | `[React Router 9/12] React Router - 실전 예제 & 다음 단계`      | 9           |
| 미완료 | `content/2025-08-24-react-advanced-01-10-data-router-basics.mdx`      | `[React Router 10/12] React Router - Data Router 기초`          | 10          |
| 미완료 | `content/2025-08-25-react-advanced-01-11-actions-and-forms.mdx`       | `[React Router 11/12] React Router - Actions & Forms`           | 11          |
| 미완료 | `content/2025-08-26-react-advanced-01-12-ops-and-testing.mdx`         | `[React Router 12/12] React Router - 운영/배포/테스트`          | 12          |

## 이미 완료한 React Router 1~6편 변경 요약

### 1편: 기본 라우팅

파일: `content/2025-08-11-react-advanced-01-01-basic-routing.mdx`

변경 방향:

- `고급` 태그를 `중급`으로 낮췄다.
- "React Router란?" 정의부터 시작하던 흐름을 "왜 URL과 화면을 연결해야 하는가"로 바꿨다.
- `BrowserRouter`, `Routes`, `Route`, `Link`, `NavLink`를 최소 단위로 설명했다.
- 작은 블로그 라우팅 예제를 넣었다.
- 정적 배포 새로고침 404, 라우터 밖에서 `Link` 사용, URL에 넣을 상태 기준을 함정으로 정리했다.

핵심 메시지:

- URL은 단순 문자열이 아니라 화면 상태다.
- React Router는 URL 패턴과 컴포넌트의 연결을 선언적으로 표현한다.

### 2편: 중첩 라우트

파일: `content/2025-08-12-react-advanced-01-02-nested-routes.mdx`

변경 방향:

- `고급` 태그를 `중급`으로 낮췄다.
- 대시보드 레이아웃 문제에서 출발하도록 바꿨다.
- `<Outlet />`, `index`, Layout Route를 초급 독자용으로 다시 설명했다.
- 대시보드 레이아웃 실무 예제를 유지하되 문단 순서를 낮은 난이도에서 높은 난이도로 재배치했다.
- `Outlet` 누락, 자식 path의 `/`, `NavLink end`, 레이아웃의 책임 과다를 함정으로 정리했다.

핵심 메시지:

- 중첩 라우트는 공통 레이아웃 재사용 문제를 해결한다.
- 부모 라우트는 공통 UI를 렌더링하고 자식 라우트는 `<Outlet />` 위치에 들어간다.

### 3편: 동적 라우트

파일: `content/2025-08-13-react-advanced-01-03-dynamic-routes.mdx`

변경 방향:

- `고급` 태그를 `중급`으로 낮췄다.
- `params`와 query string의 역할 분리를 먼저 잡았다.
- `useParams()` 값이 문자열 또는 `undefined`라는 점을 강조했다.
- 렌더 중 `navigate()` 호출 예제를 제거하고, 잘못된 파라미터는 UI로 처리하는 안전한 예제로 바꿨다.
- `useSearchParams()` 예제에서 새 `URLSearchParams` 객체를 만들어 업데이트하는 패턴을 사용했다.
- 검색어에는 `replace: true`, 태그 변경에는 일반 히스토리 push를 쓰는 UX 기준을 설명했다.

핵심 메시지:

- URL 파라미터는 리소스의 정체성이다.
- 쿼리 스트링은 같은 화면의 보기 옵션이다.
- 라우트 404와 데이터 없음 상태를 분리해야 한다.

### 4편: 프로그래밍 방식 네비게이션

파일: `content/2025-08-14-react-advanced-01-04-programmatic-navigation.mdx`

변경 방향:

- `고급` 태그를 `중급`으로 낮췄다.
- "코드가 이동 시점을 결정해야 하는 순간"에서 시작하도록 바꿨다.
- `Link`와 `useNavigate()`의 역할 차이를 먼저 설명했다.
- 저장 성공 후 상세 페이지 이동 예제를 에러 처리와 빈 값 검증을 포함한 실무형 예제로 바꿨다.
- `replace`, `state`, 상대 경로, `navigate(-1)` fallback 기준을 정리했다.
- 렌더링 중 `navigate()` 호출, `state` 영속성 착각, 뒤로가기만 믿는 패턴을 함정으로 정리했다.

핵심 메시지:

- `useNavigate()`는 단순 이동 버튼용 API가 아니라 작업 결과에 따라 이동을 실행하는 API다.
- 링크로 표현되는 이동은 링크로 두고, 코드가 판단해야 하는 이동만 `useNavigate()`로 처리한다.

### 5편: Router Hooks

파일: `content/2025-08-15-react-advanced-01-05-router-hooks.mdx`

변경 방향:

- `고급` 태그를 `중급`으로 낮췄다.
- 훅 목록 나열을 줄이고 "현재 URL에서 무엇을 읽을 것인가"라는 기준으로 재구성했다.
- `pathname`, params, search params, hash, state의 역할을 표로 분리했다.
- `useParams()` 값 검증과 `useSearchParams()` 복사 업데이트 패턴을 강조했다.
- `useLocation`의 analytics 예제, `useMatch`와 `NavLink`의 역할 구분, `useRoutes`의 적용 기준을 정리했다.

핵심 메시지:

- params는 리소스의 정체성이고 search params는 같은 화면의 보기 옵션이다.
- URL을 단일 진실 소스로 삼을 때 React state와 중복 저장하지 않는다.

### 6편: Protected Routes

파일: `content/2025-08-16-react-advanced-01-06-protected-routes.mdx`

변경 방향:

- `고급` 태그를 `중급`으로 낮췄다.
- "클라이언트 라우트 보호는 보안의 전부가 아니라 사용자 경험의 일부"라는 기준을 앞에 배치했다.
- `RequireAuth` 최소 예제에서 시작해 원래 경로 복귀, 인증 로딩 상태, 권한 기반 접근 제어 순서로 난이도를 올렸다.
- `location.state.from`을 내부 경로로 검증하는 open redirect 방어 예제를 넣었다.
- 서버 API와 Supabase RLS 같은 서버 권한 검사를 별도 층으로 분리해 설명했다.

핵심 메시지:

- 화면을 숨기는 것과 데이터를 보호하는 것은 다르다.
- 인증 상태는 `loading`, `anonymous`, `authenticated`로 분리해야 깜빡임과 잘못된 리다이렉트를 줄일 수 있다.

## 다음 작업 추천 순서

토큰과 품질을 위해 한 번에 2~3편만 작업한다.

1. React Router 7~9편
   - `loading-error-handling`
   - `advanced-patterns`
   - `practice-and-next`
2. React Router 10~12편
   - `data-router-basics`
   - `actions-and-forms`
   - `ops-and-testing`
3. React Query 1~3편
   - `setup`
   - `query-basics`
   - `mutation`
4. React Query 4~8편
   - `caching`
   - `optimistic-updates`
   - `infinite-scroll`
   - `advanced-patterns`
   - `practice-and-next`

## React Router 7~9편을 이어서 할 때의 기준

새 세션에서 바로 이어서 작업한다면 우선 7~9편부터 진행한다.

7편 `loading-error-handling`:

- 라우터 로딩과 컴포넌트 내부 로딩을 구분한다.
- 초급 독자가 이해할 수 있게 "데이터를 기다리는 화면"과 "URL이 잘못된 화면"을 분리한다.
- 에러 상태는 네트워크 실패, 404, 권한 문제로 나누어 설명한다.

8편 `advanced-patterns`:

- 고급 패턴을 모두 밀어 넣지 말고 "언제 구조를 분리해야 하는가" 중심으로 낮춘다.
- route config, lazy loading, breadcrumb, modal route 같은 패턴은 필요성에서 출발한다.
- 10~12편 Data Router 주제와 중복되지 않게 한다.

9편 `practice-and-next`:

- 앞 1~8편을 작은 블로그/대시보드 예제로 통합한다.
- 독자가 직접 만들 수 있는 체크리스트와 다음 학습 방향을 제공한다.
- 10~12편에서 Data Router로 넘어가는 이유를 짧게 예고한다.

## React Query 시리즈 현재 판단

React Query 시리즈는 다음 파일들이 있다.

- `content/2025-08-19-react-advanced-02-01-setup.mdx`
- `content/2025-08-19-react-advanced-02-02-query-basics.mdx`
- `content/2025-08-20-react-advanced-02-03-mutation.mdx`
- `content/2025-08-21-react-advanced-02-04-caching.mdx`
- `content/2025-08-22-react-advanced-02-05-optimistic-updates.mdx`
- `content/2025-08-23-react-advanced-02-06-infinite-scroll.mdx`
- `content/2025-08-24-react-advanced-02-07-advanced-patterns.mdx`
- `content/2025-08-25-react-advanced-02-08-practice-and-next.mdx`

초기 판단:

- 내용은 TanStack Query v5 기준으로 비교적 최신 흐름을 따른다.
- 다만 `server state`, `staleTime`, `gcTime`, `invalidate` 같은 용어가 초반부터 빠르게 등장한다.
- React 기초 독자에게는 `useEffect + useState` 페칭의 문제를 충분히 겪게 한 뒤 React Query 필요성을 제시하는 편이 낫다.
- React Query 1~3편은 전면 재작성에 가깝게 낮추는 것이 좋다.
- React Query 4~8편은 구조 통일과 난이도 완충 중심으로 수정해도 된다.

React Query 재작성 핵심 메시지:

- 서버 상태는 클라이언트가 소유하지 않는 상태다.
- React Query는 fetch 라이브러리가 아니라 서버 상태 동기화 규칙을 제공한다.
- `queryKey`는 캐시 주소다.
- `staleTime`은 신선도, `gcTime`은 메모리 유지 시간이다.
- mutation 이후에는 서버와 캐시를 다시 맞추는 기준이 필요하다.

## 공식 문서 참고 기준

최신 정보가 바뀔 수 있으므로 새 세션에서는 필요한 범위만 공식 문서를 확인한다.

React Router:

- Declarative Routing: https://reactrouter.com/start/declarative/routing
- URL Values: https://reactrouter.com/start/declarative/url-values
- Outlet: https://reactrouter.com/api/components/Outlet
- useSearchParams: https://reactrouter.com/api/hooks/useSearchParams

TanStack Query:

- React Query Overview: https://tanstack.com/query/latest/docs/framework/react/overview
- Important Defaults: https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults
- Queries: https://tanstack.com/query/latest/docs/framework/react/guides/queries
- Mutations: https://tanstack.com/query/latest/docs/framework/react/guides/mutations

## 검증 이력

React Router 1~3편 재작성 후 확인:

- `npx prettier@latest --write content/2025-08-11-react-advanced-01-01-basic-routing.mdx content/2025-08-12-react-advanced-01-02-nested-routes.mdx content/2025-08-13-react-advanced-01-03-dynamic-routes.mdx`
- `npx tsc --noEmit`
- `npm run build`

결과:

- Prettier 포맷 완료
- TypeScript 체크 통과
- Next.js 정적 빌드 통과

React Router 4~6편 재작성 후 확인:

- `npx prettier@latest --write content/2025-08-14-react-advanced-01-04-programmatic-navigation.mdx content/2025-08-15-react-advanced-01-05-router-hooks.mdx content/2025-08-16-react-advanced-01-06-protected-routes.mdx docs/REACT_ROUTER_QUERY_REWRITE_HANDOFF.md`
- `npx tsc --noEmit`
- `npm run build`

결과:

- Prettier 포맷 완료
- TypeScript 체크 통과
- Next.js 정적 빌드 통과

## 진행 상태 체크리스트

- [x] React Router 1편 재작성
- [x] React Router 2편 재작성
- [x] React Router 3편 재작성
- [x] React Router 4편 재작성
- [x] React Router 5편 재작성
- [x] React Router 6편 재작성
- [ ] React Router 7편 재작성
- [ ] React Router 8편 재작성
- [ ] React Router 9편 재작성
- [ ] React Router 10편 재작성
- [ ] React Router 11편 재작성
- [ ] React Router 12편 재작성
- [ ] React Query 1편 재작성
- [ ] React Query 2편 재작성
- [ ] React Query 3편 재작성
- [ ] React Query 4편 재작성
- [ ] React Query 5편 재작성
- [ ] React Query 6편 재작성
- [ ] React Query 7편 재작성
- [ ] React Query 8편 재작성

## 다음 세션용 짧은 명령문

사용자가 다음처럼 요청하면 된다.

> 문서 수정 작업 이어서 진행해줘.

그 요청을 받으면 다음처럼 진행한다.

1. `docs/REACT_ROUTER_QUERY_REWRITE_HANDOFF.md`를 읽는다.
2. 체크리스트에서 첫 번째 미완료 묶음을 고른다.
3. 해당 글 2~3편만 열어 재작성한다.
4. 이 문서의 진행 상태와 변경 요약을 갱신한다.
5. 포맷, 타입 체크, 빌드를 실행한다.
