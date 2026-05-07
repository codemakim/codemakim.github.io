# AI 하네스 엔지니어링 완성 학습서

> Claude Code를 기준으로 설명하지만, 원리는 Codex, Cursor, Gemini CLI, Copilot Agent 같은 AI 코딩 도구에도 거의 그대로 적용된다.  
> 목표는 AI를 "믿고 맡기는 것"이 아니라, **작업을 작게 나누고, 규칙을 주입하고, 위험을 막고, 결과를 검증하는 구조**를 직접 만드는 것이다.

---

## 이 문서를 읽는 방법

이 문서는 강의 소개 페이지에 나온 내용을 대체해서 혼자 학습할 수 있도록 만든 실습형 문서다.

추천 방식은 간단하다.

1. 처음에는 그냥 한 번 끝까지 읽는다.
2. 두 번째에는 각 장의 "오늘 할 일"만 따라 한다.
3. 세 번째에는 지금 쓰는 실제 프로젝트에 적용한다.

중간에 Claude Code가 없어도 괜찮다. 핵심은 특정 도구가 아니라 구조다.

---

## 0. 왜 "하네스"라는 말을 쓰는가

하네스(harness)는 원래 힘이 큰 대상을 안전하게 다루기 위한 연결 장치다.

말을 제어하는 마구도 하네스고, 전기 배선을 묶는 와이어 하네스도 있고, 테스트 환경에서 프로그램을 제어하는 test harness도 있다.

AI 코딩 도구에서도 같은 문제가 생긴다.

AI는 힘이 세다.

- 파일을 빠르게 읽는다.
- 코드를 빠르게 고친다.
- 문서를 빠르게 쓴다.
- 테스트도 돌릴 수 있다.
- 외부 도구도 연결할 수 있다.

그런데 힘이 센 만큼 잘못 움직이면 피해도 커진다.

- 엉뚱한 파일을 고친다.
- 기존 변경을 되돌린다.
- 테스트를 안 돌리고 "완료"라고 말한다.
- 컨텍스트를 잃고 이전 요청을 계속 수행한다.
- DB나 GitHub 같은 외부 시스템에 위험한 작업을 할 수 있다.

그래서 필요한 것이 AI 하네스다.

AI 하네스는 AI를 똑똑하게 만드는 기술이 아니다.  
AI가 **정해진 작업 방식 안에서 움직이게 만드는 운영 구조**다.

---

## 1. 짧은 배경: 프롬프트 엔지니어링에서 하네스 엔지니어링으로

초기 AI 활용은 대부분 프롬프트 엔지니어링이었다.

좋은 질문을 쓰면 좋은 답이 나온다는 접근이다.

예를 들면 이런 식이다.

```txt
너는 10년차 시니어 개발자야.
이 코드를 리팩토링해줘.
버그 없이 깔끔하게 작성해줘.
```

이 방식은 간단하지만 한계가 분명하다.

한 번의 답변에는 효과가 있어도, 프로젝트 전체 작업 방식은 고정되지 않는다.

실무에서 필요한 것은 매번 좋은 말투로 부탁하는 능력이 아니다.

필요한 것은 이런 것이다.

- 이 프로젝트에서는 어떤 파일부터 읽어야 하는가
- 어떤 명령은 절대 실행하면 안 되는가
- 어떤 작업은 반드시 테스트를 통과해야 완료인가
- 어떤 지식은 항상 로드하고, 어떤 지식은 필요할 때만 로드할 것인가
- 어떤 작업은 별도 에이전트에게 맡겨도 되는가
- 외부 도구는 어디까지 접근시킬 것인가

즉, 프롬프트가 아니라 **작업 환경**을 설계해야 한다.

이 흐름이 하네스 엔지니어링이다.

---

## 2. 가장 중요한 현실 인식

AI를 "결정론적으로 통제한다"는 표현은 조심해야 한다.

LLM은 완전히 결정론적인 작업자가 아니다. 같은 요청도 모델, 컨텍스트, 도구 결과, 시점에 따라 달라질 수 있다.

대신 우리가 만들 수 있는 것은 이것이다.

```txt
완전한 통제 X

검증 가능한 작업 O
반복 가능한 절차 O
위험한 행동 차단 O
컨텍스트 오염 감소 O
실패 시 중단 조건 O
```

그러니까 목표는 "AI가 절대 실수하지 않게 만들기"가 아니다.

목표는 **AI가 실수해도 작게 실패하고, 검증에서 걸리고, 사람이 바로 이해할 수 있게 만드는 것**이다.

---

## 3. 전체 지도

우리가 만들 하네스는 5계층이다.

```txt
Layer 1. Memory
  항상 적용되는 프로젝트 규칙

Layer 2. Skills
  필요할 때 불러오는 작업 절차

Layer 3. Hooks
  도구 사용 전후 자동 검증과 차단

Layer 4. Subagents
  격리된 전문 작업자

Layer 5. MCP / Plugins
  외부 도구 연결과 팀 배포
```

그리고 작업은 4단계로 흐른다.

```txt
1. Intake
   요청을 작업으로 바꾼다

2. Planning
   파일, 흐름, 검증 방법을 정한다

3. Execution
   실제 수정과 도구 실행을 한다

4. Verification
   증거를 보고 완료를 말한다
```

이제 하나씩 만든다.

---

# Part 1. Memory: AI에게 프로젝트 기억 심기

## 1-1. Memory가 하는 일

Memory는 AI가 매 세션마다 읽는 기본 규칙이다.

Claude Code에서는 보통 `CLAUDE.md`가 이 역할을 한다.

이 프로젝트에서는 `AGENTS.md`가 비슷한 역할을 한다.

공식 Claude Code 문서 기준으로 memory는 여러 위치에 있을 수 있다.

| 종류                 | 위치                                 | 용도                    |
| -------------------- | ------------------------------------ | ----------------------- |
| Enterprise policy    | 조직 관리 위치                       | 회사 전체 규칙          |
| Project memory       | `./CLAUDE.md`, `./.claude/CLAUDE.md` | 팀 공유 프로젝트 규칙   |
| User memory          | `~/.claude/CLAUDE.md`                | 개인 선호               |
| Local project memory | 과거 방식                            | 현재는 import 방식 권장 |

중요한 점은 하나다.

**항상 필요한 규칙만 Memory에 넣는다.**

너무 많은 내용을 넣으면 매번 컨텍스트 비용이 든다.  
필요할 때만 보면 되는 긴 문서는 Skills나 별도 docs로 빼야 한다.

## 1-2. Memory에 넣을 것과 빼야 할 것

넣을 것:

- 프로젝트 스택
- 빌드/테스트 명령
- 금지 명령
- 중요한 아키텍처 규칙
- 파일 탐색 순서
- 완료 전 검증 규칙
- 답변 언어/톤

빼야 할 것:

- 긴 API 문서 전문
- 오래된 의사결정 기록
- 특정 작업용 일회성 계획
- 모든 파일 목록
- 자주 안 쓰는 라이브러리 설명

## 1-3. 오늘 할 일

샘플 프로젝트에 `CLAUDE.md`를 만든다.

```bash
touch CLAUDE.md
```

내용은 이렇게 시작한다.

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
- Format MDX: `npx prettier@latest --write <files>`

## Rules

- Never run `git reset --hard`.
- Never overwrite user changes.
- Never claim completion without verification.
- Use `rg` for searching.

## Completion

Before saying work is complete:

1. Run the relevant verification command.
2. Read the output.
3. Report what passed or failed.
```

## 1-4. 실습 프롬프트

Claude Code나 다른 AI 도구에 이렇게 시켜본다.

```txt
이 프로젝트에서 작은 문서 하나를 수정해줘.
작업 전에 어떤 파일을 읽어야 하는지 말하고,
작업 후 어떤 검증을 해야 하는지 알려줘.
```

좋은 결과:

- AI가 `CLAUDE.md` 규칙을 따른다.
- 바로 수정하지 않고 필요한 문서를 먼저 본다.
- 완료 전 검증을 말한다.

나쁜 결과:

- 아무 파일이나 바로 수정한다.
- 빌드/테스트를 생략한다.
- "완료했습니다"만 말한다.

---

# Part 2. Skills: 반복 작업을 절차로 만들기

## 2-1. Skills는 언제 필요한가

Memory는 항상 로드된다.

Skills는 필요할 때만 쓰는 절차다.

예를 들어 이런 작업은 매번 비슷한 순서가 있다.

- 버그 조사
- 코드 리뷰
- 성능 분석
- 문서 재작성
- 릴리스 체크
- 프론트엔드 QA

이걸 매번 프롬프트로 길게 쓰면 불안정하다.

Skill로 만들면 AI가 정해진 절차를 따라간다.

## 2-2. 좋은 Skill의 구조

좋은 Skill에는 5가지가 있어야 한다.

```txt
1. 언제 쓰는지
2. 먼저 확인할 것
3. 단계별 절차
4. 금지할 행동
5. 완료 조건
```

## 2-3. 오늘 할 일: 버그 조사 Skill 만들기

디렉토리를 만든다.

```bash
mkdir -p .claude/skills/bug-investigation
touch .claude/skills/bug-investigation/SKILL.md
```

`SKILL.md`:

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

## 2-4. 실습 프롬프트

```txt
버그가 있다고 가정하고 bug-investigation 절차대로 원인부터 찾아줘.
아직 코드는 수정하지 말고, 재현 방법과 가설만 정리해줘.
```

확인할 것:

- AI가 바로 고치지 않는가
- 재현을 먼저 찾는가
- 하나의 가설만 세우는가

## 2-5. Skill 후보 목록

처음부터 많이 만들 필요는 없다.

추천 순서:

```txt
1. bug-investigation
2. code-review
3. docs-rewrite
4. frontend-qa
5. release-check
```

---

# Part 3. Hooks: AI 행동을 자동으로 막기

## 3-1. Hook이 필요한 이유

규칙은 AI가 잊을 수 있다.

Hook은 도구 실행 전후에 외부 명령을 실행해서 자동으로 막거나 기록한다.

Claude Code 공식 문서 기준으로 hooks는 설정 파일에 둔다.

대표 위치:

- `~/.claude/settings.json`
- `.claude/settings.json`
- `.claude/settings.local.json`

대표 이벤트:

- `PreToolUse`
- `PostToolUse`
- `UserPromptSubmit`
- `Stop`
- `SubagentStop`

쉽게 말하면 이런 식이다.

```txt
AI가 Bash 명령을 실행하려고 함
  → PreToolUse hook 실행
  → 위험 명령이면 차단
  → 안전하면 실행
```

## 3-2. 오늘 할 일: 위험 명령 차단 Hook 만들기

디렉토리를 만든다.

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
        permissionDecision: "deny",
        permissionDecisionReason: `Blocked dangerous command: ${matched}`,
      }),
    );
    return;
  }

  console.log(JSON.stringify({}));
});
```

## 3-3. 실습

AI에게 일부러 위험한 명령을 실행하게 하지 말고, 이렇게 물어본다.

```txt
이 프로젝트에서 git reset --hard를 실행하면 안 되는 이유를 설명해줘.
그리고 Hook으로 어떻게 막을 수 있는지 현재 설정을 확인해줘.
```

실제로 위험 명령을 실행하는 테스트는 하지 않는다.

## 3-4. Hook으로 막을 만한 것들

처음에는 이것만 막아도 충분하다.

```txt
1. destructive git command
2. rm -rf
3. secret 출력
4. production DB write
5. 대량 파일 수정
```

고급으로 가면 `PostToolUse`에서 자동 검증도 가능하다.

예:

- MDX 수정 후 prettier 실행
- TypeScript 파일 수정 후 `npx tsc --noEmit`
- 특정 폴더 수정 후 테스트 실행

하지만 처음부터 너무 많이 자동화하면 느려진다.  
Hook은 안전장치부터 만든다.

---

# Part 4. Subagents: 일을 나눠 맡기기

## 4-1. Subagent의 핵심

Subagent는 별도 컨텍스트를 가진 전문 작업자다.

공식 문서 기준으로 subagent는:

- 특정 목적을 가진다.
- 별도 context window를 쓴다.
- 허용 tool을 제한할 수 있다.
- project-level과 user-level로 나눌 수 있다.

위치는 보통 이렇다.

```txt
.claude/agents/
  code-reviewer.md

~/.claude/agents/
  personal-helper.md
```

프로젝트 agent가 user agent보다 우선한다.

## 4-2. 언제 subagent를 쓰는가

써도 되는 경우:

- 코드 리뷰
- 테스트 실패 로그 분석
- 보안 체크
- 문서 톤 점검
- 여러 파일 탐색
- 병렬 조사

쓰지 않는 게 좋은 경우:

- 바로 내가 다음 작업을 해야 하는 핵심 구현
- 요구사항이 아직 불명확한 작업
- 파일 충돌 가능성이 높은 작업
- 결과를 기다려야만 진행 가능한 작업

핵심은 이것이다.

**subagent는 일을 대신하는 도구라기보다 컨텍스트를 격리하는 도구다.**

## 4-3. 오늘 할 일: code-reviewer 만들기

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

## 4-4. 실습 프롬프트

```txt
Use the code-reviewer subagent to review my latest changes.
Do not edit files. Report only findings.
```

좋은 결과:

- 수정하지 않는다.
- 파일/라인 근거를 준다.
- 버그와 누락 테스트를 먼저 본다.

나쁜 결과:

- 스타일 취향만 말한다.
- 직접 파일을 수정한다.
- 근거 없이 "좋아 보입니다"라고 한다.

---

# Part 5. MCP: 외부 도구 연결하기

## 5-1. MCP가 하는 일

MCP는 Model Context Protocol이다.

쉽게 말하면 AI 도구와 외부 시스템을 연결하는 표준 인터페이스다.

예:

- GitHub 이슈 읽기
- PR 코멘트 읽기
- DB schema 조회
- 브라우저 조작
- 문서 시스템 검색
- Slack/Jira/Sentry 연결

Claude Code에서는 MCP 서버를 추가하고 `/mcp`로 상태를 확인할 수 있다.

공식 문서 기준 명령 예:

```bash
claude mcp list
claude mcp get github
claude mcp remove github
```

## 5-2. MCP는 강력하지만 위험하다

MCP는 AI에게 손과 발을 달아주는 기능이다.

읽기 권한은 편하다.  
쓰기 권한은 위험하다.

특히 조심할 것:

- DB write
- GitHub issue/PR write
- cloud resource 변경
- secret 접근
- filesystem write

원칙은 간단하다.

```txt
처음에는 read-only
그다음 scope 제한
그다음 hook/approval 추가
마지막에 write 허용
```

## 5-3. 오늘 할 일: MCP 접근 정책 문서 만들기

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

## 5-4. MCP 실습 순서

처음부터 DB를 연결하지 않는다.

추천 순서:

```txt
1. local docs read
2. GitHub read
3. browser/screenshot
4. DB schema read
5. limited write with approval
```

이 순서가 안전하다.

---

# Part 6. Plugins: 팀에 배포하기

## 6-1. Plugin은 언제 필요한가

처음에는 `.claude/` 디렉토리만으로 충분하다.

Plugin은 다음 단계다.

필요한 경우:

- 여러 프로젝트에서 같은 skill을 쓴다.
- 팀원에게 같은 agent를 배포하고 싶다.
- hooks와 MCP 설정을 묶어서 버전 관리하고 싶다.
- 사내 AI 워크플로우를 표준화하고 싶다.

Claude Code 공식 문서 기준 plugin은 skills, agents, hooks, MCP servers를 묶을 수 있다.

## 6-2. Plugin 기본 구조

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

`.claude-plugin/` 안에는 plugin metadata만 둔다.  
`skills/`, `agents/`, `hooks/`는 plugin root에 둔다.

## 6-3. 오늘 할 일: plugin 후보 정리

아직 plugin을 만들지 말고 후보만 정한다.

```md
# Plugin Candidate

## Shared Skills

- code-review
- bug-investigation
- release-check

## Shared Agents

- code-reviewer
- test-runner
- docs-editor

## Shared Hooks

- block-dangerous-bash
- log-edits
- require-verification-before-stop

## MCP

- github-readonly
- docs-search
```

Plugin은 너무 일찍 만들면 구조가 굳어서 오히려 불편하다.  
먼저 `.claude/`에서 충분히 써보고, 반복되는 것만 plugin으로 뽑는다.

---

# Part 7. 네 가지 워크플로우 만들기

이제 계층을 배웠으니 실제 작업 흐름으로 묶는다.

최소 네 가지 workflow를 만든다.

```txt
1. feature-development
2. bugfix
3. code-review
4. release
```

## 7-1. Feature Development

```md
# Feature Development Workflow

## Intake

- 요구사항을 한 문단으로 요약한다.
- 수정 범위를 정한다.
- 건드리지 말아야 할 파일을 정한다.

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

## 7-2. Bugfix

```md
# Bugfix Workflow

## Rule

Do not fix before reproducing.

## Steps

1. 증상을 재현한다.
2. 기대 동작을 적는다.
3. 관련 코드 경로를 찾는다.
4. 하나의 가설을 세운다.
5. 최소 수정한다.
6. 원래 실패하던 검증을 다시 실행한다.
```

## 7-3. Code Review

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

## 7-4. Release

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

---

# Part 8. 최종 실습 프로젝트

마지막으로 아래 구조를 만든다.

```txt
ai-harness-lab/
  README.md
  CLAUDE.md
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
    MCP_POLICY.md
    workflows/
      feature-development.md
      bugfix.md
      code-review.md
      release.md
```

완료 조건:

- AI가 프로젝트 규칙을 읽는다.
- 버그 수정 시 skill 절차를 따른다.
- 위험 명령이 hook으로 막힌다.
- code-reviewer subagent가 리뷰만 한다.
- MCP policy가 write 권한을 제한한다.
- workflow 문서대로 feature 작업을 수행한다.

---

# Part 9. 내 프로젝트에 바로 적용하는 순서

이 블로그 프로젝트에 적용한다면 순서는 이렇게 간다.

## Step 1. 현재 `AGENTS.md` 정리

이미 잘 되어 있다.

추가하면 좋은 것:

- 완료 전 검증 체크리스트를 더 짧게 요약
- 문서 작업과 코드 작업 검증 분리
- AI 하네스 관련 문서 위치 추가

## Step 2. 문서 작업 Skill 만들기

블로그 포스트 재작성 작업이 많으므로 `docs-rewrite` skill이 유용하다.

## Step 3. Hook은 나중에

지금은 Codex 환경의 sandbox와 승인 규칙이 이미 강하게 작동한다. Claude Code를 직접 쓸 때 `.claude/settings.json`으로 옮긴다.

## Step 4. Subagent는 reviewer부터

가장 안전한 subagent는 reviewer다.

수정 권한을 주지 않고 읽기/검색만 허용한다.

## Step 5. MCP는 GitHub read-only부터

DB보다 GitHub/문서 검색이 먼저다.

Supabase는 read-only 정책과 secret 관리가 정리된 뒤 연결한다.

---

# Part 10. 학습 체크리스트

아래 질문에 답할 수 있으면 강의 핵심은 거의 익힌 것이다.

## Memory

- `CLAUDE.md`와 Skill의 차이를 설명할 수 있는가?
- 항상 로드할 규칙과 필요할 때만 로드할 문서를 나눌 수 있는가?

## Skills

- 반복 작업을 단계별 절차로 만들 수 있는가?
- Skill의 완료 조건을 검증 명령으로 쓸 수 있는가?

## Hooks

- 위험한 tool call을 실행 전에 막을 수 있는가?
- hook이 너무 무거워지면 어떤 문제가 생기는가?

## Subagents

- subagent를 써야 하는 작업과 쓰면 안 되는 작업을 구분할 수 있는가?
- subagent에게 파일 수정 권한을 줄 때 범위를 제한할 수 있는가?

## MCP

- read-only와 write 권한을 분리할 수 있는가?
- MCP tool output에 secret이 섞일 위험을 설명할 수 있는가?

## Plugins

- standalone `.claude/` 설정과 plugin의 차이를 설명할 수 있는가?
- 팀에 배포할 만한 skill/agent/hook을 고를 수 있는가?

---

# Part 11. 참고 자료

공식 문서 위주로 보면 된다.

- Claude Code 확장 개요: https://code.claude.com/docs/en/features-overview
- Claude Code Memory: https://docs.claude.com/en/docs/claude-code/memory
- Claude Code Hooks: https://docs.claude.com/en/docs/claude-code/hooks
- Claude Code Subagents: https://docs.claude.com/en/docs/claude-code/subagents
- Claude Code MCP: https://docs.claude.com/en/docs/claude-code/mcp
- Claude Code Plugins: https://docs.claude.com/en/docs/claude-code/plugins
- MCP 공식 문서: https://modelcontextprotocol.io

---

# 마지막 정리

하네스 엔지니어링은 거창한 이름이지만, 핵심은 단순하다.

```txt
규칙은 Memory에 둔다.
절차는 Skills에 둔다.
위험은 Hooks로 막는다.
큰 작업은 Subagents로 격리한다.
외부 도구는 MCP로 연결하되 권한을 제한한다.
반복 배포할 것은 Plugins로 묶는다.
```

AI를 잘 쓰는 사람은 프롬프트를 예쁘게 쓰는 사람이 아니다.

AI가 실수할 수 있다는 전제로 작업 구조를 만들고, 검증 가능한 증거가 나오기 전까지 완료를 믿지 않는 사람이다.
