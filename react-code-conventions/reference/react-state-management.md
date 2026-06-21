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

### 객체화 임계 — "몇 개부터"

*개수*가 아니라 아래일 때만 객체로 묶는다: ① **항상 함께 갱신**(위 예의 `value`/`isLoading`/`error` — fetch 흐름이라 같이 바뀜, 개수가 3이라서가 아님) ② 무관한 상태 **4개 이상**. 독립적 2~3개는 개별 `useState`가 명확 — 강제 객체화는 과적용([abstraction.md](../../common-code-conventions/reference/abstraction.md)).

## 객체 state 갱신 패턴

- 객체 state(폼 등)를 갱신할 때, 필드별로 핸들러를 각각 만들지 않는다.
- `key`와 `value`를 받아 해당 필드만 갱신하는 단일 핸들러를 만든다.

### 잘못된 사용

```tsx
const handleTitleChange = (next: string) =>
  setDraft((prev) => ({ ...prev, title: next }));
const handleBodyChange = (next: string) =>
  setDraft((prev) => ({ ...prev, body: next }));
const handleTagsInputChange = (next: string) =>
  setDraft((prev) => ({ ...prev, tagsInput: next }));
```

### 올바른 사용

```tsx
const handleFormChange = <K extends keyof Draft>(key: K, value: Draft[K]) => {
  setDraft((prev) => ({ ...prev, [key]: value }));
};
```

- Component에는 필드별 `onTitleChange`, `onBodyChange` 등을 각각 전달하지 않고, `onFormChange` 하나만 전달한다.

```tsx
interface PostEditorProps {
  draft: Draft;
  onFormChange: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
}
```

## useRef 사용 기준 — 라이프사이클을 벗어날 때만

`useRef`는 **렌더로 표현할 수 없는** 가변 값(타이머/raf 핸들, 동기 중복 가드, DOM 참조)에만. 화면에 반영돼야 하는 값은 ref가 아니라 state — ref는 바꿔도 리렌더가 안 된다.

```tsx
const [isOpen, setIsOpen] = useState(false); // ✅ 화면 반영 → state
const refIsSubmitting = useRef(false);       // ✅ 동기 중복 가드 → ref
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
