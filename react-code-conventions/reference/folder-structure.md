# Folder Structure

## 1. Codemap - 빠른 참조

### 1.1 Feature 찾기
- 모든 Feature는 `src/features/{FeatureName}/`에 위치
- 디렉터리명 = Feature명 (PascalCase)

## 2. Layers & Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│                     Feature Layer                           │
│  src/features/{Feature}/                                         │
│  역할: 도메인별 비즈니스 로직, UI 조합                        │
├─────────────────────────────────────────────────────────────┤
│                     Shared Layer                            │
│  src/shared/                                                │
│  역할: 여러 feature가 공유하는 횡단관심사 (도메인 인지)      │
├─────────────────────────────────────────────────────────────┤
│                    External Layer                           │
│  src/external/                                              │
│  역할: 외부 시스템 I/O (API, Storage, AppBridge)             │
├─────────────────────────────────────────────────────────────┤
│                      Core Layer                             │
│  src/core/                                                  │
│  역할: 무의존·non-React 원시 모듈/config (env, storage factory) │
└─────────────────────────────────────────────────────────────┘
```

### 레이어별 규칙

| 레이어 | 의존 가능 | 의존 불가 |
|--------|----------|----------|
| **Feature** | Shared, External, Core | 다른 Feature |
| **Shared** | External, Core | Feature |
| **External** | Core | Shared, Feature |
| **Core** | (없음) | External, Shared, Feature |

## 4. Architectural Invariants
> 이 규칙들은 코드베이스 전반에서 **반드시 지켜져야 하는 불변식**입니다.

### 주요 개념 정리
- **비즈니스 로직**: 도메인 규칙에 따른 조건 분기 및 결정 (예: 퍼널 상태에 따른 화면 결정)
- **사이드 이펙트**: 외부 시스템과의 상호작용 실행 (예: 서버 통신, 로깅, 네비게이션)
- **UI 로직**: 화면 표현을 위한 상태 관리 (예: input value, modal open/close)

### 4.1 의존성 규칙

1. **Feature는 서로 독립적이다**
   - `src/features/GuideTab/`은 `src/features/Viral/`을 import 불가
   - 공통 로직이 필요하면 `src/shared/`로 올림
   - subFeature 공통 로직이 필요하면 `src/features/{FeatureName}/common/`로 올림.
2. **External은 순수 I/O 레이어다**
   - `external/apis/`는 HTTP 호출만 담당
   - React 코드, 비즈니스 로직 포함 금지
   - 필요한 데이터 변환은 Feature에서 수행
3. **Core는 무의존 원시 레이어다**
   - `src/core/`는 상위 레이어(features·shared·external)를 import 하지 않는다 (내부 의존 0). npm 라이브러리·다른 core 모듈은 무방
   - non-React 순수 모듈/config만 위치 (`envConfig`, `createStorage` 팩토리 등)
   - External도 Core를 의존하므로 (예: API base URL), External보다 아래에 둔다
4. **역방향 의존성 금지**
   - 의존성 방향: `features → shared → external → core`
   - `shared/` → `features/` import 금지
   - `external/` → `features/` import 금지
   - `external/` → `shared/` import 금지, `external/` → `core/` import 허용 (인프라 원시 모듈: createStorage, envConfig 등)
   - `core/`는 어떤 레이어도 import 하지 않음 (무의존)
5. **역방향 의존이 생기면 "누가 정하는 값인지" 본다**
   - 아래 레이어가 위 레이어 것을 가져다 써서 역방향 import가 생겼다면, 그게 **부르는 쪽이 정할 값**인지 **공용 설비**인지부터 본다.

   | 무엇을 가져왔나 | 어떻게 푸나 |
   |------|------|
   | **부르는 쪽이 정할 값·맥락** — 오늘 날짜, 신규 코인 30처럼 그때그때 정해지는 값 | 아래 레이어는 **함수 인자로 받기만** 하고, 부르는 쪽이 넘긴다. 값 만드는 코드는 원래 자리(shared)에 그대로 둔다 |
   | **도메인 모르는 공용 설비** — DB·HTTP 클라이언트, 저장소(storage) | **core로 내린다** (external이 쓸 수 있는 레이어는 core뿐이므로) |

   - "external이 가져다 쓰니까 core" 규칙은 **공용 설비일 때만** 맞다. 부르는 쪽이 정할 값을 core로 올리면 얼핏 맞아 보여도 틀린 선택이다.
   - 예: external API가 "오늘 날짜"로 조회한다면 — 오늘 날짜는 부르는 쪽이 정할 값이다. API가 날짜를 인자로 받게 하고 부르는 쪽이 넘긴다(날짜 만드는 함수는 shared에 그대로). 신규 유저 코인 같은 고정 숫자도 마찬가지로 인자로 넘긴다.
   - core와 external 사이에서도 같다: [modules.md](./modules.md) §core 래핑 경계의 "주입(넘겨주기)" 주의 참조.

### 4.2 컴포넌트 규칙

1. **의존성 규칙**
   - UI Component <- Container Component <- Page Entry Component 순으로 의존성이 있어야 함.
   - 역방향, 순환 의존성 금지
2. **Page Entry Component**
   - 페이지의 진입점 컴포넌트
   - Container Component, UI Component를 오케스트레이션 함.
3. **Container Component**
   - 데이터 페칭, 사이드이펙트, 비즈니스 로직을 처리하는 컴포넌트
   - UI Component로 단방향 데이터 흐름을 가짐.
   - 동일 Feature에 있는 Container Component를 import 할 수 있음.
4. **UI Component**
   - 데이터 페칭, 사이드이펙트, 비즈니스 로직을 UI Component에서 다뤄선 안됨.
   - props만으로 동작하는 순수 UI
   - 다음 상황일때 상태를 가질 수 있음.
     - 화면 표현을 위해 사용자의 입력을 처리할 필요가 있을 때
     - Container가 요구하는 형식으로 값을 정제해서 전달해야 할 때 (예: input의 number → 포맷된 금액 문자열)
   - Container Component import 불가

### 4.3 데이터 규칙

1. **API 타입 ≠ 도메인 모델**
   - API 응답 타입과 UI에서 사용하는 모델을 분리
   - API 응답 → UI 모델 변환은 각 Feature에서 처리함.
   - API 응답 타입으로 UI를 구성하기 위해 어떠한 전처리도 필요하지 않다면 반드시 도메인 모델로 변환해서 사용할 필요는 없음.
2. **데이터 페칭은 ReactQuery를 이용함**
    - GET 요청은 React Query를 이용함.
    - useMutation은 사용하지 않음. 대신 Container, Hook에서 external에 있는 API를 직접 호출하여 사용.

### 4.4 Hook 규칙

1. **Custom Hook을 남용하지 않음**
    - 비즈니스 로직, 사이드 이펙트 → Container
    - UI 로직 → Container 또는 Component
    - Custom Hook 추출은 컴포넌트 리팩토링이 우선
2. **Custom Hook 추출 기준**
    - Container/Component가 너무 많은 책임을 질 때 추출 고려
    - 추상화 품질 기준은 **섹션 4.5** 참조

### 4.5 추상화 규칙

> **핵심**: 내부를 알아야 유지보수가 가능하다면, 그건 올바른 추상화가 아니다.

#### 판단 기준
| 질문 | 답변 | 결론 |
|------|------|------|
| 내부를 몰라도 사용 가능한가? | Yes | ✅ 올바른 추상화 |
| 내부를 알아야 유지보수가 가능한가? | Yes | ❌ 새는 추상화 |
| 숨겼더니 오히려 복잡해졌는가? | Yes | ❌ 풀어놓는 게 낫다 |

#### 적용 대상
- Custom Hook → 상세: `references/custom-hooks.md`
- 유틸리티 함수
- 래퍼 컴포넌트

#### 대응 원칙
1. **추상화는 복잡성을 줄일 때만 의미가 있다**
2. **숨겼을 때 오히려 복잡해지는 로직은 풀어놓는다**
3. **새는 추상화보다 중복 코드가 낫다**