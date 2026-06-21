# useEffect Code Style

## useEffect 내부: 함수 선언과 호출 분리

useEffect 내부에서 함수를 **선언 + 즉시 호출하지 않는다.** 함수는 effect 외부에서 정의하고, effect 내에서는 호출만 한다.

```ts
// ✅ 함수는 외부 정의, effect에서는 호출만
async function loadUserData() {
  const data = await fetchUser();
  setUser(data);
}

useEffect(() => {
  loadUserData();
}, []);

// ❌ effect 내부에서 함수 정의 + 즉시 호출 (지양)
useEffect(() => {
  async function loadUserData() {
    const data = await fetchUser();
    setUser(data);
  }
  loadUserData();
}, []);
```

**이유:** 함수 정의가 effect 외부에 있으면:
- 함수의 의존성 추적이 명확함
- 테스트, 재사용, 리팩토링이 쉬움
- 코드 가독성 향상

### 이 규칙의 경계 — "선언 후 즉시 호출"만 위반

금지 대상은 **effect 내부에서 함수를 선언하고 즉시 호출**하는 형태(위 ❌)뿐이다. 함수 선언 없이 로직을 **인라인**으로 펼치는 것(`Promise.all([...])`·구독 등록 등)은 위반이 *아니다*. 단 2곳+ 반복이면 밖으로 추출([abstraction.md](../../common-code-conventions/reference/abstraction.md)).

## cleanup — effect에서 만든 핸들은 전부 해제한다

effect에서 만든 **모든** 타이머·`requestAnimationFrame`·구독을 cleanup에서 해제한다. 하나라도 빠지면 누수·이전 콜백 발화 버그가 남는다.

```ts
useEffect(() => {
  const t1 = setTimeout(start, 0);
  const t2 = setTimeout(stop, duration);
  return () => { clearTimeout(t1); clearTimeout(t2); };  // ❌ 하나만 정리하면 나머지 누수
}, []);
```
