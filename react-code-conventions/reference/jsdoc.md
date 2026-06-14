# JSDoc 규칙

## 기본 원칙

컴포넌트의 props를 제외한 모든 `interface`와 `type`에는 **각 필드에 JSDoc 필수**이다.

## 형식 — 멀티라인만 허용

```ts
// ✅ 올바른 형식
interface RunModel {
  /**
   * 러닝 기록 고유 ID
   */
  id: number;
  /**
   * 러닝 날짜 (YYYY-MM-DD)
   */
  date: string;
  /**
   * 달린 거리 (km)
   */
  distanceKm: number;
}

// ❌ 한 줄 형식 금지
interface RunModel {
  /** 러닝 기록 고유 ID */
  id: number;
}
```

## `@default` 작성

기본값이 있는 필드는 설명과 `@default`를 **하나의 블록**에 작성한다.

```ts
interface RunListParams {
  /**
   * 정렬 기준
   *
   * @default 'date'
   */
  sortBy: 'date' | 'distance';
}

// ❌ 블록 분리 금지
/** 정렬 기준 */
/** @default 'date' */
sortBy: 'date' | 'distance';
```

## 적용 범위

- `interface` 모든 필드
- `type` alias의 객체 필드
- 훅 반환 타입, 모델, API 타입, 파라미터 훅 등

**제외:** 컴포넌트 props interface (`*Props`) — 필드명으로 충분히 의도 파악 가능하다.
