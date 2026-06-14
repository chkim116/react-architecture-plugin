# Contexts
`contexts/` 폴더에는 React Context를 정의합니다.

**역할**
- 컴포넌트 트리 전체에서 공유할 값 제공 (Props drilling 방지)
- 읽기 전용 값만 제공

**사용 기준**

Context는 **남용하지 않습니다.** 아래 조건을 모두 만족할 때만 사용합니다.

| 조건 | 설명 |
|------|------|
| Prop Drilling 3단계 이상 | 여러 레벨을 거쳐 전달해야 하는 경우 |
| 특정 Feature 범위 내 공유 | Feature 내부에서만 사용 |
| 로깅, 설정 등 횡단 관심사 | 여러 컴포넌트가 동일한 값 참조 |

**잘못된 사용**

```tsx
// ❌ 단순 상태 공유는 Context가 아닌 상위 Container에서 관리
const FeatureStateContext = createContext<{ count: number }>({ count: 0 });

// ❌ 1-2단계 전달은 props로 충분
<ParentContainer>
  <ChildComponent value={value} />  // props로 전달
</ParentContainer>
```

**네이밍 규칙**

| 구분 | 패턴 | 예시 |
|------|------|------|
| 파일명 | `{Feature}{SubFeature}{역할}Context.tsx` | `HomeContext.tsx` |
| Context | `{Feature}{SubFeature}{역할}Context` | `HomeContext` |
| Provider | `{Feature}{SubFeature}{역할}Provider` | `HomeProvider` |
| Hook | `use{Feature}{SubFeature}{역할}Context` | `useHomeContext` |

> SubFeature가 없거나 "Index"인 경우, 네이밍에서 생략합니다.

**작성 규칙**
- `createContext` + `Provider` + `useContext` Hook 세트
- Context에 setter 함수 포함 금지 (읽기 전용)
- Hook에서 null 체크 후 에러 throw (Provider 없이 사용 시 명확한 에러)
- RCC에서 사용 시 `'use client'` 선언

**금지 의존성**
- Container, Components, Queries, `external/` (단, `external/apis/types/`는 허용)

```tsx
// contexts/{Feature}{SubFeature}{역할}Context.tsx
import { createContext, useContext } from 'react';

// 1. Context 생성
export const HomeContext = createContext<Record<string, string> | null>(null);

// 2. Provider 컴포넌트
export function HomeProvider({
  params,
  children,
}: {
  params: Record<string, string>;
  children: React.ReactNode;
}) {
  return (
    <HomeContext.Provider value={params}>
      {children}
    </HomeContext.Provider>
  );
}

// 3. Hook (필수 에러 핸들링 포함)
export function useHomeContext() {
  const params = useContext(HomeContext);
  if (!params) {
    throw new Error('HomeContext not found');
  }
  return params;
}
```