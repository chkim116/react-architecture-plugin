# API Layer

`apis/` 폴더에는 서버 API 호출 함수와 타입을 정의합니다.

**폴더 구조**
```
external/apis/
├── home.api.ts
└── types/
    └── home.type.ts
```

**네이밍 규칙**

| 구분 | 패턴 | 예시 |
|------|------|------|
| API 파일 | `{도메인}.api.ts` | `homeapi.ts` |
| 타입 파일 | `types/{도메인}.type.ts` | `types/hometype.ts` |
| GET 함수 | `fetch{ApiName}{PathSegments}` | `fetchHomeDetailTransactions` |
| POST 함수 | `post{ApiName}{PathSegments}` | `postHomeDetailSubmit` |
| 응답 타입 | `{ApiName}{PathSegments}Response` | `HomeDetailTransactionsResponse` |
| 파라미터 타입 | `{ApiName}{PathSegments}Params` | `HomeDetailTransactionsParams` |

**네이밍 구성**
- `{ApiName}`: 파일명에서 추출 (camelCase → PascalCase)
  - `homeapi.ts` → `HomeDetail`
- `{PathSegments}`: API 경로에서 서비스명 제외한 나머지 (PascalCase 변환)
  - `/api-web/v3/HomeDetail/transactions` → `` + `Transactions`

```tsx
// 파일: homeapi.ts → ApiName: "HomeDetail"
// 경로: /api-web/v3/HomeDetail/transactions
// 결과: fetchHomeDetailTransactions
```

**잘못된 예시**
```tsx
// ❌ 서비스명 중복
fetchHomeDetailHomeDetailHome  // HomeDetail 중복

// ❌ 경로의 서비스명 세그먼트 재포함
// 경로: /api-web/v3/HomeDetail/home
fetchHomeDetailHomeDetailHome  // HomeDetail가 ApiName에 이미 포함됨
```

**작성 규칙**
- `axios` 사용.
- 모든 타입 필드에 JSDoc 주석 필수

**JSDoc 규칙**
- 속성 설명과 `@default`는 **하나의 블록**으로 작성
- Swagger의 `default` 값이 있으면 `@default` 태그 포함

```tsx
// ❌ 잘못된 예: 분리된 JSDoc
/** 페이지 크기 */
/** @default 20 */
size?: number;

// ✅ 올바른 예: 한 블록으로 작성
/**
 * 페이지 크기
 *
 * @default 20
 */
size?: number;
```

**금지 의존성**
- Feature 코드, React 코드

```ts
import type { HomeDetailResponse } from './types/home.type';

export const homeApi = {
  fetchHomeDetail<HomeDetailResponse>(http = get) {
    return axios.get('/api/home-detail');
  },
};
```

**타입 예시**
```tsx
// external/apis/types/home.type.ts

export interface HomeDetailTransactionsResponse {
  /**
   * 거래 내역 목록
   */
  transactions: Transaction[];
  /**
   * 다음 페이지 커서
   */
  nextCursor: string | null;
}

export interface HomeDetailTransactionsParams {
  /**
   * 다음 페이지 커서
   *
   * @default ""
   */
  nextCursor?: string;
  /**
   * 페이지 크기
   *
   * @default 20
   */
  size?: number;
}
```