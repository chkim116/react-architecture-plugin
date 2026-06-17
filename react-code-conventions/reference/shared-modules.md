# shared modules

- 서비스 개발 시 주요하게 사용하는 모듈을 정리한다.
- package.md 와는 달리 라이브러리가 아니며 작업자의 취향에 따라 변경 가능하다.

## useLoading

- 중복 클릭 방지를 위한 훅이다.

```tsx
// useLoading.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * @description
 * `useLoading`은 비동기 작업의 로딩 상태를 간단하게 관리하기 위한 React 커스텀 훅입니다.
 * Promise를 실행할 때 자동으로 로딩 상태를 켜고/끄며, 컴포넌트가 언마운트된 뒤에 setState가 호출되는 것도 방지합니다.
 *
 * @returns {[loading: boolean, startLoading: <T>(promise: Promise<T>) => Promise<T>]}
 *  - 첫 번째 값 `loading`:
 *    : 현재 비동기 작업이 진행 중인지 여부를 나타내는 boolean 값입니다.
 *    : 초기값은 `false`이며, 작업이 시작되면 `true`, 작업이 끝나면 `false`가 됩니다.
 *
 *  - 두 번째 값 `startLoading`:
 *    : 시그니처는 `<T>(promise: Promise<T>) => Promise<T>` 입니다.
 *    : 인자로 전달된 Promise를 실행하면서, 그 기간 동안 `loading` 상태를 자동으로 관리합니다.
 *    : Promise가 완료(성공/실패)되면 `loading`을 다시 `false`로 돌려놓습니다.
 *    : 컴포넌트가 언마운트된 상태라면 `setState`를 호출하지 않도록 방어 로직이 들어 있습니다.
 *
 * @example
 * function ConfirmButton() {
 *   const [loading, startLoading] = useLoading();
 *
 *   const handleSubmit = useCallback(async () => {
 *     try {
 *       // 비동기 함수에서 나온 Promise를 startLoading에 넘기기
 *       const result = await startLoading(postConfirmation());
 *       router.push(`/success?id=${result.id}`);
 *     } catch (error) {
 *       console.error('Error:', error);
 *     }
 *   }, [startLoading]);
 *
 *   return (
 *     <button disabled={loading} onClick={handleSubmit}>
 *       {loading ? 'Loading...' : 'Confirm'}
 *     </button>
 *   );
 * }
 */
export function useLoading(): [boolean, <T>(promise: Promise<T>) => Promise<T>] {
  const [loading, setLoading] = useState(false);
  const mountedRef = useIsMountedRef();
  const isRunningRef = useRef(false); // 현재 비동기 작업이 실행 중인지 여부를 저장하는 ref

  /**
   * @description
   * 전달받은 Promise를 실행하면서 로딩 상태와 중복 실행을 관리하는 함수입니다.
   *
   * - 이미 비동기 작업이 실행 중(`isRunningRef.current === true`)이면
   *   추가 호출을 무시하도록 구현할 수 있습니다.
   * - 언마운트 이후에는 `mountedRef.isMounted` 체크를 통해
   *   안전하게 `setLoading` 호출을 막습니다.
   */
  const startLoading = useCallback(
    async <T>(promise: Promise<T>): Promise<T> => {
      // 이미 실행 중이면 중복 호출 방지 (필요에 따라 정책 변경 가능)
      if (isRunningRef.current) {
        return promise;
        // 예시:
        // return Promise.reject(new Error('이미 로딩 중입니다.'));
      }

      isRunningRef.current = true;

      try {
        if (mountedRef.isMounted) {
          setLoading(true);
        }

        const data = await promise;
        return data;
      } finally {
        isRunningRef.current = false;

        if (mountedRef.isMounted) {
          setLoading(false);
        }
      }
    },
    [mountedRef.isMounted]
  );

  // 매 렌더마다 동일한 참조를 유지하기 위해 useMemo로 튜플을 메모이제이션합니다.
  return useMemo(() => [loading, startLoading], [loading, startLoading]);
}

/**
 * @description
 * 컴포넌트의 마운트 여부를 ref로 추적하는 훅입니다.
 *
 * - `ref.isMounted`는 컴포넌트가 마운트된 상태면 `true`,
 *   언마운트되면 `false`가 됩니다.
 * - 언마운트 이후에 setState를 호출하는 것을 방지하기 위한 용도로 사용합니다.
 */
function useIsMountedRef() {
  const ref = useRef({ isMounted: true }).current;

  useEffect(
    function trackMountedState() {
      ref.isMounted = true;

      // cleanup 시점(언마운트)에서 isMounted를 false로 변경
      return () => {
        ref.isMounted = false;
      };
    },
    [ref]
  );

  return ref;
}

```

## createStorage

- `localStorage`/`sessionStorage`를 다루기 위한 팩토리 함수이다.
- [storage.md](./storage.md)의 `*.storage.ts` 파일에서 이 함수로 인스턴스를 만들어 사용한다.

```ts
// createStorage.ts

/**
 * @description
 * `createStorage`는 `localStorage`/`sessionStorage`를 다루기 위한 팩토리 함수입니다.
 * 값을 저장/조회/삭제할 때 JSON 직렬화·역직렬화를 자동으로 처리하고,
 * 파싱에 실패하거나 값이 없는 경우 `null`을 반환합니다.
 *
 * @param key storage에 저장될 때 사용할 키
 * @param storage 사용할 storage. 기본값은 `localStorage`
 * @returns `{ get, set, remove }`로 구성된 storage 인스턴스
 *
 * @example
 * interface AuthTokens {
 *   accessToken: string;
 *   refreshToken: string;
 * }
 *
 * const authStorage = createStorage<AuthTokens>('auth-tokens');
 *
 * authStorage.set({ accessToken: 'a', refreshToken: 'b' });
 * const tokens = authStorage.get(); // AuthTokens | null
 * authStorage.remove();
 */
export function createStorage<T>(key: string, storage: Storage = localStorage) {
  function get(): T | null {
    const raw = storage.getItem(key);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  function set(value: T) {
    storage.setItem(key, JSON.stringify(value));
  }

  function remove() {
    storage.removeItem(key);
  }

  return { get, set, remove };
}
```

## useQueryParser

- URL 파라미터를 파싱하는 훅이다.
- URL 파라미터를 중앙 관리하기 위해 필요한 규칙에 사용하고자 하는 모듈이다.

### Next app router 에서 사용하는 경우

```tsx
'use client';
import { useMemo } from 'react';
import { useSearchParams, useParams } from 'next/navigation';

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
import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router';

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