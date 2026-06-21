# RSC / RCC & Data Fetching

## 1. RSC / RCC

React Server Component(RSC)와 React Client Component(RCC) 선택 기준입니다.

### 선택 기준
| 조건 | 컴포넌트 타입 |
|------|--------------|
| 클라이언트 로직 없음 (hooks, event handler 등) | RSC |
| 클라이언트 로직 있음 | RCC |

### RSC (React Server Component)
- Next.js App Router에서 **기본값** (별도 선언 불필요)
- `async function` 사용 가능
- 하위에서 `useSuspenseQuery` 사용 시 `QueriesHydration` 사용
- `QueriesHydration`은 `<Suspense>`로 감싸기

```tsx
// src/features/Feature/index.tsx (RSC)
import { Suspense, QueriesHydration } from '@suspensive/react-query';
import { featureDataQuery } from './queries/useFeatureDataQuery';
import { FeatureContainer } from './containers/FeatureContainer';

export default async function FeaturePage() {
  return (
    <Suspense>
      <QueriesHydration queries={[featureDataQuery]}>
        <FeatureContainer />
      </QueriesHydration>
    </Suspense>
  );
}

```
### RCC (React Client Component)
- `'use client'` 선언 필수
- 하위에서 `useSuspenseQuery` 사용 시 `<Suspense clientOnly>` 사용

```tsx
// src/features/Feature/containers/FeatureContainer.tsx (RCC)
'use client';
import { Suspense } from '@suspensive/react';
import { useFeatureDataQuery } from '../queries/useFeatureDataQuery';
import { ChildContainer } from './ChildContainer';

export function FeatureContainer() {
  return (
    <Suspense clientOnly>
      <ChildContainer />
    </Suspense>
  );
}

// src/features/Feature/containers/ChildContainer.tsx (RCC)
'use client';
import { useFeatureDataQuery } from '../queries/useFeatureDataQuery';
export function ChildContainer() {
  const { data } = useFeatureDataQuery();
  return <div>{data}</div>;
}
```

### QueriesHydration 규칙
- RSC + Container 레벨 이상에서만 사용
- 하위 자식이 사용하는 `queryOptions`를 전달
- 클라이언트 전용 `queryOptions`(앱브릿지, 스토리지 등)는 전달하지 않음

## 2. Data Fetching

### 데이터 소스별 위치
| 데이터 소스 | 위치 |
|------------|------|
| 서버 API | `external/apis/` |
| 스토리지 | `external/storages/` |

### React Query 사용 규칙
| 메서드 | React Query 사용 | 호출 방식 |
|--------|-----------------|----------|
| GET | O | `useSuspenseQuery` / `useQuery` |
| POST, PUT, DELETE | X | 직접 호출 |

### useSuspenseQuery vs useQuery
| 조건 | Hook |
|------|------|
| RSC에서 prefetch 가능 (API 호출) | `useSuspenseQuery` |
| RSC에서 prefetch 불가 (앱브릿지, 스토리지) | `useQuery` |

### 서버에서만 쓰는 GET은 일반 API 호출 허용

RSC 안에서 **서버에서만 사용하고 끝나는**(클라이언트로 hydration 하거나 하위 RCC에서 재사용하지 않는) GET이라면, React Query 없이 `external/apis/`의 일반 API 함수를 직접 `await`해도 된다. 캐싱·재사용 이점이 없는데 굳이 `queryOptions`로 감쌀 필요가 없다.

- 클라이언트에서 다시 쓰거나 `QueriesHydration`으로 내려야 하면 → `useSuspenseQuery` + `queryOptions`.
- 이 RSC 안에서 렌더에만 쓰고 끝 → 일반 API 호출 OK.
- 단, **어느 경우든 서버 응답은 그대로 쓰지 않고 데이터 모델링을 거친다.** ([data-modeling.md](../../react-code-conventions/reference/data-modeling.md))

```tsx
// src/features/Feature/index.tsx (RSC) — 서버에서만 쓰고 끝나는 GET
import { homeApi } from 'external/apis/home.api';
import { toHomeDetailModel } from 'models/home.model';

export default async function FeaturePage() {
  const response = await homeApi.fetchHomeDetail();
  const homeDetail = toHomeDetailModel(response); // 모델링은 그대로 필수

  return <FeatureView homeDetail={homeDetail} />;
}
```