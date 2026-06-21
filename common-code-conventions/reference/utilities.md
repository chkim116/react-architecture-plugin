# 유틸리티 함수 — es-toolkit 우선

배열·객체·문자열 조작, 함수 제어(debounce/throttle) 등 범용 유틸리티는 **직접 구현하지 않고 [es-toolkit](https://www.npmjs.com/package/es-toolkit)이 지원하는 함수를 우선 사용**한다.

## 원칙

- es-toolkit에 동일한 기능이 있으면 직접 구현하지 않는다. 직접 구현은 테스트·엣지 케이스·유지보수 비용을 매번 다시 떠안는다.
- lodash 등 다른 유틸리티 라이브러리를 새로 도입하지 않는다. 기본 유틸리티 라이브러리는 es-toolkit이다.
- es-toolkit에 없는 도메인 전용 로직만 직접 작성한다.

## 자주 쓰는 대응표

| 하고 싶은 것 | 직접 구현 대신 | import |
|------|------|------|
| 배열 중복 제거 | `uniq`, `uniqBy` | `es-toolkit` |
| 키 기준 그룹화 | `groupBy` | `es-toolkit` |
| 객체 깊은 복사 | `cloneDeep` | `es-toolkit` |
| 객체 깊은 병합 | `merge` | `es-toolkit` |
| 특정 키만 추출/제외 | `pick`, `omit` | `es-toolkit` |
| 디바운스 / 스로틀 | `debounce`, `throttle` | `es-toolkit/function` |

> 전체 목록과 정확한 시그니처는 [es-toolkit 문서](https://es-toolkit.dev)를 참조한다.

## 사용 예시

```ts
// Bad — 직접 구현
function uniqueIds(ids: number[]) {
  const result: number[] = [];
  ids.forEach((id) => {
    if (!result.includes(id)) {
      result.push(id);
    }
  });
  return result;
}

// Good — es-toolkit 사용
import { uniq } from 'es-toolkit';

const uniqueIds = uniq(ids);
```

```ts
// Bad — 직접 구현한 그룹화
const grouped: Record<string, Run[]> = {};
runs.forEach((run) => {
  const key = run.date;
  if (!grouped[key]) {
    grouped[key] = [];
  }
  grouped[key].push(run);
});

// Good
import { groupBy } from 'es-toolkit';

const grouped = groupBy(runs, (run) => run.date);
```
