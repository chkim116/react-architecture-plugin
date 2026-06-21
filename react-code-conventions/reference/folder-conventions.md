# Folder Conventions

## 프로젝트 루트 구조

| 디렉토리 | 설명 |
|----------|------|
| `src/features/` | Feature 구현 (PascalCase) |
| `src/shared/` | 여러 feature가 공유하는 횡단관심사 (도메인 인지 가능) |
| `src/external/` | 외부 연동 (API, Storage 등) |
| `src/core/` | 무의존·non-React 원시 모듈/config (env, storage factory 등) |

## Import 경로

- 프로젝트 안의 모듈을 가져올 때는 **항상 `@/` 절대경로**를 쓴다 (`@`는 `src/`를 가리킨다).
- 상대경로(`./`, `../`)나 중복 별칭(`src/` 같은 추가 별칭)은 쓰지 않는다 — 별칭은 `@` 하나만 둔다.

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
| `storages/` | 도메인별 스토리지 (`{도메인}.storage.ts`, [storage.md](./storage.md)) |

## Core 모듈 철학

> Core는 고정된 폴더·네이밍 규칙이 있는 레이어가 아니다. **"무엇이 core인가"를 판단하는 철학**으로 관리한다. 대표 모듈 목록과 래핑 경계는 [modules.md](./modules.md) 참조.

- **무의존**: 상위 레이어(features·shared·external)를 import 하지 않는다. (npm 라이브러리·다른 core 모듈은 무방) 자기 완결적이다.
- **프레임워크 무관(non-React)**: React/Next/router에 기대지 않는 순수 TS. External 포함 어디서든 쓸 수 있다.
- **도메인 무지**: 특정 Feature·비즈니스를 모른다. 환경·저장소·네트워크 같은 기반만 다룬다.
- 대표 예: `env-config.ts`, `storage.ts` (`createStorage`)

**먼저: 직접 만든 모듈인가, 설치형인가** — 설치해 쓰는 외부 라이브러리는 모듈이 아니다 → [packages.md](./packages.md)로 분류한다. 직접 만든 모듈이면 아래 core/shared 판단으로 간다.

**판단 기준 (core vs shared)** — 본질은 "도메인을 아는가"다
- **특정 도메인/비즈니스를 알거나, 여러 feature가 공유하는 횡단관심사** → `shared` (도메인 인지 O, React든 아니든)
- **도메인 무지 기술 기반** (env·storage·http 같은 순수 원시) → `core` (무의존·non-React. core가 axios·zod 등 npm 라이브러리·다른 core 모듈 import은 무방)
- 결정타: **External이 import 해야 하면** 무조건 `core` (안 그러면 `external → shared` 역방향)

**core 안 정리** — 외부 라이브러리별로 **폴더를 묶어** 둘 수 있다 (`core/<라이브러리>/`).
- 예: `core/supabase/`에 클라이언트(`index.ts`)와 자동 **생성 타입**(`database.types.ts`)을 함께 둔다.
- 자동 생성 타입(supabase `database.types` 등)은 그 타입을 쓰는 클라이언트와 **같은 폴더**에 둔다.
- 설정·단일 유틸(`env-config.ts` 등)은 폴더 없이 `core/` 바로 아래 둬도 된다.

## Shared 승격 기준 — "2개 이상 feature 소비할 때만"

`shared/`는 **여러 feature가 공유하는** 것. 정당성은 성격이 아니라 **실제 소비 feature가 2개 이상인가**로 정한다.

- **단일 feature만 소비하면 그 feature로 내린다** (util·component여도 — 추정 재사용 금지, [abstraction.md](../../common-code-conventions/reference/abstraction.md)).
- **이동 시 `Shared` prefix도 뗀다** (`SharedFeedBannerAd` → `HomeFeedBannerAd`). 이름=위치 일치.
- **승격 전 소비처를 `grep`으로 센다.** 성격만 보고 올리면 오분류.

> **tie-breaker**: [modules.md](./modules.md)의 표준 모듈(`useLoading` 등)은 단일 소비여도 지정 위치 고정. **표준 모듈 규칙 > 2+ 소비 규칙.**

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

> SubFeature가 없거나 "Index"인 경우, 네이밍에서 생략합니다. common/의 경우 `Common`이 SubFeature 자리를 차지합니다 — `{Feature}Common{역할}`. 다단계 구조에서 common이 하위 그룹(SubFeature)에 속하면 그 경로를 앞에 붙입니다 — `{Feature}{SubFeature}Common{역할}`.

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
