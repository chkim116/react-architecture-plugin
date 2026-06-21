---
name: react-conventions
description: React 프로젝트 코드 작성 시 사용. 컴포넌트, 훅, API, 상태관리, 폴더구조 등 React 공통 컨벤션 로드맵.
---

# React Code Conventions

## 항상 적용되는 공통 규칙

모든 작업에 적용. 반드시 먼저 읽을 것:
- `common-code-conventions/reference/code-style.md` — if문 중괄호, 변수명 축약 금지 등
- `common-code-conventions/reference/abstraction.md` — 추상화 판단 원칙
- `common-code-conventions/reference/utilities.md` — 유틸리티는 es-toolkit 우선

## 시작 전 확인 (필수)

- `react-code-conventions/reference/packages.md`의 패키지를 기본값으로 사용한다. 작업 시작 전에 목록을 확인하고 없으면 설치한다.
- 공용 기능은 `react-code-conventions/reference/modules.md`의 모듈을 그대로 사용한다 — 같은 기능을 새로 만들지 않는다.
- 둘 다 사용자가 다른 선택을 명시하면 그 선택을 따른다.

## 신규 기능 워크플로우

기능 하나를 만들 때 아래 순서로 진행한다. 각 단계의 상세 규칙은 "작업 유형별 참조 문서" 표에서 해당 행의 문서를 열어 확인한다. 해당 없는 단계는 건너뛰되, 단계에 해당하면 그 문서 확인을 빠뜨리지 않는다.

1. **준비** — 공통 규칙 3종과 "시작 전 확인"(packages·modules)을 먼저 확인한다.
2. **레이어 결정** — 만들 코드가 어느 레이어인지 먼저 정한다: feature(도메인 로직·UI 조합) / shared(여러 feature 공유 횡단관심사) / external(API·Storage 등 외부 I/O) / core(무의존 non-React 원시). 의존은 `features → shared → external → core` 한 방향뿐 — 역방향 import 금지. (core·shared 판단 기준은 folder-conventions, folder-structure)
3. **위치 결정** — feature 레이어면 Feature / SubFeature / common 중 어디에, 그 안 어느 폴더(containers·components·hooks…)에 둘지 정한다.
4. **데이터 흐름** — API 함수·타입 정의(external) → 서버 응답을 UI 모델로 변환(feature) → React Query 훅 작성.
5. **컴포넌트 설계** — Page Entry → Container → UI Component 단방향(역방향·순환 의존 금지)으로 분리하고, 컴포넌트 내부 코드 순서를 지킨다.
6. **상호작용** — 이벤트 핸들러·props 네이밍, 필요한 커스텀 훅·상태 관리·useEffect.
7. **안전장치** — 에러 처리, 중복 클릭 방지.
8. **마무리** — 상수·Context 정리, interface/type JSDoc 작성.

> 순서는 의존성 기준 권장안이다 — 레이어/데이터가 UI보다 먼저다. 단계는 건너뛸 수 있어도, 해당하는 단계의 컨벤션 문서 확인은 생략하지 않는다.

## 리팩토링 워크플로우

기존 코드를 고칠 때는 위 워크플로우 대신 아래를 따른다. 핵심은 **동작 보존**과 **구조 우선**이다.

1. **현황 파악** — 무엇을 왜 바꾸는지 정하고, 현재 코드의 실제 동작·입력 데이터부터 확인한다. 추측으로 시작하지 않는다.
2. **진단** — 어떤 컨벤션이 깨졌는지 짚는다: 레이어 의존 방향 위반 / 잘못된 위치(레이어·폴더) / Container·Component 책임 혼재 / 새는·과도한 추상화.
3. **구조 우선** — 추상화·커스텀 훅 추출보다 **책임 분리(구조적 리팩토링)를 먼저** 한다. 잘못된 추상화는 풀어 호출부에 인라인하는 편이 낫다 — "새는 추상화보다 중복이 낫다". 역방향 의존은 "누가 정할 값인지"로 푼다(부르는 쪽 값 → 인자 주입 / 도메인 모르는 공용 설비 → core로 내림).
4. **작게·동작 보존** — 한 번에 하나씩, 관찰 가능한 동작을 유지한다. 옛·새 구조가 섞인 중간 상태로 두지 않는다.
5. **검증 + self-review** — 타입·린트·동작 + 변경 전후 동등성을 확인한 뒤, 아래 **"작업 유형별 참조 문서" 매트릭스를 한 줄씩 훑어 빠뜨린 컨벤션이 없는지 self-review**한다(버그뿐 아니라 *컨벤션 축*으로도).

> 추상화·훅 추출 판단은 abstraction, custom-hooks, component-architecture 문서를, 레이어 정리는 folder-structure를 연다.

> **검증 ≠ 코드 완성**: 스킬 검증용 리팩토링은 *새 발견이 멈추면* 종료한다 — 잔여 파일을 다 고치려 들지 않는다(반복 확인뿐이면 멈춤). 단 사용자가 "전체 리팩토링"을 명시하면 다른 트랙.

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
| 공용 모듈(core 무의존 원시 / shared 횡단관심사) 확인 | `react-code-conventions/reference/modules.md` |
| localStorage/sessionStorage 사용 | `react-code-conventions/reference/storage.md` |
| 환경변수 사용 | `react-code-conventions/reference/env.md` |

> 경로는 플러그인 루트 기준 상대경로.
> 라우팅 작업은 react-router-conventions 또는 nextjs-conventions 스킬 참조.
