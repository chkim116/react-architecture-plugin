# useLoading

> **layer**: shared · **위치**: `src/shared/hooks/useLoading.ts`
> 이 파일이 `useLoading`의 SSOT(구현 단일 출처)다. 다른 문서는 구현을 중복하지 않고 여기를 링크한다.

- 중복 클릭 방지를 위한 비동기 로딩 상태 관리 훅이다.
- 비동기 콜백을 감싼 **핸들러를 반환**한다. 그 핸들러가 호출되는 동안 자동으로 로딩 상태를 켜고/끄며, 이미 실행 중이면 추가 호출을 무시한다.
- 콜백은 핸들러가 실제로 호출될 때까지 실행되지 않으므로(thunk), 같은 이벤트 틱에 두 번 클릭돼도 부작용(네트워크 요청 등)이 재실행되지 않는다. `promise`를 직접 인자로 받는 형태는 인자가 호출 시점에 이미 실행돼 이 방어가 깨지므로 쓰지 않는다.
- 컴포넌트가 언마운트된 뒤에 setState가 호출되는 것도 방지한다.
- 도메인 무지지만 여러 feature가 공유하는 횡단관심사라 `shared`다. React(훅)에 의존해 `core`(무의존·non-React)에는 둘 수 없다. ([core vs shared 판단 기준](../folder-conventions.md))

```tsx
// useLoading.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * @description
 * `useLoading`은 비동기 작업의 로딩 상태와 중복 실행 방지를 함께 관리하는 React 커스텀 훅입니다.
 * 콜백을 감싼 핸들러를 돌려주며, 그 핸들러가 호출되는 동안 자동으로 로딩 상태를 켜고/끄고,
 * 이미 실행 중이면 추가 호출을 무시합니다. 언마운트 이후 setState 호출도 방지합니다.
 *
 * @returns {[loading: boolean, withLoading: <T>(callback: () => Promise<T>) => () => Promise<T | undefined>]}
 *  - 첫 번째 값 `loading`:
 *    : 현재 비동기 작업이 진행 중인지 여부를 나타내는 boolean 값입니다.
 *    : 초기값은 `false`이며, 작업이 시작되면 `true`, 작업이 끝나면 `false`가 됩니다.
 *
 *  - 두 번째 값 `withLoading`:
 *    : 시그니처는 `<T>(callback: () => Promise<T>) => () => Promise<T | undefined>` 입니다.
 *    : 비동기 콜백을 받아 로딩/중복방지로 감싼 **핸들러**를 반환합니다. 반환된 핸들러를 그대로 `onClick` 등에 연결합니다.
 *    : 콜백은 핸들러가 실제 호출될 때까지 실행되지 않아(thunk) 같은 틱 더블클릭의 부작용 재실행을 막습니다.
 *    : 이미 실행 중이면 콜백을 호출하지 않고 `undefined`를 반환합니다.
 *    : 컴포넌트가 언마운트된 상태라면 `setState`를 호출하지 않도록 방어 로직이 들어 있습니다.
 *
 * @example
 * function ConfirmButton() {
 *   const [loading, withLoading] = useLoading();
 *
 *   // 콜백 전체를 감싸 핸들러를 만든다. (api 호출 + 후속 상태 갱신까지 한 번에)
 *   const handleSubmit = withLoading(async () => {
 *     try {
 *       const result = await postConfirmation();
 *       router.push(`/success?id=${result.id}`);
 *     } catch (error) {
 *       showToast('처리에 실패했어요.');
 *     }
 *   });
 *
 *   return (
 *     <button disabled={loading} onClick={handleSubmit}>
 *       {loading ? 'Loading...' : 'Confirm'}
 *     </button>
 *   );
 * }
 */
export function useLoading(): [boolean, <T>(callback: () => Promise<T>) => () => Promise<T | undefined>] {
  const [loading, setLoading] = useState(false);
  const mountedRef = useIsMountedRef();
  const isRunningRef = useRef(false); // 현재 비동기 작업이 실행 중인지 여부를 저장하는 ref

  /**
   * @description
   * 비동기 콜백을 받아, 로딩 상태와 중복 실행을 관리하는 핸들러를 반환합니다.
   *
   * - 이미 실행 중(`isRunningRef.current === true`)이면 콜백을 호출하지 않습니다.
   *   콜백은 thunk라 이 시점까지 실행되지 않으므로 부작용 재실행이 차단됩니다.
   * - 언마운트 이후에는 `mountedRef.isMounted` 체크로 안전하게 `setLoading` 호출을 막습니다.
   */
  const withLoading = useCallback(
    <T>(callback: () => Promise<T>) =>
      async (): Promise<T | undefined> => {
        // 이미 실행 중이면 중복 호출 방지 (콜백 자체를 실행하지 않음)
        if (isRunningRef.current) {
          return;
        }

        isRunningRef.current = true;

        if (mountedRef.isMounted) {
          setLoading(true);
        }

        try {
          return await callback();
        } finally {
          isRunningRef.current = false;

          if (mountedRef.isMounted) {
            setLoading(false);
          }
        }
      },
    [mountedRef.isMounted]
  );

  // 매 렌더마다 동일한 참조를 유지하기 위해 useMemo로 튜플을 메모이제이션합니다.
  return useMemo(() => [loading, withLoading], [loading, withLoading]);
}

/**
 * @description
 * 컴포넌트의 마운트 여부를 ref로 추적하는 훅입니다.
 *
 * - `ref.isMounted`는 컴포넌트가 마운트된 상태면 `true`, 언마운트되면 `false`가 됩니다.
 * - 언마운트 이후에 setState를 호출하는 것을 방지하기 위한 용도로 사용합니다.
 */
function useIsMountedRef() {
  const ref = useRef({ isMounted: true }).current;

  useEffect(
    function trackMountedState() {
      ref.isMounted = true;

      // cleanup 시점(언마운트)에서 isMounted를 false로 변경
      return () => {
        ref.isMounted = false;
      };
    },
    [ref]
  );

  return ref;
}
```

## 참조

- 중복 클릭 방지 적용 규칙: [prevent-duplicated-click.md](../prevent-duplicated-click.md)
- 공용 훅 JSDoc 작성 규칙: [jsdoc.md](../jsdoc.md)
