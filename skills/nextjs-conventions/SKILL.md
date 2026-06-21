---
name: nextjs-conventions
description: Next.js 프로젝트 코드 작성 시 사용. RSC/RCC 분리, 데이터 페칭 등 Next.js 특화 컨벤션 로드맵.
---

# Next.js Code Conventions

## 항상 적용되는 공통 규칙

- `common-code-conventions/reference/code-style.md`
- `common-code-conventions/reference/abstraction.md`
- `common-code-conventions/reference/utilities.md`

## 시작 전 확인 (필수)

- `next-js-code-conventions/reference/packages.md`의 패키지를 기본값으로 사용한다. 작업 시작 전에 목록을 확인하고 없으면 설치한다.
- 공용 기능은 `react-code-conventions/reference/modules.md`의 모듈을 그대로 사용한다 — 같은 기능을 새로 만들지 않는다.
- 둘 다 사용자가 다른 선택을 명시하면 그 선택을 따른다.

## 신규 기능 워크플로우

기능 하나를 만들 때 아래 순서로 진행한다. react-conventions 워크플로우와 같은 골격에 **Next.js 단계(4)와 데이터·컴포넌트의 RSC/RCC 규칙**이 더해진 형태다. 각 단계의 상세는 이 스킬과 react-conventions의 "작업 유형별 참조 문서" 표에서 해당 문서를 연다.

1. **준비** — 공통 규칙과 "시작 전 확인"(packages·modules)을 먼저 확인한다.
2. **레이어 결정** — feature / shared / external / core 중 어디인지 정한다. 의존은 `features → shared → external → core` 한 방향뿐 — 역방향 import 금지.
3. **위치 결정** — feature 레이어면 Feature / SubFeature / common + 폴더를 정한다.
4. **RSC/RCC 결정** — 클라이언트 로직(hooks·이벤트 핸들러)이 없으면 RSC(App Router 기본값), 있으면 RCC(`'use client'` 선언). 이 선택이 아래 데이터 페칭·Suspense 방식을 좌우한다.
5. **데이터 흐름** — external(API·스토리지)에서 가져와 UI 모델로 변환한다. GET만 React Query(`useSuspenseQuery`: RSC prefetch 가능 / `useQuery`: 앱브릿지·스토리지), POST·PUT·DELETE는 직접 호출. RSC에서 서버 전용으로 끝나는 GET은 일반 API 직접 `await` 허용. **어느 경우든 서버 응답은 데이터 모델링을 거친다.**
6. **컴포넌트 설계** — Page Entry → Container → UI Component 단방향(역·순환 의존 금지)으로 분리. RSC는 `QueriesHydration`을 `<Suspense>`로 감싸고, RCC는 `<Suspense clientOnly>`를 쓴다.
7. **상호작용** — 이벤트 핸들러·props 네이밍, 필요한 커스텀 훅·상태 관리·useEffect (RCC 한정).
8. **안전장치** — 에러 처리, 중복 클릭 방지.
9. **마무리** — 상수·Context 정리, interface/type JSDoc 작성.

> 순서는 의존성 기준 권장안이다 — 레이어/데이터가 UI보다 먼저다. 단계는 건너뛸 수 있어도, 해당하는 단계의 컨벤션 문서 확인은 생략하지 않는다.

> 리팩토링은 react-conventions의 **리팩토링 워크플로우**(동작 보존·구조 우선)를 따른다. RSC↔RCC 경계 변경 시 위 4·5단계의 RSC/RCC 규칙을 함께 적용한다.

## 작업 유형별 참조 문서

| 작업 | 참조 파일 |
|------|-----------|
| RSC/RCC 선택 기준, 데이터 페칭 | `next-js-code-conventions/reference/rsc-and-rcc-data-fetching.md` |
| 사용 패키지 확인 | `next-js-code-conventions/reference/packages.md` |
| 공용 모듈 확인 | `react-code-conventions/reference/modules.md` |

> React 공통 규칙도 함께 적용 — react-conventions 스킬 참조.
