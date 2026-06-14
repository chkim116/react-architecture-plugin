# Folder Conventions

## 프로젝트 루트 구조

| 디렉토리 | 설명 |
|----------|------|
| `src/features/` | Feature 구현 (PascalCase) |
| `src/shared/` | 공통 인프라 |
| `src/external/` | 외부 연동 (API, Storage 등) |

## Feature / SubFeature / Shared 폴더 구조

| 폴더 | 설명 | Feature | SubFeature | Shared |
|------|------|:-------:|:----------:|:------:|
| `index.tsx` | 진입점 | O | O | - |
| `containers/` | 비즈니스 로직 | O | O | O |
| `components/` | 순수 UI | O | O | O |
| `hooks/` | 커스텀 훅 | O | O | O |
| `queries/` | React Query | O | O | O |
| `models/` | 타입 정의 (`.model.ts`) | O | O | O |
| `constants/` | 상수 | O | O | O |
| `contexts/` | React Context | O | O | O |
| `utils/` | 순수 함수 | O | O | O |
| `common/` | SubFeature 공통 코드 | O | - | - |
| `kits/` | SDK-like 모듈 | - | - | O |

## External 폴더 구조

| 폴더/파일 | 설명 |
|-----------|------|
| `apis/` | API 클라이언트 |
| `apis/types/` | API 타입 (서버 응답 원본 타입, models에서 import 가능) |
| `storages/` | Feature별 스토리지 |

## Common

`common/` 폴더에는 동일 Feature 내 SubFeature들이 공유하는 코드를 정의합니다.

**역할**
- SubFeature 간 공유 컴포넌트, 훅, 모델, 상수 등 관리
- Feature 레벨에서만 존재 (SubFeature 내부에는 common/ 없음)

**폴더 구조**

```
src/features/GuideTab/
├── common/                    # SubFeature 공통 코드
│   ├── components/
│   ├── containers/
│   ├── hooks/
│   ├── models/
│   ├── queries/
│   ├── constants/
│   └── utils/
├── Index/                     # SubFeature
├── Activation/                # SubFeature
└── index.tsx
```

**네이밍 규칙**
| 구분 | 패턴 | 예시 |
|------|------|------|
| 컴포넌트 | `{Feature}Common{역할}.tsx` | `GuideTabCommonCardStack.tsx` |
| 훅 | `use{Feature}Common{동작}.ts` | `useGuideTabCommonCarousel.ts` |
| 모델 | `{feature}{subFeature}{역할}.model.ts` | `guideTabCommonActivation.model.ts` |
| 상수 | `{feature}{subFeature}{역할}.const.ts` | `guideTabCommonLog.const.ts` |

> SubFeature가 없거나 "Index"인 경우, 네이밍에서 생략합니다. common/의 경우 `Common`이 SubFeature 역할을 합니다.

**작성 규칙**
- 2개 이상의 SubFeature에서 사용될 때만 common/으로 이동
- 단일 SubFeature에서만 사용되면 해당 SubFeature 내부에 위치
- common/ 내부 폴더 구조는 일반 Feature 폴더 구조와 동일

**금지 의존성**
- 금지: 특정 SubFeature 코드 import (역방향 의존성)

## SubFeature가 있는 Feature 구조

Feature에 SubFeature가 존재하면, **Feature 루트에 직접 `containers/`, `components/` 등을 두지 않습니다.**
메인 페이지도 `Index/` SubFeature로 분리합니다.

**올바른 구조**

```
src/features/Home/Detail/
├── Index/                     # 메인 페이지 (SubFeature)
│   ├── index.tsx
│   ├── containers/
│   ├── components/
│   └── hooks/
├── Main/                # 다른 SubFeature
│   ├── Index/
│   └── Disclaimer/
└── common/                    # SubFeature 간 공유 코드
    ├── components/
    └── hooks/
```

**잘못된 구조 (금지)**

```
src/features/Home/Detail/
├── index.tsx                  # ❌ Feature 루트에 직접 진입점
├── containers/                # ❌ Feature 루트에 직접 폴더
├── components/                # ❌ Feature 루트에 직접 폴더
├── hooks/                     # ❌ Feature 루트에 직접 폴더
└── Main/                # SubFeature
```

**규칙**
- SubFeature가 1개라도 있으면, 메인 페이지는 `Index/` SubFeature로 분리
- Feature 루트에는 SubFeature 폴더와 `common/`만 존재
- Feature 루트에 `index.tsx` 직접 배치 금지 (SubFeature 내부에만 허용)

## Page Entry

Feature/SubFeature 폴더 루트에는 **오직 `index.tsx`만** 존재해야 합니다.

**역할**
- 진입점 컴포넌트 정의 및 라우팅 엔트리 포인트

**규칙**
- 폴더 루트에 `index.tsx` 외 다른 `.tsx`/`.ts` 파일 금지
- 모든 코드는 반드시 하위 폴더(`containers/`, `components/` 등)에 위치

**폴더 구조**

```
src/features/Home/
├── index.tsx              # 유일하게 허용되는 루트 파일
├── containers/
├── components/
├── queries/
├── models/
├── constants/
├── contexts/
├── hooks/
├── utils/
└── common/
```
