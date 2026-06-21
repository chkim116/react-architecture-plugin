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

## 예외 1: 콜백을 주입받는 hook은 의존 대상 직후에 둔다

다른 handler/hook을 **인자로 주입받는** hook은 "fetching=상단(2)"의 예외다. 주입 대상(handler=5)에 의존하므로 상단에 올리면 **TDZ로 깨진다** → 의존 대상 정의 **직후**에 둔다.

```ts
function handleAdRewardEarned() { /* ... */ }
// 상단(fetching)이 아니라 여기 — handleAdRewardEarned에 의존
const { showAd } = useSharedAdReward({ onRewardEarned: handleAdRewardEarned });
```

## 예외 2: 파생값은 의존 대상 직후, 사용처 직전에 둔다

`const canSpin = coinBalance >= SPIN_COST` 같은 파생값(memo·계산)은 1~7에 자리가 없다 → **의존 대상(state·hook 결과) 바로 뒤, 사용처 바로 앞**에 둔다.

```ts
const [coinBalance] = useState(0);          // 3. state
const canSpin = coinBalance >= SPIN_COST;   // 파생값 — 의존 직후
function handleSpinClick() { /* canSpin 사용 */ }  // 5. handler
```
