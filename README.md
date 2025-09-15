# 개발 블로그

Next.js 15와 Contentlayer를 사용한 현대적인 블로그입니다.

## 🚀 기술 스택

- **Next.js 15** - React 기반 풀스택 프레임워크
- **Contentlayer2** - MDX 파일 관리 및 타입 안전성
- **Tailwind CSS 4** - 유틸리티 우선 CSS 프레임워크
- **TypeScript** - 타입 안전성
- **MDX** - 마크다운으로 풍부한 콘텐츠 작성

## 🏃‍♂️ 시작하기

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

### 새 포스트 작성

`content/` 디렉토리에 `.mdx` 파일을 생성하세요:

```markdown
---
title: "포스트 제목"
description: "포스트 설명"
date: "2025-09-15"
tags: ["태그1", "태그2"]
---

# 포스트 내용

여기에 마크다운으로 내용을 작성하세요!
```

## 📦 빌드 및 배포

### 빌드

```bash
npm run build
```

### 로컬 프로덕션 서버

```bash
npm start
```

### 배포

- **Vercel**: GitHub 저장소 연결로 자동 배포
- **GitHub Pages**: Actions를 통한 정적 사이트 배포
- **Netlify**: 드래그 앤 드롭 또는 Git 연결

## 📝 특징

- ✅ 정적 사이트 생성 (SSG)
- ✅ 반응형 디자인
- ✅ 다크모드 지원
- ✅ 타입 안전한 MDX
- ✅ 한국어 지원
- ✅ SEO 최적화
