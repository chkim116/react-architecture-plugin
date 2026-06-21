# envConfig

> **layer**: core · **위치**: `src/core/env-config.ts`
> 이 파일이 `envConfig`의 SSOT(구현 단일 출처)다. 다른 문서는 구현을 중복하지 않고 여기를 링크한다.

- 모든 환경변수를 한 곳에서 관리하는 환경변수 모음 객체다.
- 도메인 무지 config이고 무의존·non-React라 `core`다. External의 API 클라이언트가 base URL로 의존하므로 반드시 core에 둔다. ([core vs shared 판단 기준](../folder-conventions.md))
- 사용 측 규칙(`process.env` 직접 참조 금지 등)은 [env.md](../env.md) 참조.

## 구현 작성 규칙

- 환경변수 이름과 사용하는 변수명이 다를 수 있으므로, `envConfig`에서 의미가 드러나는 이름으로 매핑한다.
- 값이 없을 수 있는 환경변수는 타입 단언(`as`) 대신, 누락 시 빌드/실행 시점에 즉시 에러가 나도록 검증한다.
- 필수 환경변수는 `parseRequiredEnv`로 누락 시 즉시 throw하고, 선택 환경변수는 `parseOptionalEnv`로 default 값을 받는다.

```ts
// env-config.ts

// 필수 환경변수: 누락 시 즉시 throw
function parseRequiredEnv(key: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`환경변수 ${key}가 설정되지 않았습니다.`);
  }

  return value;
}

// 선택 환경변수: 누락 시 default 값으로 대체
function parseOptionalEnv(value: string | undefined, defaultValue: string): string {
  return value || defaultValue;
}

export const envConfig = {
  apiBaseUrl: parseRequiredEnv(
    "NEXT_PUBLIC_API_BASE_URL",
    process.env.NEXT_PUBLIC_API_BASE_URL,
  ),
  appEnv: parseOptionalEnv(process.env.NEXT_PUBLIC_APP_ENV, "development"),
};
```
