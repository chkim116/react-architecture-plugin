# React State Management Conventions

## useState 규칙

- useState를 너무 많은 상태를 관리하기 위해 사용하지 않는다.
- 다양한 상태를 제어해야할 경우 객체를 이용해 관리한다.

### 잘못된 사용

```tsx
const [value, setValue] = useState(0);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);
```

### 올바른 사용

```tsx
const [state, setState] = useState<State>({
  value: 0,
  isLoading: false,
  error: null,});
```

## useRef 네이밍 규칙
| 구분 | 패턴 | 예시 |
|------|------|------|
| useRef 변수 | `ref{PascalCase}` | `refHasOpened`, `refScrollPosition`, `refInputElement` |

### 잘못된 사용
```tsx
// ❌ Ref 접미사 사용 (기존 컨벤션)
const hasOpenedRef = useRef(false);
// ❌ 접두사 없음
const hasOpened = useRef(false);
```

### 올바른 사용

```tsx
// ✅ ref- 접두사 사용
const refHasOpened = useRef(false);
const refScrollY = useRef(0);
const refInputElement = useRef<HTMLInputElement>(null);

// ✅ StrictMode 중복 실행 방지
useEffect(() => {
  if (refHasOpened.current) {
    return;
  }
  refHasOpened.current = true;
  // 한 번만 실행할 로직
}, []);
```
