# Storage 사용 규칙

기기에 값을 저장할 때 무엇을 어디에 두는지 정한다. RN에는 `localStorage`가 없다.

## 원칙

- 저장소를 직접 호출하지 않고, `createStorage`로 만든 storage 객체를 통해 쓴다 — 웹과 같은 규칙이다 ([react storage.md](../../react-code-conventions/reference/storage.md)).
- 저장 백엔드는 **`react-native-mmkv`(MMKV)** 를 쓴다 — 동기 접근이 가능하고 빠르다. `createStorage`가 내부에서 MMKV를 감싸, 웹의 `localStorage` 자리를 대신한다.
- storage 객체는 웹과 같은 위치·형태 규칙을 따른다 — `external/storages/{도메인}.storage.ts`에 두고, `createStorage` 반환을 `{도메인}Storage`로 그대로 export 한다. 개별 함수로 흩뿌리지 않는다.

## 파일 위치 · 네이밍

| 요소 | 패턴 | 예시 |
| ---- | ---- | ---- |
| 위치 | `src/external/storages/` | — |
| 파일명 | `{도메인}.storage.ts` | `auth.storage.ts`, `onboarding.storage.ts` |
| export 객체 | `{도메인}Storage` | `authStorage`, `onboardingStorage` |

## 구현 패턴 / 사용 예시

- `createStorage`는 `core` 모듈로 두고 그 안에서 MMKV를 감싼다. 도메인을 모르는 전송 계층이라 `core`다 — 분류 기준은 [modules.md](../../react-code-conventions/reference/modules.md)의 core 래핑 경계와 같다.
- 저장하는 값의 타입은 제네릭으로 명시한다.

```ts
// external/storages/auth.storage.ts
import { createStorage } from '@/core/storage';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// createStorage(MMKV 래핑)가 { get, set, remove } 객체를 반환 → 그대로 export
export const authStorage = createStorage<AuthTokens>('auth-tokens');

// 사용: authStorage.get() / authStorage.set(tokens) / authStorage.remove()
```

## 주의사항

- MMKV는 네이티브 모듈이라 **Expo Go에서는 동작하지 않는다** — development build(prebuild)가 필요하다.
- MMKV는 동기라 렌더 중 즉시 값을 읽을 수 있다 — 웹 코드를 옮길 때 `await` 없이 그대로 쓴다.
- 토큰처럼 민감한 값은 MMKV 암호화 옵션(`encryptionKey`) 또는 `expo-secure-store`를 검토한다(사용자 정책에 따름).

## 참조

- [react storage.md](../../react-code-conventions/reference/storage.md)
- [modules.md](../../react-code-conventions/reference/modules.md)
- [packages.md](./packages.md)
