
# Component Architecture

## 핵심 개념

### 비즈니스 로직 vs 사이드이펙트
| 구분 | 정의 | 예시 |
|------|------|------|
| **비즈니스 로직** | 도메인 규칙에 따른 데이터 변환/판단 | 금액 계산, 유효성 검증, 상태 매핑 |
| **사이드이펙트** | 외부 세계와의 상호작용 | `navigate()`, `api.post()`, `storage.set()` |

**핵심**: Container/Component 판단은 **사이드이펙트 유무**로 결정.

### 오케스트레이션

Page와 Container는 모두 오케스트레이션 역할을 수행한다.

- **Page (index.tsx)**: 여러 Container/Component 중 어떤 것을 렌더링할지 결정
- **Container**: 여러 Container/Component를 조합하여 렌더링

## Containers

`containers/` 폴더에는 비즈니스 로직과 데이터 관리를 담당하는 컴포넌트를 정의합니다.

**역할**
- 데이터 페칭, 사이드이펙트, 비즈니스 로직 처리
- Component로 단방향 데이터 흐름 제공

**네이밍 규칙**
| 구분 | 패턴 | 예시 |
|------|------|------|
| 파일명 | `{Feature}{SubFeature}{역할}Container.tsx` | `HeaderContainer.tsx` |
| 컴포넌트 | `{Feature}{SubFeature}{역할}Container` | `HeaderContainer` |
| Props | `{Feature}{SubFeature}{역할}ContainerProps` | `HeaderContainerProps` |

> SubFeature가 없거나 "Index"인 경우, 네이밍에서 생략합니다.

**작성 규칙**
- Container → Component 단방향 의존성
- 동일 Feature 내 다른 Container import 가능
- props를 통해 데이터/핸들러를 Component에 전달

**금지 의존성**

- 다른 Feature의 Container

```tsx
// HeaderContainer.tsx
'use client';
import { useHomeQuery } from '../queries/useHomeQuery';
import { Header } from '../components/Header';

export function HeaderContainer() {
  const { data } = useHomeQuery();

  const handleOpenCustomerService = () => {
    navigate('/customer-service');
  };

  return (
    <Header
      username={data.username}
      onCustomerServiceClick={handleOpenCustomerService}
    />
  );
}
```

## Components

`components/` 폴더에는 순수 UI 컴포넌트를 정의합니다.

**역할**
- props 기반 렌더링, 순수 UI 표현
- 로컬 UI 상태만 관리 (input value, modal open 등)

**네이밍 규칙**
| 구분 | 패턴 | 예시 |
|------|------|------|
| 파일명 | `{Feature}{SubFeature}{역할}.tsx` | `Header.tsx` |
| 컴포넌트 | `{Feature}{SubFeature}{역할}` | `Header` |
| Props | `{ComponentName}Props` | `HeaderProps` |

> SubFeature가 없거나 "Index"인 경우, 네이밍에서 생략합니다.

**작성 규칙**
- 비즈니스 로직, 데이터 페칭 금지
- 이벤트 핸들러는 props로 전달받음 (`on{Action}{EventName}` 패턴)
- UI 상태만 허용: 사용자 입력 처리, 값 포맷팅
- **하나의 파일에는 하나의 컴포넌트만 export** (Skeleton 포함 모든 컴포넌트)

**금지 의존성**
- Container, Queries, `external/` (단, `external/apis/types/`는 허용)

```tsx
// Header.tsx
'use client';
interface HeaderProps {
  username: string;
  onCustomerServiceClick: () => void;
}

export function Header({ username, onCustomerServiceClick }: HeaderProps) {
  return (
    <Top>
      <Top.Left>
        <Top.Title>{username}</Top.Title>
      </Top.Left>
      <Top.Right>
        <Top.Icon name="headset" onClick={onCustomerServiceClick} />
      </Top.Right>
    </Top>
  );
}
```

## Container vs Component 판단 기준

### Container로 판단하는 기준
| 신호 | 예시 |
|------|------|
| 사이드이펙트 발생 | `navigate()`, `api.post()`, `storage.set()` |
| 외부 스토리지 의존 | `Storage.get()`, `sessionStorage` |
| 조건부 라우팅 | visibility 기반 리다이렉트 |
**핵심**: 사이드이펙트가 있으면 Container입니다. 훅 종류는 무관합니다.

### Component로 판단하는 기준
- props만으로 동작 가능
- 렌더링 로직만 존재
- 외부 상태 변경 없음

### Component에서 외부 의존성 제거하기
| 상황 | 해결책 |
|------|--------|
| 외부 호출이 이벤트 핸들러 내부에서만 사용됨 | 핸들러를 props로 받도록 수정 → Component 유지 |
| 외부 호출이 렌더링 로직에 필수 | Container 생성 + Component 유지 (UI 분리) |
| 파일 전체가 비즈니스 로직 | Container로 이동 |

- **잘못된 접근:** 파일 전체를 Container로 이동
- **올바른 접근:** 외부 호출을 상위에서 주입받을 수 있는지 먼저 검토

### UI 분리 원칙
Container를 새로 만들 때 기존 Component의 UI 코드를 함께 옮기지 않는다.

```
❌ 잘못된 구조:
containers/
  ShareContainer.tsx  # UI + 로직 혼합
✅ 올바른 구조:
containers/
  ShareContainer.tsx  # 로직만 (데이터 페칭, 핸들러)
components/
  Share.tsx           # UI만 (props 기반 렌더링)
```

### UI 분리 시 피해야 할 패턴
| 패턴 | 문제 | 대안 |
|------|------|------|
| `children: ReactNode`


## Component Props 설계 원칙

### 객체 전체 대신 필드만 내려주기

Page/Container에서 모델 객체를 통째로 내려주면 컴포넌트가 필요 이상의 데이터에 의존하게 됨. 컴포넌트가 실제로 사용하는 필드만 개별 props로 내려준다.

```
❌ <Sheet streak={streak} />
✅ <Sheet bonusCoin={streak.bonusCoin} totalCoin={streak.totalCoin} consecutiveDays={streak.consecutiveDays} />
```

## 컨테이너 독립성 원칙

- 컨테이너를 분리할 때 부모에서 props로 내려주는 방식(props drilling)은 결합도를 높인다. 
- 각 컨테이너는 react-query 또는 전역 상태 관리를 이용해 최대한 데이터를 직접 fetch해야 한다. 하지만 부모 컨테이너에서 데이터를 가져오는 것이 더 나은 경우가 있다.


```
❌ 부모가 playLog, isShowingAd 등을 fetch해서 자식에게 props로 전달
✅ 자식 컨테이너가 useSuspenseQuery, useSharedAdReward 등을 직접 호출
```

### 분기 렌더링은 Page에서

`isDone`, `isError` 같은 상태 분기는 Page에서 처리하고, 각 Component는 단일 상태만 렌더링.
Component 내부에서 분기하면 두 UI가 한 파일에 혼재되고 props가 과다해짐.

```
❌ Component 내부에서 isDone 분기 → <DoneUI /> / <ProgressUI /> 혼재, props 과다
✅ Page에서 isDone 보고 <DoneSheet> / <ProgressSheet> 중 하나만 렌더링
```
