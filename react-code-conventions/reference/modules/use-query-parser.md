# useQueryParser

> **layer**: shared · **위치**: `src/shared/hooks/useQueryParser.ts`
> 이 파일이 `useQueryParser`의 SSOT(구현 단일 출처)다. 다른 문서는 구현을 중복하지 않고 여기를 링크한다.

- URL 파라미터(동적 경로 + 쿼리)를 파싱해 타입화된 객체로 변환하는 훅이다.
- URL 파라미터를 중앙에서 관리하기 위한 기반 훅이다. Feature/SubFeature별 파라미터 훅은 이 훅을 래핑해서 만든다. (사용 규칙: [use-feature-params.md](../use-feature-params.md))
- 도메인 무지지만 여러 feature가 공유하는 횡단관심사라 `shared`다. `next/navigation`·`react-router`에 의존해 `core`(무의존·non-React)에는 둘 수 없다. ([core vs shared 판단 기준](../folder-conventions.md))

## Next app router에서 사용하는 경우

```tsx
"use client";
import { useMemo } from "react";
import { useSearchParams, useParams } from "next/navigation";

interface Refiner<T> {
  (query: Record<string, string>): T;
}

export const useQueryParser = <T,>(refiner: Refiner<T>) => {
  const params = useParams() as Record<string, string>;
  const query = useSearchParams();

  const refinerQuery = useMemo(() => {
    const obj: Record<string, string> = { ...(params || {}) };
    query?.forEach((value, key) => (obj[key] = value));

    return refiner(obj);
  }, [params, query, refiner]);

  return refinerQuery;
};
```

## React Router에서 사용하는 경우

```tsx
import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router";

type QueryObject = Record<string, string>;

interface Refiner<T> {
  (query: QueryObject): T;
}

export const useQueryParser = <T,>(refiner: Refiner<T>): T => {
  const params = useParams(); // { [key: string]: string | undefined }
  const [searchParams] = useSearchParams();

  const searchKey = searchParams.toString();

  const combinedQuery = useMemo<QueryObject>(() => {
    const result: QueryObject = {};

    for (const [key, value] of Object.entries(params)) {
      if (value != null) result[key] = value;
    }

    for (const [key, value] of searchParams.entries()) {
      result[key] = value;
    }

    return result;
  }, [params, searchKey]);

  return useMemo(() => refiner(combinedQuery), [refiner, combinedQuery]);
};
```
