# Handler Patterns

## 네이밍 규칙

| 위치 | 패턴 | 예시 |
|------|------|------|
| 컴포넌트 내부 정의 | `handle{Action}{Event}` | `handleSubmitClick` |
| props로 전달 | `on{Action}{Event}` | `onSubmitClick` |

```tsx
// Page
function RunDetailPage() {
  const handleDeleteClick = () => {
    // 비즈니스 로직
  };

  return <RunDetail onDeleteClick={handleDeleteClick} />;
}

// Component
interface RunDetailProps {
  onDeleteClick: () => void;
}

function RunDetail({ onDeleteClick }: RunDetailProps) {
  return (
    <button onClick={onDeleteClick}>
      삭제
    </button>
  );
}
```

## 이벤트 네이밍 예시

| 이벤트 | 핸들러 패턴 |
|--------|------------|
| 클릭 | `onClick` / `handleDeleteClick` |
| 변경 | `onChange` / `handleAmountChange` |
| 제출 | `onSubmit` / `handleFormSubmit` |
| 포커스 | `onFocus` / `handleInputFocus` |

## 이벤트 객체 전달 금지

Component → Page로 이벤트 전달 시, 이벤트 객체 원본을 보내지 않는다. Page가 필요한 데이터만 가공하여 전달한다.

```tsx
// ❌ 이벤트 객체 원본 전달
interface AmountInputProps {
  onAmountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function AmountInput({ onAmountChange }: AmountInputProps) {
  return <input onChange={onAmountChange} />;
}

// ✅ 필요한 데이터만 가공하여 전달
interface AmountInputProps {
  // 위로 올려보내는 값이 원본이 아니라 가공되어 보내지면서, 상위 컴포넌트는 필요한 것에 집중 할 수 있음.
  onAmountChange: (amount: number) => void;
}

function AmountInput({ onAmountChange }: AmountInputProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formattedAmount = formatAmount(event.target.value);
    onAmountChange(formattedAmount);
  };

  return <input onChange={handleChange} />;
}
```
