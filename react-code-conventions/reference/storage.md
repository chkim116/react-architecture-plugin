# Storage 사용 규칙

- `localStorage`, `sessionStorage`를 직접 호출하지 않고, `createStorage`를 통해 만든 storage 인스턴스를 사용한다.
- 직접 호출 시 JSON 직렬화/역직렬화, 타입, 예외 처리가 매번 중복되고 누락되기 쉽다.

## 파일 네이밍

| 구분 | 패턴 | 예시 |
|------|------|------|
| 파일명 | `{역할}.storage.ts` | `auth.storage.ts`, `post-draft.storage.ts` |

## 작성 규칙

- `createStorage`는 `shared-modules.md`에 정의된 공용 모듈을 사용한다.
- storage 파일에는 `createStorage`로 생성한 인스턴스와, 해당 인스턴스를 사용하는 함수만 둔다.
- 저장하는 값의 타입은 제네릭으로 명시한다.

```ts
// auth.storage.ts
import { createStorage } from '@/shared/storage';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const authStorage = createStorage<AuthTokens>('auth-tokens');

export function getAuthTokens() {
  return authStorage.get();
}

export function setAuthTokens(tokens: AuthTokens) {
  authStorage.set(tokens);
}

export function clearAuthTokens() {
  authStorage.remove();
}
```

## 사용 예시

```ts
// ❌ localStorage 직접 호출
const tokens = JSON.parse(localStorage.getItem('auth-tokens') ?? 'null');

// ✅ storage 모듈을 통해 사용
const tokens = getAuthTokens();
```
</content>
