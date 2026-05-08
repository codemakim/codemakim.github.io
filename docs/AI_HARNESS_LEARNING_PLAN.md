# AI 하네스 엔지니어링 학습서

> 이 문서는 공개 커리큘럼을 바탕으로 혼자 학습할 수 있도록 재구성한 실습형 문서다. 커리큘럼 외의 강의 본문, 강의 자료, 수강생 전용 요약은 참고하지 않았다.

Claude Code를 기준으로 설명하지만, 원리는 Codex, Cursor, Gemini CLI, Copilot Agent 같은 AI 코딩 도구에도 적용할 수 있다. 목표는 AI를 "믿고 맡기는 것"이 아니라, **작업을 작게 나누고, 규칙을 주입하고, 위험을 막고, 결과를 검증하는 구조**를 직접 만드는 것이다.

---

## 이 문서를 읽는 방법

이 글은 기능 목록 요약이 아니다. AI 코딩 도구를 처음 업무에 붙일 때 생기는 문제를 하나씩 보고, 그 문제를 줄이기 위한 하네스 계층을 직접 설계하는 방식으로 읽는다.

추천 순서:

1. 먼저 문제 상황과 개념을 읽는다.
2. 각 장의 좋은 예와 나쁜 예를 비교한다.
3. "오늘 할 일"을 작은 샘플 프로젝트에 적용한다.
4. 마지막에 실제 프로젝트의 `AGENTS.md`, skills, hooks, subagents, MCP 정책으로 옮긴다.

핵심 질문은 계속 같다.

```txt
AI가 틀릴 수 있다는 전제에서,
어떤 규칙을 항상 읽히고,
어떤 절차를 필요할 때만 불러오고,
어떤 행동을 도구 레벨에서 막고,
어떤 결과를 증거로 검증할 것인가?
```

---

## 0. 왜 "하네스"인가

하네스(harness)는 힘이 큰 대상을 안전하게 다루기 위한 연결 장치다. 테스트 하네스는 프로그램을 통제된 조건에서 실행하게 만들고, 안전 하네스는 사람이 떨어져도 치명적인 사고로 이어지지 않게 만든다.

AI 코딩 도구에도 같은 문제가 있다. AI는 빠르게 파일을 읽고, 코드를 고치고, 테스트를 돌리고, GitHub나 DB 같은 외부 시스템에 접근할 수 있다. 힘이 센 만큼 잘못 움직이면 피해도 커진다.

자주 생기는 문제:

- 요청과 관계없는 파일을 수정한다.
- 사용자가 작업 중인 변경을 되돌린다.
- 재현 없이 버그를 추측으로 고친다.
- 테스트를 돌리지 않고 완료라고 말한다.
- 프로젝트 규칙을 매번 다시 설명해야 한다.
- 외부 도구에서 읽은 내용을 검증 없이 믿는다.
- context가 길어지면 앞선 조건을 잊는다.

AI 하네스는 AI를 더 똑똑하게 만드는 비법이 아니다. AI가 **정해진 작업 구조 안에서 움직이게 만드는 운영 장치**다.

---

## 1. 전체 지도

하네스는 보통 다음 계층으로 나눠 생각한다.

| 계층 | 목적 | 대표 도구 |
| --- | --- | --- |
| Memory | 항상 적용되는 프로젝트 규칙 | `CLAUDE.md`, `AGENTS.md` |
| Skills | 필요할 때 불러오는 작업 절차 | `SKILL.md` |
| Hooks / Approval | 위험 행동 차단과 자동 검증 | Claude Code hooks, Codex sandbox/approval/hooks |
| Subagents | 컨텍스트 격리와 전문 역할 | reviewer, tester, explorer |
| MCP | 외부 시스템 연결 | GitHub, DB, browser, docs search |
| Plugins | 팀 단위 배포 | shared skills, agents, hooks, MCP |
| Workflows | 실제 작업 흐름 | feature, bugfix, review, release |

도구별 대응 관계는 이렇게 보는 편이 안전하다.

| 목적 | Claude Code | Codex |
| --- | --- | --- |
| 항상 적용되는 규칙 | `CLAUDE.md` | `AGENTS.md` |
| 작업별 절차 | `.claude/skills/*/SKILL.md` | Codex skills의 `SKILL.md` |
| 위험 명령 차단 | hooks | sandbox, approval, 명령 정책 |
| 추가 자동화 | hooks | Codex hooks |
| 전문 작업자 | `.claude/agents/*.md` | subagents |
| 외부 도구 연결 | MCP servers | MCP tools, app connectors |
| 팀 배포 | plugins | plugins, shared skills |

Codex에도 hooks는 있다. 다만 Codex에서 처음 안전장치를 설계할 때는 hooks보다 sandbox, approval, 명령 정책을 먼저 본다. Codex hooks는 그 위에 완료 전 검증, 로깅, 프롬프트 검사 같은 자동화를 얹는 계층으로 이해한다.

작업 흐름은 네 단계로 정리한다.

```txt
Intake       요청을 작업 단위로 바꾼다.
Planning     읽을 파일, 수정 범위, 검증 방법을 정한다.
Execution    작은 단위로 수정하고 도구를 실행한다.
Verification 결과 증거를 보고 완료 여부를 판단한다.
```

---

# Part 1. Memory: 매 작업에 깔리는 프로젝트 계약

## 문제가 왜 생기는가

AI에게 매번 이렇게 말해본 적이 있다.

```txt
이 프로젝트는 Next.js야.
수정 전에 docs/ARCHITECTURE.md를 읽어.
Date 객체로 날짜 비교하지 마.
검증 없이 완료라고 하지 마.
답변은 한국어로 해.
```

한 번은 잘 따른다. 하지만 다음 세션이나 긴 작업 중에는 다시 잊을 수 있다. 사람이 매번 같은 규칙을 복사해서 붙이면 규칙이 빠지고, 오래된 설명이 섞이고, 프로젝트마다 다른 약속을 헷갈리게 된다.

Memory는 이 문제를 해결한다. Memory는 "AI가 알아두면 좋은 잡지식"이 아니라 **모든 작업에 적용되는 기본 계약**이다.

## 무엇을 해결하는가

Memory가 잘 작성되어 있으면 AI는 작업 시작 시 다음을 기본값으로 둔다.

- 어떤 문서를 먼저 읽어야 하는가
- 어떤 파일 경계를 지켜야 하는가
- 어떤 명령은 금지인가
- 어떤 검증을 해야 완료인가
- 어떤 언어와 톤으로 답해야 하는가
- 어떤 도메인 규칙을 절대 어기면 안 되는가

이 블로그 프로젝트의 예시는 `AGENTS.md`다. Claude Code에서는 보통 `CLAUDE.md`가 같은 역할을 한다.

## 언제 Memory에 넣는가

기준은 단순하다.

| 내용 | 둘 위치 |
| --- | --- |
| 모든 작업에 항상 필요한 규칙 | Memory |
| 특정 작업에서만 필요한 절차 | Skill |
| 길고 자세한 배경 문서 | docs |
| 일회성 계획 | 이슈, PR 설명, 작업 노트 |
| 공식 API 전문 | 링크 또는 docs |

예를 들어 이 프로젝트에서 "날짜는 `YYYY-MM-DD` 문자열로 비교한다"는 습관 기능을 건드릴 때 매우 중요하다. 자주 관련되는 아키텍처 규칙이므로 Memory에 둘 수 있다.

반면 "블로그 포스트를 재작성할 때 원고를 어떻게 고칠지"는 모든 작업에 필요하지 않다. 이것은 `docs-rewrite` Skill이 더 적합하다.

## 좋은 Memory와 나쁜 Memory

나쁜 예:

```md
좋은 코드로 작성해줘.
테스트 잘 해줘.
최대한 깔끔하게 해줘.
React와 Next.js 공식 문서를 모두 숙지해.
```

문제는 기준이 없다. "좋은", "잘", "깔끔하게"는 사람마다 다르다. 공식 문서를 모두 넣으라는 지시는 context만 낭비하고 실제 행동을 만들지 못한다.

좋은 예:

```md
## Before Editing

1. Read `docs/ARCHITECTURE.md` before changing feature code.
2. Identify target files and explain the plan.
3. Do not edit unrelated files.

## Date Rules

- Use `YYYY-MM-DD` strings for date comparison.
- Use `formatDateToYYYYMMDD` and `compareDateStrings`.
- Do not compare date strings through `Date` objects.

## Completion

- Run `npx tsc --noEmit` before `npm run build` for code changes.
- For docs-only changes, run `git diff --check`.
- Report verification output before claiming completion.
```

좋은 Memory는 행동을 바꾼다. 읽을 파일, 금지 행동, 검증 조건이 구체적이다.

## 사용 방법

Claude Code라면 프로젝트 루트에 `CLAUDE.md`를 둔다.

```bash
touch CLAUDE.md
```

Codex나 여러 AI 코딩 도구가 함께 보는 프로젝트라면 `AGENTS.md`를 둔다.

```bash
touch AGENTS.md
```

처음에는 길게 쓰지 않는다. 최소 구조는 이 정도면 충분하다.

```md
# Project Instructions

## Project Overview

- Stack: Next.js + TypeScript
- Package manager: npm
- Deployment: static export

## Before Editing

1. Read `docs/ARCHITECTURE.md`.
2. Identify target files.
3. Explain the plan briefly.
4. Do not edit unrelated files.

## Commands

- Type check: `npx tsc --noEmit`
- Build: `npm run build`
- Docs check: `git diff --check`

## Rules

- Never run `git reset --hard`.
- Never overwrite user changes.
- Use `rg` for searching.

## Completion

Before saying work is complete:

1. Run the relevant verification command.
2. Read the output.
3. Report what passed or failed.
```

## 효과와 주의점

효과:

- 같은 프로젝트 설명을 반복하지 않아도 된다.
- AI가 수정 전 탐색 순서를 맞추기 쉬워진다.
- 금지 명령과 완료 조건이 일관된다.
- 새 세션에서도 기본 작업 방식이 유지된다.

주의점:

- 너무 길면 매번 context 비용을 쓴다.
- 서로 충돌하는 규칙이 있으면 AI가 임의로 해석한다.
- 오래된 명령이 남아 있으면 잘못된 검증을 반복한다.
- 작업별 절차를 Memory에 다 넣으면 오히려 핵심 규칙이 묻힌다.

## 오늘 할 일

현재 프로젝트 규칙을 15개 정도 적고 세 그룹으로 나눈다.

```txt
Memory: 모든 작업에 항상 적용
Skill: 특정 작업에서만 적용
docs: 필요할 때 참고
```

그다음 Memory 후보를 10개 이하로 줄인다. 마지막으로 AI에게 이렇게 물어본다.

```txt
이 프로젝트의 Memory를 기준으로,
작업 전에 반드시 해야 할 것과 완료 전에 검증해야 할 것을 요약해줘.
아직 파일은 수정하지 마.
```

좋은 결과는 AI가 구체적인 파일, 명령, 금지 행동을 말하는 것이다. 나쁜 결과는 "주의해서 하겠습니다"처럼 추상적인 다짐만 하는 것이다.

## 체크리스트

- `CLAUDE.md`와 `AGENTS.md`가 어떤 역할을 하는지 설명할 수 있는가?
- Memory와 Skill의 차이를 설명할 수 있는가?
- 항상 로드할 규칙과 필요할 때만 볼 문서를 나눌 수 있는가?
- 좋은 Memory와 나쁜 Memory를 비교할 수 있는가?

---

# Part 2. Skills: 반복 작업을 절차로 만들기

## 문제가 왜 생기는가

버그를 고쳐달라고 하면 AI는 종종 바로 코드를 바꾼다.

```txt
증상 재현 없음
기대 동작 정리 없음
관련 코드 경로 확인 없음
테스트 실행 없음
```

운 좋게 맞을 수도 있지만, 실무에서는 위험하다. 버그 수정, 코드 리뷰, 문서 재작성, 성능 분석처럼 반복되는 작업에는 좋은 순서가 있다. 그 순서를 매번 프롬프트로 길게 쓰면 빠뜨리기 쉽다.

Skill은 이 문제를 해결한다. Skill은 필요할 때만 불러오는 **작업 절차**다.

## 무엇을 해결하는가

Memory는 항상 적용되는 규칙이다. Skill은 특정 작업에서만 필요한 절차다.

예:

| 작업 | Skill로 만들 가치 |
| --- | --- |
| 버그 조사 | 재현, 가설, 최소 수정, 재검증 순서가 중요하다 |
| 코드 리뷰 | 출력 형식과 우선순위가 반복된다 |
| 문서 재작성 | 톤, 구조, 예시 기준이 반복된다 |
| 프론트엔드 QA | 브라우저 확인, 반응형, 콘솔 에러 확인이 반복된다 |
| 릴리스 | 빌드, changelog, tag, push 순서가 반복된다 |

Skill을 잘 쓰면 AI가 "무엇을 해야 하는가"뿐 아니라 "어떤 순서로 해야 하는가"를 따른다.

## 좋은 Skill의 구조

좋은 Skill은 다섯 가지를 가진다.

```txt
1. 언제 쓰는지
2. 먼저 확인할 것
3. 단계별 절차
4. 금지할 행동
5. 완료 조건
```

나쁜 Skill:

```md
# Bug Fix

버그를 잘 찾아서 고친다.
테스트도 실행한다.
```

좋은 Skill:

```md
---
name: bug-investigation
description: Use when a bug, failing test, or unexpected behavior appears.
---

# Bug Investigation

## Goal

Find the cause before changing code.

## Steps

1. Reproduce the symptom.
2. Write down expected behavior.
3. Locate the smallest related code path.
4. Form one hypothesis.
5. Check the hypothesis with evidence.
6. Make the smallest fix.
7. Re-run the failing check.
8. Report evidence.

## Do Not

- Do not rewrite unrelated code.
- Do not guess without reproduction.
- Do not claim fixed without running the failing check.

## Completion

The bug is fixed only when the original failing command passes.
```

## 사용 방법

Claude Code에서는 보통 이런 구조를 쓴다.

```bash
mkdir -p .claude/skills/bug-investigation
touch .claude/skills/bug-investigation/SKILL.md
```

Codex skills도 `SKILL.md`를 중심으로 동작한다. 중요한 것은 도구 이름보다 Skill의 내용이다. Skill이 행동을 강제하려면 "좋은 태도"가 아니라 "관찰 가능한 단계"를 적어야 한다.

실습 프롬프트:

```txt
버그가 있다고 가정하고 bug-investigation 절차대로 원인부터 찾아줘.
아직 코드는 수정하지 말고, 재현 방법과 가설만 정리해줘.
```

확인할 것:

- 바로 수정하지 않는가
- 재현을 먼저 찾는가
- 하나의 가설을 세우는가
- 검증 명령을 말하는가

## 효과와 주의점

효과:

- 반복 작업의 품질이 안정된다.
- "먼저 재현", "먼저 리뷰", "먼저 측정" 같은 원칙이 지켜진다.
- 여러 프로젝트에서 같은 절차를 재사용할 수 있다.

주의점:

- 너무 많은 Skill을 만들면 어떤 Skill을 써야 하는지 헷갈린다.
- Skill이 길면 AI가 핵심 절차보다 배경 설명에 끌릴 수 있다.
- 완료 조건이 없으면 여전히 "완료"를 쉽게 말한다.
- Memory와 중복되면 규칙 충돌이 생긴다.

## 오늘 할 일

처음에는 하나만 만든다. 추천은 `bug-investigation`이다.

```txt
1. 최근 겪은 버그 하나를 고른다.
2. 재현 방법을 한 문장으로 쓴다.
3. "코드 수정 금지" 단계까지 Skill에 넣는다.
4. AI에게 Skill 절차대로 조사만 시킨다.
5. 실제로 수정 전에 재현과 가설이 나오는지 확인한다.
```

## 체크리스트

- 반복 작업을 Skill로 만들 기준을 설명할 수 있는가?
- Skill과 Memory의 경계를 나눌 수 있는가?
- 좋은 Skill의 완료 조건을 검증 명령으로 쓸 수 있는가?
- Skill이 너무 많을 때 생기는 문제를 설명할 수 있는가?

---

# Part 3. Hooks, Sandbox, Approval: 말이 아니라 실행 경로에서 막기

## 문제가 왜 생기는가

Memory에 이렇게 써도 충분하지 않다.

```md
Never run `git reset --hard`.
Never delete user changes.
Never print secrets.
```

AI가 규칙을 읽어도 실수할 수 있다. 더 큰 문제는 도구 실행은 실제 효과를 만든다는 점이다. 잘못된 shell command, DB write, GitHub write는 "아차"로 끝나지 않는다.

그래서 위험 행동은 프롬프트가 아니라 **실행 경로**에서 막아야 한다.

## Claude Code와 Codex의 차이

Claude Code에서는 hooks가 대표적인 차단 지점이다. 도구 실행 전후에 외부 명령을 실행해서 막거나 기록한다.

Codex에도 공식 hooks 기능이 있다. 다만 Codex에서 1차 안전장치는 보통 sandbox, approval, 명령 정책이다.

| 목적 | Claude Code | Codex |
| --- | --- | --- |
| 위험 shell 차단 | `PreToolUse` hook | sandbox, approval, 명령 정책 |
| 실행 후 검증 | `PostToolUse` hook | Codex hooks 또는 명시 검증 명령 |
| 사용자 승인 | hook 또는 permission 설정 | approval flow |
| 추가 자동화 | hooks | Codex hooks |

Codex hooks는 `config.toml`의 feature flag로 켜고, `~/.codex/hooks.json`, `<repo>/.codex/hooks.json`, 또는 `config.toml`의 `[hooks]` 설정에서 정의한다. `PreToolUse`, `PermissionRequest`, `PostToolUse`, `UserPromptSubmit`, `Stop` 같은 이벤트에 연결할 수 있다.

하지만 Codex `PreToolUse`를 완전한 enforcement boundary로 보면 안 된다. 가드레일로는 유용하지만, 모든 도구 경로를 완전히 막는 계층으로 설계하면 위험하다. 그래서 Codex에서는 sandbox와 approval을 먼저 설계하고, hooks는 추가 자동화로 붙인다.

## 사용 방법

Claude Code에서 위험 명령 차단 hook을 만든다면 구조는 이렇다.

```bash
mkdir -p .claude/hooks
touch .claude/settings.json
touch .claude/hooks/block-dangerous-bash.js
```

`.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/block-dangerous-bash.js"
          }
        ]
      }
    ]
  }
}
```

`.claude/hooks/block-dangerous-bash.js`:

```js
let input = "";

process.stdin.on("data", (chunk) => {
  input += chunk;
});

process.stdin.on("end", () => {
  const payload = JSON.parse(input || "{}");
  const command = payload.tool_input?.command || "";

  const blocked = [
    "git reset --hard",
    "git checkout -- .",
    "rm -rf",
    "sudo rm",
  ];

  const matched = blocked.find((pattern) => command.includes(pattern));

  if (matched) {
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: `Blocked dangerous command: ${matched}`,
        },
      }),
    );
    return;
  }

  console.log(JSON.stringify({}));
});
```

Codex에서 같은 목적을 다룬다면 먼저 현재 설정을 확인한다.

```txt
1. sandbox가 어디까지 쓰기를 허용하는가
2. network access가 제한되어 있는가
3. 어떤 명령이 approval을 요구하는가
4. 어떤 command prefix가 이미 승인되어 있는가
5. hooks가 필요한 자동화인지, approval로 충분한지
```

## 좋은 예와 나쁜 예

나쁜 예:

```txt
위험한 명령은 조심해서 실행해.
```

이것은 실행 경로를 막지 않는다.

좋은 예:

```txt
git reset --hard, rm -rf, production DB write는 실행 전에 차단하거나 approval을 요구한다.
문서 수정 후에는 git diff --check를 실행한다.
코드 수정 후에는 typecheck와 build를 실행한다.
```

## 효과와 주의점

효과:

- 위험 명령이 실수로 실행될 가능성이 줄어든다.
- 검증 누락을 자동화할 수 있다.
- 팀 정책을 도구 레벨에 가깝게 옮길 수 있다.

주의점:

- hook이 너무 무거우면 모든 작업이 느려진다.
- 너무 많은 자동 검증은 작은 문서 수정에도 비용을 만든다.
- hook script 자체가 버그를 가질 수 있다.
- Codex에서는 hooks보다 sandbox/approval이 기본 안전장치라는 점을 놓치면 안 된다.

## 오늘 할 일

위험 행동 5개를 적고, 각각을 어디에서 막을지 분류한다.

```txt
Memory: 말로 금지해도 충분한 규칙
Approval: 사용자 승인이 필요한 작업
Hook: 자동 차단 또는 자동 검증이 필요한 작업
Manual checklist: 사람이 확인해야 하는 작업
```

실제로 위험 명령을 실행하는 테스트는 하지 않는다. 대신 AI에게 이렇게 묻는다.

```txt
이 프로젝트에서 git reset --hard가 왜 위험한지 설명하고,
현재 하네스에서 어느 계층이 막아야 하는지 분류해줘.
```

## 체크리스트

- Claude Code hooks와 Codex hooks가 같은 이름이지만 역할 위치가 다르다는 점을 설명할 수 있는가?
- Codex에서 위험 명령 차단을 sandbox, approval, 명령 정책으로 먼저 다뤄야 하는 이유를 설명할 수 있는가?
- hook이 너무 무거워지면 어떤 문제가 생기는가?
- 어떤 작업을 hook으로 자동화하고 어떤 작업을 approval로 남길지 판단할 수 있는가?

---

# Part 4. Subagents: 일을 나누기보다 컨텍스트를 격리하기

## 문제가 왜 생기는가

큰 요청 하나에 모든 일을 넣으면 AI는 쉽게 흔들린다.

```txt
이 기능을 구현하고,
관련 테스트를 고치고,
성능도 봐주고,
보안 문제도 리뷰하고,
문서도 업데이트해줘.
```

이런 요청은 작업 종류가 섞여 있다. 구현자는 수정해야 하고, 리뷰어는 의심해야 하며, 테스터는 재현성과 실패 로그를 봐야 한다. 한 context에서 모두 처리하면 역할이 섞이고, 중요한 검토가 흐려진다.

Subagent는 이 문제를 해결한다. 핵심은 "일을 대신 시킨다"가 아니라 **역할과 context를 분리한다**는 점이다.

## 언제 쓰는가

써도 되는 경우:

- 코드 리뷰
- 테스트 실패 로그 분석
- 보안 체크
- 문서 톤 점검
- 여러 파일 탐색
- 병렬 조사

쓰지 않는 게 좋은 경우:

- 요구사항이 아직 불명확한 작업
- 바로 내가 다음 작업을 해야 하는 핵심 구현
- 파일 충돌 가능성이 높은 작업
- 결과를 기다려야만 진행 가능한 작업

좋은 기준은 이것이다.

```txt
결과가 독립적인 판단이면 subagent에 맡긴다.
다음 수정의 중심이면 내가 직접 한다.
```

## 사용 방법

Claude Code 기준으로 reviewer agent를 만든다.

```bash
mkdir -p .claude/agents
touch .claude/agents/code-reviewer.md
```

`.claude/agents/code-reviewer.md`:

```md
---
name: code-reviewer
description: Use after code changes to review correctness, regressions, security risks, and missing tests.
tools: Read, Grep, Glob, Bash
model: inherit
---

You are a code reviewer.

Review only. Do not edit files.

Prioritize findings in this order:

1. correctness bugs
2. behavioral regressions
3. missing tests
4. security risks
5. maintainability concerns

For every finding, include:

- file path
- line reference
- why it matters
- suggested fix

If there are no findings, say so clearly and mention remaining risk.
```

Codex에서도 subagent를 쓸 수 있다면 같은 원칙을 적용한다. 특히 worker에게 파일 수정을 맡길 때는 소유 파일 범위를 제한해야 한다. reviewer처럼 읽기 중심 역할은 가장 안전한 시작점이다.

## 좋은 예와 나쁜 예

나쁜 예:

```txt
subagent에게 전체 리팩토링을 맡겨.
필요한 파일은 알아서 다 고치게 해.
```

문제는 파일 충돌과 책임 불명확성이다.

좋은 예:

```txt
code-reviewer subagent는 읽기만 한다.
최근 diff에서 correctness, regression, missing tests만 찾아라.
파일 수정은 하지 마라.
```

좋은 subagent 지시는 역할, 권한, 출력 형식이 좁다.

## 효과와 주의점

효과:

- 구현 context와 리뷰 context를 분리할 수 있다.
- 큰 로그나 많은 파일 탐색을 병렬로 처리할 수 있다.
- 특정 역할의 출력 품질을 안정화할 수 있다.

주의점:

- subagent 결과를 맹신하면 안 된다.
- 수정 권한을 넓게 주면 충돌이 생긴다.
- 같은 작업을 여러 agent에게 중복 배정하면 낭비다.
- 요구사항이 애매하면 subagent도 애매한 결과를 낸다.

## 오늘 할 일

가장 먼저 reviewer를 만든다. 수정 권한을 주지 않는다.

실습 프롬프트:

```txt
Use the code-reviewer subagent to review my latest changes.
Do not edit files. Report only findings with file and line references.
```

확인할 것:

- 파일을 수정하지 않는가
- 근거 있는 finding을 주는가
- 스타일 취향보다 버그와 회귀를 먼저 보는가

## 체크리스트

- subagent를 써야 하는 작업과 쓰면 안 되는 작업을 구분할 수 있는가?
- subagent에게 수정 권한을 줄 때 파일 범위를 제한할 수 있는가?
- reviewer, tester, explorer의 역할 차이를 설명할 수 있는가?
- subagent 결과를 어떻게 검토할지 설명할 수 있는가?

---

# Part 5. MCP: 외부 도구 연결은 read-only부터

## 문제가 왜 생기는가

AI가 로컬 파일만 볼 수 있으면 답답하다. GitHub 이슈, PR 코멘트, DB schema, 브라우저 화면, 사내 문서를 보면 훨씬 유용하다.

하지만 외부 도구 연결은 위험도 같이 키운다.

```txt
GitHub comment write
PR branch push
DB write
production resource 변경
secret 출력
```

MCP는 AI에게 외부 시스템을 연결하는 표준 인터페이스다. 손과 발을 달아주는 만큼 권한 설계가 중요하다.

## 무엇을 해결하는가

MCP로 할 수 있는 일:

- GitHub 이슈와 PR 읽기
- 실패한 CI 로그 확인
- DB schema 조회
- 브라우저 화면 캡처
- 문서 시스템 검색
- Sentry/Jira/Slack 같은 업무 도구 조회

핵심은 "연결할 수 있다"가 아니라 "어디까지 허용할 것인가"다.

## 권한 설계 기준

처음 원칙은 단순하다.

```txt
1. read-only부터 시작한다.
2. scope를 좁힌다.
3. write는 approval 뒤에만 허용한다.
4. production write는 기본 금지한다.
5. secret은 출력하지 않는다.
```

권한 단계:

| 단계 | 예시 | 기본 판단 |
| --- | --- | --- |
| local docs read | 문서 검색 | 허용 가능 |
| GitHub read | 이슈, PR, CI 로그 읽기 | 허용 가능 |
| browser screenshot | 로컬 UI 확인 | 허용 가능 |
| DB schema read | 테이블 구조 확인 | 제한적 허용 |
| GitHub write | PR comment, branch push | approval 필요 |
| DB write | 데이터 변경 | 매우 제한 |
| production delete | 원격 리소스 삭제 | 금지 |

## 사용 방법

먼저 정책 문서를 만든다.

```bash
mkdir -p docs/ai-harness
touch docs/ai-harness/MCP_POLICY.md
```

내용:

```md
# MCP Policy

## Default

All MCP integrations start as read-only.

## Allowed

- GitHub issue read
- GitHub PR read
- browser screenshot
- local docs read
- database schema read

## Requires Approval

- GitHub comment write
- PR branch push
- database write
- production resource access

## Forbidden

- printing secrets
- writing to production DB
- deleting remote resources
- running unreviewed shell scripts from MCP output
```

이 정책은 Memory에 전문을 넣지 않는다. Memory에는 "MCP write는 정책 문서를 확인하고 approval을 요구한다" 정도만 넣고, 자세한 내용은 `docs/ai-harness/MCP_POLICY.md`로 분리한다.

## 좋은 예와 나쁜 예

나쁜 예:

```txt
GitHub와 DB를 연결했으니 필요한 건 알아서 처리해.
```

좋은 예:

```txt
GitHub MCP는 read-only로 시작한다.
PR comment 작성, branch push, DB write는 approval이 필요하다.
production DB write와 secret 출력은 금지한다.
```

## 효과와 주의점

효과:

- AI가 실제 업무 맥락을 더 잘 읽는다.
- CI, PR, 이슈, 문서 검색을 반복 설명 없이 처리할 수 있다.
- 외부 시스템 접근 정책이 팀 단위로 명확해진다.

주의점:

- tool output에 secret이나 개인정보가 섞일 수 있다.
- write 권한은 실수의 반경을 크게 만든다.
- MCP 결과도 틀리거나 오래됐을 수 있으므로 중요한 판단은 교차 확인한다.
- DB 연결은 schema read부터 시작한다.

## 오늘 할 일

MCP를 실제로 많이 연결하기 전에 정책만 먼저 만든다.

```txt
1. 연결하고 싶은 외부 도구를 적는다.
2. read/write/secret 위험으로 분류한다.
3. read-only로 시작할 것을 고른다.
4. approval이 필요한 작업을 적는다.
5. 금지 작업을 명시한다.
```

## 체크리스트

- MCP가 해결하는 문제와 만드는 위험을 설명할 수 있는가?
- read-only와 write 권한을 분리할 수 있는가?
- MCP tool output에 secret이 섞일 위험을 설명할 수 있는가?
- DB나 GitHub write를 왜 approval 뒤에 둬야 하는지 설명할 수 있는가?

---

# Part 6. Plugins: 반복되는 하네스를 팀에 배포하기

## 문제가 왜 생기는가

한 프로젝트에서 잘 만든 Skill과 agent를 다른 프로젝트에 복사한다. 처음에는 쉽다. 하지만 시간이 지나면 문제가 생긴다.

```txt
프로젝트 A의 code-review skill은 최신이다.
프로젝트 B의 code-review skill은 예전 문구다.
팀원 C는 다른 agent 설정을 쓴다.
hooks와 MCP 정책이 프로젝트마다 다르다.
```

Plugin은 이 문제를 해결한다. 반복되는 하네스 구성요소를 배포 단위로 묶는 방법이다.

## 언제 필요한가

처음부터 plugin을 만들 필요는 없다.

Plugin이 필요한 경우:

- 여러 프로젝트에서 같은 skill을 쓴다.
- 팀원에게 같은 agent를 배포하고 싶다.
- hooks와 MCP 설정을 묶어서 버전 관리하고 싶다.
- 사내 AI 워크플로우를 표준화하고 싶다.

아직 필요 없는 경우:

- 한 프로젝트에서만 실험 중이다.
- skill 이름과 절차가 자주 바뀐다.
- 팀 공통 규칙이 아직 합의되지 않았다.
- 복사해도 유지보수 비용이 낮다.

## 사용 방법

Claude Code plugin 구조 예시는 이렇다.

```txt
ai-harness-plugin/
  .claude-plugin/
    plugin.json
  skills/
    code-review/
      SKILL.md
    release-check/
      SKILL.md
  agents/
    code-reviewer.md
    test-runner.md
  hooks/
    hooks.json
  .mcp.json
```

주의할 점:

```txt
.claude-plugin/에는 plugin metadata만 둔다.
skills/, agents/, hooks/는 plugin root에 둔다.
```

Codex에서도 shared skills나 plugin 형태로 비슷한 기준을 적용한다. 중요한 것은 "배포 가능한 만큼 안정화됐는가"다.

## 좋은 예와 나쁜 예

나쁜 예:

```txt
첫날 만든 bugfix skill을 바로 팀 plugin으로 배포한다.
```

아직 작업 절차가 검증되지 않았다.

좋은 예:

```txt
3개 프로젝트에서 반복 사용한 code-review skill,
읽기 전용 reviewer agent,
검증된 release-check 절차만 plugin 후보로 올린다.
```

## 효과와 주의점

효과:

- 팀원이 같은 리뷰 기준을 쓴다.
- 프로젝트마다 복붙하던 설정을 줄인다.
- 업데이트와 배포 단위가 생긴다.

주의점:

- 너무 일찍 plugin화하면 실험 속도가 느려진다.
- 프로젝트별 예외가 많은 규칙은 plugin에 맞지 않는다.
- shared skill이 오래되면 여러 프로젝트가 동시에 낡은 절차를 따른다.

## 오늘 할 일

plugin을 만들지 말고 후보만 정한다.

```md
# Plugin Candidate

## Shared Skills

- code-review
- bug-investigation
- release-check

## Shared Agents

- code-reviewer
- test-runner

## Shared Hooks

- block-dangerous-bash
- require-verification-before-stop

## MCP

- github-readonly
- docs-search
```

후보마다 "이미 두 번 이상 써봤는가", "프로젝트 특화 내용이 적은가", "팀이 같은 기준으로 쓰면 좋은가"를 확인한다.

## 체크리스트

- standalone `.claude/` 설정과 plugin의 차이를 설명할 수 있는가?
- 어떤 skill/agent/hook을 팀에 배포할지 고를 수 있는가?
- plugin을 너무 일찍 만들면 어떤 문제가 생기는지 설명할 수 있는가?
- shared 설정과 프로젝트별 설정의 경계를 나눌 수 있는가?

---

# Part 7. Workflows: 계층을 실제 작업 흐름으로 묶기

## 문제가 왜 생기는가

Memory, Skill, hooks, subagent, MCP를 각각 알아도 실제 작업은 여전히 흔들릴 수 있다. 이유는 작업이 보통 여러 계층을 지나가기 때문이다.

예를 들어 기능 개발은 이렇게 흐른다.

```txt
요구사항 이해
관련 문서 읽기
파일 구조 파악
작은 수정
테스트
리뷰
빌드
완료 보고
```

이 흐름을 매번 즉흥적으로 처리하면 검증이 빠지고, 수정 범위가 커지고, 중간에 목적이 바뀐다.

Workflow는 여러 하네스 계층을 실제 작업 순서로 묶는 문서다.

## 네 가지 기본 workflow

처음에는 네 개면 충분하다.

```txt
feature-development
bugfix
code-review
release
```

## Feature Development

```md
# Feature Development Workflow

## Intake

- 요구사항을 한 문단으로 요약한다.
- 수정 범위를 정한다.
- 건드리지 말아야 할 파일을 정한다.
- 완료 조건을 정한다.

## Planning

- 관련 문서를 읽는다.
- 파일 구조를 확인한다.
- 데이터 흐름을 정리한다.
- 검증 명령을 정한다.

## Execution

- 작은 단위로 수정한다.
- 관련 없는 리팩토링은 하지 않는다.
- 필요하면 reviewer subagent를 병렬로 사용한다.

## Verification

- typecheck
- test
- build
- diff check

## Done

- 변경 요약
- 검증 결과
- 남은 리스크
```

## Bugfix

```md
# Bugfix Workflow

## Rule

Do not fix before reproducing.

## Steps

1. 증상을 재현한다.
2. 기대 동작을 적는다.
3. 관련 코드 경로를 찾는다.
4. 하나의 가설을 세운다.
5. 가설을 증거로 확인한다.
6. 최소 수정한다.
7. 원래 실패하던 검증을 다시 실행한다.
```

## Code Review

```md
# Code Review Workflow

## Priority

1. correctness
2. regression
3. security
4. missing tests
5. maintainability

## Output

- file
- line
- severity
- issue
- suggested fix
```

## Release

```md
# Release Workflow

## Checklist

- working tree 확인
- typecheck
- tests
- build
- changelog/release note
- tag/commit
- push
```

## 좋은 예와 나쁜 예

나쁜 예:

```txt
이 기능 만들어줘. 알아서 테스트도 해줘.
```

좋은 예:

```txt
feature-development workflow로 진행해줘.
먼저 요구사항을 한 문단으로 요약하고,
수정 범위와 검증 명령을 제안한 뒤,
승인 전에는 파일을 수정하지 마.
```

## 효과와 주의점

효과:

- 요청이 작업 단위로 바뀐다.
- 수정 전 계획과 완료 전 검증이 안정된다.
- subagent, skill, hooks가 언제 개입해야 하는지 분명해진다.

주의점:

- workflow가 너무 복잡하면 작은 작업에도 부담이 된다.
- 모든 작업을 같은 workflow로 밀어 넣으면 비효율적이다.
- 완료 조건이 없으면 workflow도 체크박스 놀이가 된다.

## 오늘 할 일

`docs/ai-harness/workflows/`에 네 가지 workflow 초안을 만든다.

```bash
mkdir -p docs/ai-harness/workflows
touch docs/ai-harness/workflows/feature-development.md
touch docs/ai-harness/workflows/bugfix.md
touch docs/ai-harness/workflows/code-review.md
touch docs/ai-harness/workflows/release.md
```

각 workflow에는 "시작 조건", "단계", "완료 조건"을 반드시 넣는다.

## 체크리스트

- feature와 bugfix workflow의 차이를 설명할 수 있는가?
- workflow가 Memory나 Skill과 어떻게 다른지 설명할 수 있는가?
- 완료 조건 없는 workflow가 왜 위험한지 설명할 수 있는가?
- 작은 작업과 큰 작업에 다른 workflow를 적용할 수 있는가?

---

# Part 8. Final Lab: 작은 프로젝트에 하네스 적용하기

## 목적

마지막 실습은 디렉토리 구조를 만드는 것이 아니다. AI가 실제로 하네스 안에서 움직이는지 확인하는 것이다.

성공 기준:

- AI가 프로젝트 규칙을 읽는다.
- 반복 작업에서 Skill 절차를 따른다.
- 위험 명령은 hook, sandbox, approval 정책으로 막힌다.
- reviewer subagent는 수정하지 않고 리뷰만 한다.
- MCP 정책은 write 권한을 제한한다.
- workflow 문서대로 feature 작업을 수행한다.
- 완료 전 검증 결과를 보고한다.

## 실습 구조

```txt
ai-harness-lab/
  README.md
  AGENTS.md
  .claude/
    settings.json
    agents/
      code-reviewer.md
      test-runner.md
    skills/
      bug-investigation/
        SKILL.md
      code-review/
        SKILL.md
    hooks/
      block-dangerous-bash.js
  docs/
    ai-harness/
      MCP_POLICY.md
      workflows/
        feature-development.md
        bugfix.md
        code-review.md
        release.md
```

Claude Code만 쓴다면 `AGENTS.md` 대신 `CLAUDE.md`를 기준으로 해도 된다. 여러 도구가 같이 보는 프로젝트라면 `AGENTS.md`가 더 낫다.

## 실습 과제 1: Memory 확인

프롬프트:

```txt
이 프로젝트에서 작업을 시작하기 전에 읽어야 할 문서,
수정 중 지켜야 할 규칙,
완료 전에 실행해야 할 검증을 요약해줘.
아직 파일은 수정하지 마.
```

통과 기준:

- Memory의 구체적인 규칙을 말한다.
- 추상적인 다짐만 하지 않는다.
- 검증 명령을 구분한다.

## 실습 과제 2: Skill 확인

프롬프트:

```txt
bug-investigation 절차대로 이 실패를 조사해줘.
아직 코드는 수정하지 말고,
재현 방법, 기대 동작, 첫 번째 가설만 정리해줘.
```

통과 기준:

- 바로 수정하지 않는다.
- 재현과 기대 동작을 분리한다.
- 하나의 가설을 세운다.

## 실습 과제 3: 위험 작업 확인

프롬프트:

```txt
git reset --hard가 이 프로젝트에서 왜 위험한지 설명하고,
어느 하네스 계층이 막아야 하는지 말해줘.
실제로 실행하지 마.
```

통과 기준:

- 실행하지 않는다.
- Memory, hook, sandbox, approval 중 어디에 해당하는지 분류한다.
- 사용자 변경 손실 위험을 설명한다.

## 실습 과제 4: Subagent 확인

프롬프트:

```txt
code-reviewer 역할로 최근 변경을 리뷰해줘.
파일은 수정하지 말고 finding만 보고해줘.
```

통과 기준:

- 수정하지 않는다.
- 파일과 라인 근거를 준다.
- correctness, regression, missing tests를 먼저 본다.

## 실습 과제 5: Workflow 확인

프롬프트:

```txt
feature-development workflow로 작은 문서 수정 작업을 준비해줘.
먼저 요구사항 요약, 수정 범위, 검증 명령만 제안하고,
승인 전에는 파일을 수정하지 마.
```

통과 기준:

- intake와 planning을 먼저 한다.
- 수정 범위를 좁힌다.
- 검증 명령을 제안한다.
- 승인 전 수정하지 않는다.

## 마무리 점검

하네스가 잘 작동하면 AI의 답변이 더 길어지는 것이 아니라 더 예측 가능해진다.

좋은 징후:

- "먼저 확인하겠다"가 아니라 실제로 확인할 파일을 말한다.
- "테스트하겠다"가 아니라 실행할 명령을 말한다.
- "조심하겠다"가 아니라 위험 행동을 어느 계층에서 막을지 말한다.
- "완료"가 아니라 검증 결과와 남은 리스크를 말한다.

나쁜 징후:

- 규칙을 읽었는지 알 수 없다.
- 작업 전 계획 없이 바로 수정한다.
- 검증 명령이 매번 달라진다.
- subagent가 직접 파일을 수정한다.
- MCP write 권한을 쉽게 허용한다.

---

# Part 9. 이 블로그 프로젝트에 적용하는 순서

이 블로그 프로젝트는 이미 `AGENTS.md`가 강하다. 따라서 처음부터 모든 하네스를 새로 만들 필요는 없다.

추천 순서:

1. `AGENTS.md`를 더 짧고 실행 가능한 규칙 중심으로 정리한다.
2. 문서 재작성용 `docs-rewrite` Skill을 만든다.
3. 코드 리뷰용 read-only reviewer subagent를 먼저 쓴다.
4. Codex에서는 sandbox와 approval 정책을 우선 믿고, hooks는 반복 자동화가 필요할 때 검토한다.
5. MCP는 GitHub read-only나 docs search부터 시작한다.
6. Supabase는 read-only 정책과 secret 관리가 정리된 뒤 연결한다.

이 프로젝트에서 당장 유용한 Skill 후보:

```txt
docs-rewrite
mdx-fact-check
react-content-review
game-ui-review
release-check
```

---

# Part 10. 학습 체크리스트

아래 질문에 답할 수 있으면 하네스의 핵심은 익힌 것이다.

## Memory

- `CLAUDE.md`와 `AGENTS.md`의 역할을 설명할 수 있는가?
- Memory와 Skill의 차이를 설명할 수 있는가?
- 항상 로드할 규칙과 필요할 때만 볼 문서를 나눌 수 있는가?

## Skills

- 반복 작업을 단계별 절차로 만들 수 있는가?
- Skill의 완료 조건을 검증 명령으로 쓸 수 있는가?
- Skill을 너무 많이 만들 때 생기는 문제를 설명할 수 있는가?

## Hooks / Approval

- Claude Code hooks와 Codex hooks가 같은 이름이지만 기본 안전장치로 쓰이는 위치가 다르다는 점을 설명할 수 있는가?
- Codex에서 위험 명령 차단을 sandbox, approval, 명령 정책으로 먼저 다뤄야 하는 이유를 설명할 수 있는가?
- hook이 너무 무거워지면 어떤 문제가 생기는가?

## Subagents

- subagent를 써야 하는 작업과 쓰면 안 되는 작업을 구분할 수 있는가?
- subagent에게 파일 수정 권한을 줄 때 범위를 제한할 수 있는가?
- reviewer subagent가 왜 가장 안전한 시작점인지 설명할 수 있는가?

## MCP

- read-only와 write 권한을 분리할 수 있는가?
- MCP tool output에 secret이 섞일 위험을 설명할 수 있는가?
- DB write와 GitHub write에 approval이 필요한 이유를 설명할 수 있는가?

## Plugins

- standalone 설정과 plugin의 차이를 설명할 수 있는가?
- 팀에 배포할 만한 skill, agent, hook을 고를 수 있는가?
- plugin을 너무 일찍 만들면 어떤 문제가 생기는지 설명할 수 있는가?

## Workflows

- feature, bugfix, review, release workflow를 구분할 수 있는가?
- Intake, Planning, Execution, Verification을 설명할 수 있는가?
- 완료 조건 없는 workflow가 왜 위험한지 설명할 수 있는가?

---

# 참고 자료

공식 문서 위주로 보면 된다.

- Claude Code 확장 개요: https://code.claude.com/docs/en/features-overview
- Claude Code Memory: https://docs.claude.com/en/docs/claude-code/memory
- Claude Code Hooks: https://docs.claude.com/en/docs/claude-code/hooks
- Codex Hooks: https://developers.openai.com/codex/hooks
- Claude Code Subagents: https://docs.claude.com/en/docs/claude-code/subagents
- Claude Code MCP: https://docs.claude.com/en/docs/claude-code/mcp
- Claude Code Plugins: https://docs.claude.com/en/docs/claude-code/plugins
- MCP 공식 문서: https://modelcontextprotocol.io

---

# 마지막 정리

하네스 엔지니어링은 도구 기능을 많이 아는 일이 아니다. AI가 실수할 수 있다는 전제에서 작업 구조를 만드는 일이다.

```txt
규칙은 Memory에 둔다.
절차는 Skills에 둔다.
위험은 hooks, sandbox, approval 정책으로 막는다.
큰 작업은 Subagents로 격리한다.
외부 도구는 MCP로 연결하되 권한을 제한한다.
반복 배포할 것은 Plugins로 묶는다.
실제 작업은 Workflow로 수행한다.
```

좋은 하네스는 AI를 완전히 통제하지 않는다. 대신 실수를 작게 만들고, 검증에서 걸리게 만들고, 사람이 결과를 이해할 수 있게 만든다.
