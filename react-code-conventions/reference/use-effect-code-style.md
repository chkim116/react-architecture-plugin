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
