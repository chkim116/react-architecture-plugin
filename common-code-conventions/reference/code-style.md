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

## `void` 키워드 미사용

- `void` 키워드를 사용하지 않는다. 반환값을 의도적으로 무시해야 할 이유가 없다.

```ts
// Bad
void fetchData();

// Good
fetchData();
```

## 즉시실행함수(IIFE) 미사용

- 즉시실행함수(IIFE)를 사용하지 않는다. 구현과 실행을 동시에 둘 필요 없이, 함수로 정의하고 별도로 호출한다.

```ts
// Bad
const result = (() => {
  const base = getBaseValue();
  return base * 2;
})();

// Good
function calculateResult() {
  const base = getBaseValue();
  return base * 2;
}

const result = calculateResult();
```

## Early Return 패턴

- if-else 대신 조건에 맞지 않는 경우를 먼저 반환(early return)하고, 본문은 정상 흐름만 남긴다.

```ts
// Bad
function getDiscountedPrice(user: User, price: number) {
  if (user.isMember) {
    if (price > 0) {
      return price * 0.9;
    } else {
      return 0;
    }
  } else {
    return price;
  }
}

// Good
function getDiscountedPrice(user: User, price: number) {
  if (!user.isMember) {
    return price;
  }

  if (price <= 0) {
    return 0;
  }

  return price * 0.9;
}
```

## `console.log` 사용 금지

- `console.log`는 디버깅 용도로만 임시 사용하고, 작업 완료 후 코드에서 제거한다. 프로덕션 코드에 포함되지 않도록 한다.

```ts
// Bad
function handleSubmit(formData: FormData) {
  console.log('formData', formData);
  submitForm(formData);
}

// Good
function handleSubmit(formData: FormData) {
  submitForm(formData);
}
```

## `for` 대신 `forEach`

- 배열을 순회할 때는 `forEach`를 기본으로 사용한다. 중간에 순회를 멈춰야 하거나 `for`가 꼭 필요한 경우에만 `for`문을 사용한다.

```ts
// Bad
for (let i = 0; i < users.length; i++) {
  sendNotification(users[i]);
}

// Good
users.forEach((user) => {
  sendNotification(user);
});

// for문이 필요한 경우 (중간에 멈춰야 할 때)
for (const user of users) {
  if (user.isBlocked) {
    break;
  }
  sendNotification(user);
}
```

## 타입 단언 금지

- `as any`, `as unknown` 등 타입 단언을 사용하지 않는다. 타입이 맞지 않으면 실제 타입을 먼저 확인한다.

```ts
// Bad
const user = response.data as any;

// Bad
const config = rawConfig as unknown as AppConfig;

// Good — 실제 타입을 확인하고 타입에 맞게 처리
const user: UserResponse = response.data;
```

## 엄격한 동등 비교

- `==` 대신 `===`를 사용한다.
- `== null` 같은 비교 대신 falsy/truthy 비교를 우선 사용한다. `null`과 `undefined`를 구분해야 하는 경우에만 `=== null`, `=== undefined`를 명시한다.

```ts
// Bad
if (value == null) {
  return;
}

// Good
if (!value) {
  return;
}

// null과 undefined를 구분해야 하는 경우에만 명시
if (value === null) {
  return;
}
```
