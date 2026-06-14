# Prevent Duplicated Click

## 중복 클릭 방지

- 모든 POST, PUT, PATCH, DELETE 요청에 필수 적용해야한다.
- `es-toolkit`의 `debouncing`, `throttling`, shared-modules의 `useLoading` 훅을 이용하며, 실제 작업자가 필요한 목적에 맞게 권장하고, 필요시 작업자에게 물어본다.

## es-toolkit의 debouncing, throttling을 이용한 중복 클릭 방지

```tsx
import { debounce } from 'es-toolkit/function';

const debouncedFunction = debounce(() => {
  console.log('실행됨');
}, 1000);
```

```tsx
import { throttle } from 'es-toolkit/function';

// 기본 사용법 (1초마다 최대 한 번 실행)
const throttledLog = throttle(() => {
  console.log('함수가 실행됐어요!');
}, 1000);
```


## shared-modules의 useLoading 훅을 이용한 중복 클릭 방지.

```tsx
const [isLoading, startTransition] = useLoading();

const handleSaveClick = () => {
  startTransition(runApi.postRun(params));
};
```
