---
name: react-native-conventions
description: React Native(Expo) 프로젝트 코드 작성 시 사용. 코어 컴포넌트, 스타일링, Expo Router 네비게이션, 플랫폼 분기 등 RN 특화 컨벤션 로드맵.
---

# React Native Code Conventions

React Native는 React 위에 올라간다. 컴포넌트 설계·훅·React Query·데이터 모델링·폴더 구조는 **react-conventions를 그대로 따르고**, 이 스킬은 RN에서 웹과 달라지는 부분(코어 컴포넌트·스타일·네비게이션·플랫폼)만 더한다.

## 항상 적용되는 공통 규칙

- `common-code-conventions/reference/code-style.md`
- `common-code-conventions/reference/abstraction.md`
- `common-code-conventions/reference/utilities.md`

## 시작 전 확인 (필수)

- `react-native-conventions/reference/packages.md`의 패키지(Expo·Expo Router·StyleSheet 기반)를 기본값으로 사용한다. 작업 시작 전에 목록을 확인하고 없으면 설치한다.
- 공용 기능은 `react-code-conventions/reference/modules.md`의 모듈을 그대로 사용한다 — 같은 기능을 새로 만들지 않는다.
- 둘 다 사용자가 다른 선택을 명시하면 그 선택을 따른다.

## 신규 기능 워크플로우

기능 하나를 만들 때 아래 순서로 진행한다. react-conventions 워크플로우와 같은 골격에 **RN 단계(코어 컴포넌트·스타일·플랫폼)**가 더해진 형태다. 각 단계의 상세는 이 스킬과 react-conventions의 "작업 유형별 참조 문서" 표에서 해당 문서를 연다. 해당 없는 단계는 건너뛰되, 단계에 해당하면 그 문서 확인을 빠뜨리지 않는다.

1. **준비** — 공통 규칙과 "시작 전 확인"(packages·modules)을 먼저 확인한다.
2. **레이어 결정** — feature / shared / external / core 중 어디인지 정한다. 의존은 `features → shared → external → core` 한 방향뿐 — 역방향 import 금지.
3. **위치 결정** — feature 레이어면 Feature / SubFeature / common + 폴더를 정한다.
4. **데이터 흐름** — API 함수·타입 정의(external) → 서버 응답을 UI 모델로 변환(feature) → React Query 훅. (react-conventions와 동일)
5. **화면·네비게이션** — Expo Router `app/` 경로·레이아웃(`_layout.tsx`)을 정하고 화면 진입점을 만든다.
6. **컴포넌트 설계** — Screen(Page) Entry → Container → UI Component 단방향(역·순환 의존 금지)으로 분리한다. 화면은 RN 코어 컴포넌트(View·Text·Pressable)로 그리고 웹 HTML 태그는 쓰지 않는다.
7. **스타일** — `StyleSheet.create`로 스타일을 분리하고, 플랫폼 분기·안전영역(SafeArea)·키보드를 챙긴다.
8. **상호작용** — 이벤트 핸들러(`onPress`·`onChangeText`)·props 네이밍, 필요한 커스텀 훅·상태 관리·useEffect.
9. **안전장치** — 에러 처리, 중복 탭(클릭) 방지.
10. **마무리** — 상수·Context 정리, interface/type JSDoc 작성.

> 순서는 의존성 기준 권장안이다 — 레이어/데이터가 UI보다 먼저다. 단계는 건너뛸 수 있어도, 해당하는 단계의 컨벤션 문서 확인은 생략하지 않는다.

> 리팩토링은 react-conventions의 **리팩토링 워크플로우**(동작 보존·구조 우선)를 따른다. 웹 태그 → RN 코어 컴포넌트 치환, 인라인 스타일 → `StyleSheet` 분리, `.map()` 목록 → 가상화 리스트 전환이 RN에서 자주 나오는 구조 교정이다.

## 작업 유형별 참조 문서 (RN 특화)

| 작업 | 참조 파일 |
|------|-----------|
| 코어 컴포넌트(View/Text/Pressable), 웹 태그 대체 | `react-native-conventions/reference/core-components.md` |
| 스타일 작성(StyleSheet), 디자인 토큰 | `react-native-conventions/reference/styling.md` |
| 화면 라우팅·네비게이션(Expo Router) | `react-native-conventions/reference/navigation.md` |
| 플랫폼 분기·안전영역·키보드 | `react-native-conventions/reference/platform-specific.md` |
| 목록 렌더링(FlatList/FlashList) | `react-native-conventions/reference/lists.md` |
| 스토리지(MMKV) | `react-native-conventions/reference/storage.md` |
| 사용 패키지 확인 | `react-native-conventions/reference/packages.md` |
| 공용 모듈 확인 | `react-code-conventions/reference/modules.md` |

> 경로는 플러그인 루트 기준 상대경로.
> 컴포넌트 아키텍처·커스텀 훅·React Query·데이터 모델링·폴더 구조·에러 처리·상수·JSDoc 등 React 공통 규칙은 react-conventions 스킬을 함께 참조한다.
