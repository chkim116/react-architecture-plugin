# 환경변수 사용 규칙

- `process.env.XXX`를 코드 곳곳에서 직접 참조하지 않는다.
- `runtimeEnv`라는 환경변수 모음 객체를 만들어, 모든 환경변수를 한 곳에서 관리한다.

## 작성 규칙

- 환경변수 이름과 사용하는 변수명이 다를 수 있으므로, `runtimeEnv`에서 의미가 드러나는 이름으로 매핑한다.
- 값이 없을 수 있는 환경변수는 타입 단언(`as`) 대신, 누락 시 빌드/실행 시점에 즉시 에러가 나도록 검증한다.

```ts
// runtime-env.ts
function getRequiredEnv(key: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`환경변수 ${key}가 설정되지 않았습니다.`);
  }
  return value;
}

export const runtimeEnv = {
  apiBaseUrl: getRequiredEnv('NEXT_PUBLIC_API_BASE_URL', process.env.NEXT_PUBLIC_API_BASE_URL),
  appEnv: getRequiredEnv('NEXT_PUBLIC_APP_ENV', process.env.NEXT_PUBLIC_APP_ENV),
};
```

## 사용 예시

```ts
// ❌ 환경변수 직접 참조, 타입 단언
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL as string;

// ✅ runtimeEnv를 통해 사용
import { runtimeEnv } from '@/shared/runtime-env';

const apiBaseUrl = runtimeEnv.apiBaseUrl;
```
</content>
