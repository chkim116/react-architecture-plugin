---
name: react-conventions
description: React 프로젝트 코드 작성 시 사용. 컴포넌트, 훅, API, 상태관리, 폴더구조 등 React 공통 컨벤션 로드맵.
---

# React Code Conventions

## 항상 적용되는 공통 규칙

모든 작업에 적용. 반드시 먼저 읽을 것:
- `common-code-conventions/reference/code-style.md` — if문 중괄호, 변수명 축약 금지 등
- `common-code-conventions/reference/abstraction.md` — 추상화 판단 원칙

## 작업 유형별 참조 문서

| 작업 | 참조 파일 |
|------|-----------|
| 폴더/파일 위치 결정 | `react-code-conventions/reference/folder-conventions.md`, `react-code-conventions/reference/folder-structure.md` |
| 컴포넌트 생성, Container/Component 분리 | `react-code-conventions/reference/component-architecture.md` |
| 컴포넌트 내부 코드 순서 | `react-code-conventions/reference/component-ordering-rules.md` |
| 이벤트 핸들러, props 네이밍 | `react-code-conventions/reference/handler-patterns.md` |
| Custom Hook 작성 | `react-code-conventions/reference/custom-hooks.md` |
| useEffect 작성 | `react-code-conventions/reference/use-effect-code-style.md` |
| useState, useRef 등 상태 관리 | `react-code-conventions/reference/react-state-management.md` |
| Context 사용 | `react-code-conventions/reference/contexts.md` |
| 상수 정의 | `react-code-conventions/reference/constants.md` |
| API 함수/타입 정의 | `react-code-conventions/reference/api-layer.md` |
| React Query 훅 작성 | `react-code-conventions/reference/queries.md` |
| 서버 응답 → UI 모델 변환 | `react-code-conventions/reference/data-modeling.md` |
| 에러 처리 | `react-code-conventions/reference/error-handling.md` |
| 중복 클릭 방지 | `react-code-conventions/reference/prevent-duplicated-click.md` |
| interface/type JSDoc | `react-code-conventions/reference/jsdoc.md` |
| 사용 패키지 확인 | `react-code-conventions/reference/packages.md` |
| 공용 모듈 확인 | `react-code-conventions/reference/shared-modules.md` |
| localStorage/sessionStorage 사용 | `react-code-conventions/reference/storage.md` |
| 환경변수 사용 | `react-code-conventions/reference/env-config.md` |

> 경로는 플러그인 루트 기준 상대경로.
> 라우팅 작업은 react-router-conventions 또는 nextjs-conventions 스킬 참조.
