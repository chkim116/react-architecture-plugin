# Error Handling

- 모든 네트워크 요청에 대해서는 필수 적용해야한다.
- 모든 에러는 작업자가 의도에 맞게 처리할 수 있도록 한다.
- 하위 스코프 또는 상위 스코프에서 이미 에러 핸들링이 이루어지고 있다면 배제할 수 있다.

## 메서드별 에러 처리 전략

- GET: Component에서 처리한다. ErrorBoundary를 사용한다. ErrorBoundary는 React에서 제공하지 않으므로 [@suspensive/react](https://www.npmjs.com/package/@suspensive/react)를 사용한다.
- POST, PUT, PATCH, DELETE: 호출 시 try-catch를 이용해 에러를 처리한다. Error에 따른 후속 조치는 작업자에게 위임한다.


## GET 에러 처리

```tsx
// Page
const { data, isLoading, isError } = useRunListQuery();

return <RunList runs={data} isLoading={isLoading} isError={isError} />;

// Component
function RunList({ runs, isLoading, isError }: RunListProps) {
  if (isLoading) {
    return <Spinner />;
  }
  if (isError) {
    return <p>불러오기 실패</p>;
  }
  return <ul>{runs?.map(run => <RunItem key={run.id} run={run} />)}</ul>;
}
```

## POST/PUT/PATCH/DELETE 에러 처리

```ts
// ❌ 에러를 무시하지 않음
async function handleSpin() {
  await spinMutation.mutateAsync();
}

// ✅ 에러 처리 명시
async function handleSpin() {
  try {
    await spinMutation.mutateAsync();
  } catch (error) {
    // 사용자에게 에러 표시 (토스트, 모달 등)
  }
}
```
