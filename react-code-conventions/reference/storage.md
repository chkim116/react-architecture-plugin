# Storage 사용 규칙

브라우저 저장소(`localStorage`/`sessionStorage`)에 값을 저장할 때 무엇을 어디에 두는지 정한다.

## 원칙

- `localStorage`/`sessionStorage`를 직접 호출하지 않고, `createStorage`로 만든 storage 객체를 통해 쓴다. 직접 호출하면 JSON 직렬화/역직렬화·타입·예외 처리가 매번 중복되고 누락되기 쉽다.
- storage 객체는 **external 레이어**에 둔다. 위치는 `external/storages/{도메인}.storage.ts` 한 곳이다.
- `createStorage`가 이미 `{ get, set, remove }` 객체를 반환하므로, 그 결과를 `{도메인}Storage`로 **그대로 export** 한다 — `getXxx`/`setXxx` 같은 개별 함수를 따로 만들어 흩뿌리지 않는다.

## 파일 위치 · 네이밍

| 요소 | 패턴 | 예시 |
| ---- | ---- | ---- |
| 위치 | `src/external/storages/` | — |
| 파일명 | `{도메인}.storage.ts` | `auth.storage.ts`, `post-draft.storage.ts` |
| export 객체 | `{도메인}Storage` | `authStorage`, `postDraftStorage` |

## 구현 패턴 / 사용 예시

- `createStorage`는 [modules/create-storage.md](./modules/create-storage.md)에 정의된 core 모듈을 사용한다. (`src/core/`에 위치)
- storage 파일에는 `createStorage`로 만든 `{도메인}Storage` 객체만 둔다.
- 저장하는 값의 타입은 제네릭으로 명시한다.

```ts
// external/storages/auth.storage.ts
import { createStorage } from '@/core/storage';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// createStorage가 { get, set, remove } 객체를 반환 → 그대로 export
export const authStorage = createStorage<AuthTokens>('auth-tokens');
```

```ts
// ❌ localStorage 직접 호출
const tokens = JSON.parse(localStorage.getItem('auth-tokens') ?? 'null');

// ❌ 개별 함수로 흩뿌리기
export function getAuthTokens() { /* ... */ }
export function setAuthTokens(tokens: AuthTokens) { /* ... */ }

// ✅ {도메인}Storage 객체로 사용
import { authStorage } from '@/external/storages/auth.storage';

const tokens = authStorage.get();
authStorage.set({ accessToken, refreshToken });
authStorage.remove();
```

## 참조

- [modules/create-storage.md](./modules/create-storage.md)
- [folder-conventions.md](./folder-conventions.md)
