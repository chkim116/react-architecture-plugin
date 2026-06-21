# 환경변수 사용 규칙

- `process.env.XXX` / `import.meta.env.XXX` 등 런타임·번들러별 환경 접근자를 코드에서 직접 참조하지 않는다.
- 프레임워크 빌드 플래그(`DEV`/`PROD`/`MODE` 등)도 직접 쓰지 않고 envConfig를 거친다 (예: `isDev`). 단, 빌드 플래그는 번들러가 정적으로 치환해 안 쓰는 코드를 지워주는데 envConfig를 거치면 그 효과가 약해질 수 있다 — 그래도 일관성을 우선한다.
- `envConfig`라는 환경변수 모음 객체를 만들어, 모든 환경변수를 한 곳에서 관리한다.
- `envConfig`는 무의존 config이므로 `src/core/`에 위치한다. (External도 base URL 등으로 의존하므로 Core에 둔다)
- `envConfig`의 구현·작성 규칙은 [modules/env-config.md](./modules/env-config.md)에 정의되어 있다. 이 문서는 사용 규칙만 다룬다.

## 사용 예시

```ts
// ❌ 환경변수 직접 참조, 타입 단언
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL as string;

// ✅ envConfig를 통해 사용
import { envConfig } from "@/core/env-config";

const apiBaseUrl = envConfig.apiBaseUrl;
```

> 번들러별 소스는 envConfig 안에서만 다룬다 — Next는 `process.env.NEXT_PUBLIC_*`, Vite는 `import.meta.env.VITE_*`. 바깥 코드는 둘 다 `envConfig.xxx`로만 쓴다.
