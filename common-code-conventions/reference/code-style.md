# Code Style 규칙

## if문 중괄호

- if문은 한 줄이어도 **항상 중괄호** 사용
- `if (x) return y;` 형태 절대 금지

```ts
// Bad
if (isLoading) return null;

// Good
if (isLoading) {
  return null;
}
```

## 긍정 조건문 활용

- if문 또는 삼항 연산자 사용 시 긍정 조건문을 먼저 사용한다.

```ts
// Bad
if (!shouldShow) {
  return;
}

// Good
if (shouldShow) {
  return;
}
```

```ts
!shouldShow ? false : true;

// Good
shouldShow ? true : false;
```

## 축약어 금지

의미가 불명확한 단일 문자 변수, 수학적 축약어, 관례적 약어 사용 금지.
변수명은 **그것이 무엇인지 읽는 순간 알 수 있어야 한다**.

```ts
// Bad — 무슨 의미인지 알 수 없음
const dLat = toRad(lat2 - lat1);
const dLng = toRad(lng2 - lng1);
const a =
  Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

// Good — 의도가 드러나는 이름
const latDifferenceRad = toRad(lat2 - lat1);
const lngDifferenceRad = toRad(lng2 - lng1);
const haversineSum =
  Math.sin(latDifferenceRad / 2) * Math.sin(latDifferenceRad / 2) +
  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
  Math.sin(lngDifferenceRad / 2) * Math.sin(lngDifferenceRad / 2);
return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(haversineSum), Math.sqrt(1 - haversineSum));
```

### 금지 패턴

| 패턴 | 이유 | 대안 |
|------|------|------|
| `a`, `b`, `c` 등 단일 문자 | 의미 없음 | 역할을 나타내는 전체 단어 |
| `dLat`, `dLng` | 수학 표기 축약 | `latDifferenceRad`, `lngDifferenceRad` |
| `tmp`, `temp` | 임시라는 정보 외에 아무것도 없음 | 실제 값이 무엇인지로 명명 |
| `i`, `j` (루프 외부 맥락) | 루프 인덱스 외에는 맥락 없음 | `runIndex`, `lapCount` 등 |
| `cb` | callback 축약 | `onSuccess`, `onComplete` 등 역할 명시 |
| `res`, `req` | 단순 축약 | `response`, `request` |
| `e` (이벤트 외) | 이벤트 핸들러 파라미터 외에는 금지 | 실제 의미 명시 |
