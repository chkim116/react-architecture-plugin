# Modules (공용 모듈)

직접 만들어 쓰는 공용 모듈의 인덱스다. 각 모듈의 **구현 코드는 `modules/{module}.md` 단일 파일**에만 존재한다.

**사용자가 별도로 지정하지 않으면 이 목록의 모듈을 그대로 사용한다 (기본값).** 같은 기능을 새로 만들지 말고 여기 정의된 모듈을 쓴다.

## SSOT 정책

- 한 모듈 = 한 파일 = 한 정의처. 구현 코드는 해당 모듈 파일에만 둔다.
- 외부 라이브러리(설치형)는 모듈이 아니다 → [packages.md](./packages.md)로 분류한다.
- 주제 문서(storage.md, env.md, use-feature-params.md 등)와 이 인덱스는 **구현 코드를 중복하지 않고** 규칙·사용 패턴·링크만 둔다.
- `core` vs `shared` 분류 기준: [folder-conventions.md](./folder-conventions.md). 레이어 의존성 규칙: [folder-structure.md](./folder-structure.md).

## 모듈 목록

| 모듈 | layer | 위치 | 문서 |
|------|-------|------|------|
| `useLoading` | shared | `src/shared/hooks/useLoading.ts` | [use-loading](./modules/use-loading.md) |
| `useQueryParser` | shared | `src/shared/hooks/useQueryParser.ts` | [use-query-parser](./modules/use-query-parser.md) |
| `createStorage` | core | `src/core/storage.ts` | [create-storage](./modules/create-storage.md) |
| `envConfig` | core | `src/core/env-config.ts` | [env-config](./modules/env-config.md) |

> 새 모듈을 추가할 때: folder-conventions의 분류 기준으로 layer(core/shared)를 정하고,
> `modules/{module}.md`를 새로 만든 뒤 이 표에 한 줄 추가한다. 주제 문서에는 구현을 넣지 않는다.

## core 래핑 경계 (옵셔널)

라이브러리 래핑은 **옵셔널**이다 — external에서 axios·supabase를 직접 써도 무방하다. 다만 **래핑한다면**
그 래퍼(전송 계층 구성)는 core에 둔다. 단, **"전송 계층 구성"까지만** core다.

| 무엇 | 레이어 | 예 |
|---|---|---|
| 클라이언트/인스턴스 구성 (도메인 무지) | **core** | `createHttpClient`(baseURL은 `envConfig`, 인터셉터·에러 정규화), `createSupabaseClient` |
| 라이브러리 기능 하나를 감싼 래퍼 (특정 자원·도메인에 묶이지 않음) | **core** | SDK 기능 래퍼(광고·프로모션 호출 등 도메인 모르는 단순 래핑) |
| 그 클라이언트로 특정 엔드포인트·테이블 호출 | **external** | `home.api.ts`의 `fetchHomeDetail`, `supabase.from('users')…` |

`createStorage`(core) ↔ `auth.storage.ts` 인스턴스(external)와 **같은 분할**이다: 도메인을 모르는 기계는 core,
특정 자원에 바인딩되는 순간 external. 래퍼에 엔드포인트/테이블/버킷/도메인 타입이 등장하면 더 이상 core가 아니다.

> **역방향 의존 주의**: core 클라이언트가 auth 토큰처럼 external(storage)의 값이 필요하면, import 하지 말고
> **주입**한다(토큰 getter 콜백 주입). core가 external을 import 하면 의존 방향이 역전된다.

> `createHttpClient`/`createSupabaseClient`는 옵셔널 래퍼라 기본 구현체를 제공하지 않는다. 도입한다면
> 위 경계에 맞춰 core에 두고, `modules/`에 단일 파일로 추가한다.
