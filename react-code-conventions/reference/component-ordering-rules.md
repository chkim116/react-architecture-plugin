# Component Ordering Rules

## 컴포넌트 내부 코드 배치 순서

컴포넌트 내부 hook 및 함수는 **반드시 다음 순서**로 배치한다. 이 순서는 코드 가독성을 높이고 의존성을 명확히 한다.

### 배치 순서

1. **params** — 컴포넌트에 전달된 파라미터 처리 훅 or 함수
2. **fetching 관련** — `useQuery`, `useMutation`, `useInfiniteQuery` 등 데이터 연동
3. **상태 관리** — `useState`
4. **ref** — `useRef`
5. **handler 함수** — `handleXxx` 형태의 이벤트 핸들러와 로직 함수
6. **side effect** — `useEffect`, `useLayoutEffect`
7. **JSX 반환** — `return <...>`


```ts
// ✅ 올바른 순서
function SpinContainer() {
  // 1. params
  const { id } = useParams();

  // 2. fetching
  const { data: user } = useQuery({ ... });
  const spinMutation = useMutation({ ... });

  // 3. state
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);

  // 4. ref
  const spinButtonRef = useRef<HTMLButtonElement>(null);

  // 5. handlers
  function handleSpin() {
    setIsSpinning(true);
  }

  function handleSpinComplete(result: SpinResult) {
    setResult(result);
    setIsSpinning(false);
  }

  // 6. effects
  useEffect(() => {
    if (isSpinning) {
      // 로직
    }
  }, [isSpinning]);

  // 7. JSX
  return (
    <div>
      <button ref={spinButtonRef} onClick={handleSpin}>
        스핀
      </button>
    </div>
  );
}
```
