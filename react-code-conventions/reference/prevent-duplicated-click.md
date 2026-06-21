# Prevent Duplicated Click

## 중복 클릭 방지

- 모든 POST, PUT, PATCH, DELETE 요청에 필수 적용해야한다.
- `es-toolkit`의 `debouncing`, `throttling`, shared 모듈인 `useLoading` 훅을 이용하며, 실제 작업자가 필요한 목적에 맞게 권장하고, 필요시 작업자에게 물어본다.

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


## useLoading 훅을 이용한 중복 클릭 방지

`useLoading`의 구현·상세는 [modules/use-loading.md](./modules/use-loading.md)를 참조한다.

> 프로젝트에 `useLoading`이 아직 없으면 [modules/use-loading.md](./modules/use-loading.md)의 SSOT 그대로 `src/shared/hooks/useLoading.ts`에 **생성해서 쓴다**. "미설치"를 이유로 `useRef`/`useState` 가드를 직접 자작하지 않는다 — 표준 모듈을 두는 것이 컨벤션이다.

`withLoading`은 비동기 콜백을 받아 로딩/중복방지로 감싼 **핸들러를 반환**한다. api 호출뿐 아니라 후속 상태 갱신까지 콜백 한 곳에 넣어 전체 흐름을 감싼다. (일부만 감싸면 상태 갱신 구간이 로딩/중복방지 밖으로 샌다.)

```tsx
const [isLoading, withLoading] = useLoading();

const handleSaveClick = withLoading(async () => {
  await runApi.postRun(params);
});
```
