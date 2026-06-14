# Constants

- `constants/` 폴더에는 변하지 않는 값(상수)을 정의합니다.

**역할**
- Feature 내에서 사용하는 고정 값 관리

**네이밍 규칙**
| 구분 | 패턴 | 예시 |
|------|------|------|
| 파일명 | `{역할}.const.ts` | `referer.const.ts` |
| 상수 | `{FEATURE}_{역할}` (UPPER_SNAKE_CASE) | `HOME_REFERER` |

**작성 규칙**
- 원시 값 또는 객체 리터럴만 정의
- 함수, 컴포넌트, 훅 포함 금지
- 객체 상수의 각 필드에 JSDoc 주석 권장

**금지 의존성**

- React 코드 (Container, Components, Queries, Hooks, Contexts), API 호출 등 모든 함수 금지

```ts
export const REFERRER_TYPE = {
  /**
   * 리퍼럴 타입
   */
  REFERRER: 'referrer',
  /**
   * 쿠폰 코드
   */
  COUPON_CODE: 'coupon_code',
} as const;
```
