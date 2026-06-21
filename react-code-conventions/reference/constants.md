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

## 로컬 UI 상수는 co-location — 공유될 때만 `constants/`로 승격

단일 컴포넌트 전용 렌더 상수(`REEL_SIZE` 등)는 그 파일 **모듈 스코프**에 둔다(co-location). **2개 이상 모듈이 공유할 때만** `constants/`로 승격([abstraction.md](../../common-code-conventions/reference/abstraction.md)). 의미 있는 매직넘버는 위치 무관하게 명명 상수로(`REEL_STOP_DURATION`).
