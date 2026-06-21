# Custom Hooks

## 작성 원칙

커스텀 훅 작성 시 (상위 원칙: [abstraction.md](../../common-code-conventions/reference/abstraction.md)):

1. **만들기 전**: "중복 < 잘못된 추상화" — 명세/구현 경계가 안 그어지면 묶지 말고 펼친다.
2. **주입점은 좁게**: 받는 의존(콜백·인자)을 한 점으로. 늘어나면 책임이 섞인 신호.
3. **반환은 의도만**: 행동 + 읽기 상태만. setter·내부 `ref`는 반환 금지(abstraction.md "노출 유형").
4. **도메인 로직은 은닉 금지**: 아래 참조 — container에 펼친다.

## 좋은 커스텀 훅 — React 라이프사이클 어댑터

추출해도 좋은 훅은 **단일 책임 + React 생명주기(effect·구독·`useRef`) 때문에 훅일 수밖에 없는** 것이다. 로직 자체는 유틸로 쓸 만큼 단순하지만, mount/visibility/cleanup이나 `useRef` 상태를 다뤄야 해서 훅으로 존재한다. **인터페이스(시그니처)만 보고 쓸 수 있고 구현을 몰라도 된다.**

판별 기준:

- **책임이 하나다** (로딩 상태 관리 / URL 파라미터 파싱·구독 / locale 변화 감지·새로고침 등).
- **도메인을 모른다** — 어느 화면에서나 똑같이 동작하는 횡단 관심사.
- **인터페이스로 충분하다** — 명확한 반환(값 튜플) 또는 부수효과 전용(`void`)이라 호출만으로 쓸 수 있다.

예:

- `useLoading()` — 비동기 로딩 상태 + 중복 실행 방지. ([modules/use-loading.md](./modules/use-loading.md))
- `useQueryParser()` — URL 쿼리 파라미터 파싱 + 구독. ([modules/use-query-parser.md](./modules/use-query-parser.md))
- `useReloadOnVersionChange(loadedVersion)` — 탭이 다시 보일 때 배포 버전이 바뀌었으면 새로고침(부수효과 전용). 로직은 단순하지만 visibility 구독 + `useRef` 중복 가드가 필요해 훅으로 존재한다.

```tsx
// 부수효과 전용 라이프사이클 훅 — 인터페이스는 호출 한 줄, 구현을 몰라도 된다.
export function useReloadOnVersionChange(loadedVersion: string) {
  const refChecking = useRef(false); // visibility 재진입 중복 검사 방지(동기 가드)

  const reloadIfOutdated = useCallback(async () => {
    if (refChecking.current) {
      return;
    }

    refChecking.current = true;

    try {
      const latestVersion = await fetchDeployedVersion();
      if (latestVersion !== loadedVersion) {
        window.location.reload();
      }
    } catch (error) {
      logError(error, 'version-check-failed');
    } finally {
      refChecking.current = false;
    }
  }, [loadedVersion]);

  // 탭이 다시 보일 때마다 검사 (visibility 라이프사이클 구독)
  useVisibilityEvent(state => state === 'visible' && reloadIfOutdated(), { immediate: true });
}
```

이런 훅은 아래의 "도메인 로직 추상화 훅"과 **정반대**다 — 도메인을 모르고, 구현을 안 봐도 쓸 수 있으며, 책임이 하나다.

### 반례: 상태·effect 없는 단순 래핑은 훅이 아니라 순수 함수다

라이프사이클(state·effect·`useRef`) **없이** 호출 한 줄만 훅으로 감싸면 과도한 추상화다. 훅일 *이유*가 없으면 순수 함수로 강등한다.

```tsx
// ❌ 상태·effect 없이 confetti()만 감싼 훅
export function useSharedConfetti() { return () => confetti({ particleCount: 100 }); }
// ✅ 순수 함수로 강등 — 소비처에서 직접 import
export function fireConfetti() { confetti({ particleCount: 100 }); }
```

> **라이프사이클 때문에 훅일 수밖에 없으면** 훅, **단순 호출이면** 순수 함수.

## 도메인 로직 추상화 훅을 만들지 않는다

여러 화면이 거의 같은 도메인 흐름(예: 미니게임 플레이, 제출→갱신)을 가져도 `useXxxPlay` 같은 **도메인 로직 custom hook으로 통합하지 않는다.** 각 container에 흐름을 **명시적으로 펼쳐** 두고 중복을 수용한다.

**이유** ([abstraction.md](../../common-code-conventions/reference/abstraction.md)의 hook 적용):

- 도메인 훅은 좋은 추상화의 조건(인터페이스만 보고 쓸 수 있음)을 못 지킨다 — 내부 구현(상태·이펙트·의존성 엮임)을 봐야 올바르게 쓸 수 있어 **새는 추상화**가 된다.
- container 로직과 추상화된 훅이 엮이면 흐름 추적이 더 어려워진다.
- 두 소비자의 요구가 갈리면 공유 훅에 분기가 쌓여 원래 중복보다 복잡해진다(조기·공유 추상화의 부패).

```tsx
// ❌ 흐름이 같다고 도메인 훅으로 통합 — 구현을 봐야 쓸 수 있고, 변형이 생기면 분기 폭발
function useMiniGamePlay(gameType: 'oddEven' | 'upDown') {
  /* 상태·이펙트·api가 한데 엮임 */
}

// ✅ 각 container에 펼쳐 둔다 (중복 수용)
function CoinEarnOddEvenGameContainer() {
  /* 플레이 흐름을 여기 직접 */
}
function CoinEarnUpDownGameContainer() {
  /* 거의 같지만 여기 직접 */
}
```

## 단, 상태에 의존하지 않는 순수 함수 추출은 권장

훅(상태·의존성과 엮임)과 **순수 함수**(입력→출력만)는 다르다. 상태에 의존하지 않는 계산·로직은 컴포넌트 밖 순수 함수로 추출해도 좋다 — 인터페이스가 명확해 새는 추상화가 아니다.

**컴포넌트가 비대하다는 이유로 도메인 훅을 만들지 않는다.** 쪼개기의 목적(책임 분할·가독성)은 흐름 전체를 훅에 몰빵하지 않고 **흐름과 다른 책임(상태 무관 계산 등)만 순수 함수로 뽑아도** 달성된다. 흐름(오케스트레이션)도 하나의 책임이라 container에 펼쳐 두고, 분리되는 다른 책임만 격리한다. 추상화의 격리 단위는 "핵심"이 아니라 "책임"이다 — [abstraction.md](../../common-code-conventions/reference/abstraction.md) "추상화는 '몰빵'이 아니다" 참조.

```tsx
// ✅ 순수 함수 추출 (상태 무의존, 입출력 명확) — 컴포넌트 외부에 둔다
function spinOnce(userId: string, coinBalance: number) {
  /* ... */
}
```

> 통합/추출 판단은 "지금 코드가 같은가"가 아니라 **명세/구현 경계가 그어지는가**로 한다. 행동이 같아도(중복으로 보여도) 경계를 못 그으면 훅으로 묶지 말고 펼친다.
