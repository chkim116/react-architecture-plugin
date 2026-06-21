# createStorage

> **layer**: core · **위치**: `src/core/storage.ts`
> 이 파일이 `createStorage`의 SSOT(구현 단일 출처)다. 다른 문서는 구현을 중복하지 않고 여기를 링크한다.

- `localStorage`/`sessionStorage`를 다루기 위한 범용 팩토리 함수이다.
- [storage.md](../storage.md)의 `*.storage.ts` 파일에서 이 함수로 인스턴스를 만들어 사용한다.
- 도메인 무지 기술 기반이고 무의존·non-React라 `core`다. External(`*.storage.ts` 인스턴스)이 import 하므로 반드시 core에 둔다. ([core vs shared 판단 기준](../folder-conventions.md))
- 특징
  - JSON 직렬화·역직렬화를 자동으로 처리한다.
  - `defaultValue`를 주면 조회 타입이 `T`로 좁혀지고, 생략하면 `T | null`이 된다. (오버로드)
  - `type`으로 `'local'`(기본) / `'session'` storage를 선택한다.
  - SSR(서버)이나 storage 접근이 막힌 환경(시크릿 모드·용량 초과)에서도 throw하지 않고 안전하게 동작한다.
- 특정 플랫폼(예: 네이티브 secureStorage)에 종속된 코드를 두지 않는다. 환경 분기가 필요하면 `storage` 어댑터를 주입하는 형태로 확장한다.

```ts
// storage.ts

export type StorageType = 'local' | 'session';

interface StorageInstance<T> {
  get: () => T;
  set: (value: T) => void;
  remove: () => void;
}

export function createStorage<T>(key: string): StorageInstance<T | null>;
export function createStorage<T>(key: string, defaultValue: T): StorageInstance<T>;
export function createStorage<T>(key: string, defaultValue: T, type: StorageType): StorageInstance<T>;

/**
 * @description
 * `createStorage`는 `localStorage`/`sessionStorage`를 다루기 위한 범용 팩토리 함수입니다.
 *
 * - 값을 저장/조회/삭제할 때 JSON 직렬화·역직렬화를 자동으로 처리합니다.
 * - `defaultValue`를 주면 조회 결과가 항상 `T`로 좁혀지고, 생략하면 `T | null`이 됩니다.
 * - SSR(서버)이나 storage 접근이 막힌 환경(시크릿 모드·용량 초과)에서도 throw하지 않고
 *   안전하게 동작합니다. (조회는 `defaultValue` 반환, 저장/삭제는 무시)
 *
 * @param key storage에 저장될 때 사용할 키
 * @param defaultValue 값이 없거나 파싱에 실패했을 때 반환할 기본값. 생략 시 `null`
 * @param type 사용할 storage 종류. `'local'`(기본) | `'session'`
 * @returns `{ get, set, remove }`로 구성된 storage 인스턴스
 *
 * @example
 * interface AuthTokens {
 *   accessToken: string;
 *   refreshToken: string;
 * }
 *
 * // 1) 기본값 없음 → get()은 AuthTokens | null
 * const authStorage = createStorage<AuthTokens>('auth-tokens');
 *
 * // 2) 기본값 있음 → get()은 항상 AuthTokens
 * const authStorageWithDefault = createStorage<AuthTokens>('auth-tokens', {
 *   accessToken: '',
 *   refreshToken: '',
 * });
 *
 * // 3) sessionStorage 사용
 * const onboardingSeen = createStorage<boolean>('onboarding-seen', false, 'session');
 */
export function createStorage<T>(
  key: string,
  defaultValue: T | null = null,
  type: StorageType = 'local'
): StorageInstance<T | null> {
  // storage는 호출 시점에 안전하게 접근한다. (SSR / 접근 차단 환경 대응)
  function getStorage(): Storage | null {
    try {
      if (typeof window === 'undefined') {
        return null;
      }

      return type === 'session' ? window.sessionStorage : window.localStorage;
    } catch {
      // 일부 환경(시크릿 모드 등)에서는 storage 접근 자체가 예외를 던질 수 있다.
      return null;
    }
  }

  function get(): T | null {
    const raw = getStorage()?.getItem(key);

    if (raw == null) {
      return defaultValue;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  }

  function set(value: T) {
    try {
      getStorage()?.setItem(key, JSON.stringify(value));
    } catch {
      // 용량 초과(QuotaExceededError) 등은 무시한다.
    }
  }

  function remove() {
    getStorage()?.removeItem(key);
  }

  return { get, set, remove };
}
```
