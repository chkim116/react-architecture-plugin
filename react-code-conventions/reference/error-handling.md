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
    // 사용자에게 에러 표시 (toast, confirm, alert 중 적절한 방식 선택)
  }
}
```

## 에러 피드백 종류

에러를 사용자에게 알리는 방식은 toast, confirm, alert 세 가지로 분류한다. 상황에 맞는 종류를 선택한다.

| 종류 | 사용 시점 | 특징 |
|------|-----------|------|
| toast | 가벼운 알림, 사용자의 추가 행동이 필요 없을 때 | 일정 시간 후 자동으로 사라짐 |
| confirm | 사용자의 선택(재시도/취소 등)이 필요할 때 | 사용자가 응답해야 다음 동작이 결정됨 |
| alert | 작업을 막아야 하는 차단성 안내가 필요할 때 | 사용자가 확인해야 다음으로 진행 가능 |

```ts
// toast — 가벼운 알림, 흐름을 막지 않음
async function handleLike() {
  try {
    await likeMutation.mutateAsync();
  } catch (error) {
    showToast('좋아요 처리에 실패했습니다.');
  }
}

// confirm — 사용자의 선택이 필요
async function handleSubmit() {
  try {
    await submitMutation.mutateAsync();
  } catch (error) {
    const shouldRetry = await showConfirm('제출에 실패했습니다. 다시 시도할까요?');
    if (shouldRetry) {
      handleSubmit();
    }
  }
}

// alert — 차단성 안내, 사용자 확인 필요
async function handlePayment() {
  try {
    await paymentMutation.mutateAsync();
  } catch (error) {
    showAlert('결제에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}
```
