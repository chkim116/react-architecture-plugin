# Params (URL Parameters)

URL 쿼리/동적 파라미터를 타입화된 객체로 변환하는 훅 패턴. `useQueryParser`를 기반으로 Page(Feature)/SubFeature별 파라미터를 정제한다.

## 원칙

- `useParams` / `useSearchParams`는 **직접 호출 금지**. 반드시 `hooks/`에 파라미터 훅으로 래핑해서 사용한다.
- Page(Feature) 당 **하나**의 파라미터 훅만 정의한다. 파라미터 훅이 유일한 진입점이다.
- 파편화되어 있으면 어떤 파라미터가 들어오고 어떻게 관리되는지 알기 어렵다.
- 파라미터 훅 내부에서는 shared-modules의 `useQueryParser`를 사용한다.
- Page, Component 모두 `useParams` / `useSearchParams` 직접 호출 금지.

## 구현 패턴

3단계 구조: **Interface → Refiner 함수 → Hook**

### 기본 (단순 변환)

```tsx
// src/features/RunDetail/Index/hooks/useRunDetailParams.ts
import { useQueryParser } from '@/shared/hooks/useQueryParser';

interface RunDetailParams {
  /**
   * 러닝 기록 ID
   */
  id: number;
}

function refineRunDetailQueryParams(query: Record<string, string>): RunDetailParams {
  return {
    id: Number(query.id) || 0,
  };
}

export function useRunDetailParams() {
  return useQueryParser(refineRunDetailQueryParams);
}
```

### Refiner에서 타입 변환·기본값 처리

타입 변환과 기본값 처리는 Refiner에서 완료한다. Refiner 반환 타입은 `{Page}Params` / `{Feature}Params` interface와 동일하게 명시한다.

```tsx
interface RunListParams {
  /**
   * 정렬 기준
   * - URL 쿼리 파라미터 `sortBy`
   *
   * @default 'date'
   */
  sortBy: 'date' | 'distance';
  /**
   * 임베디드 웹뷰에서 렌더링 되는지 여부
   * - URL 쿼리 파라미터 `isEmbedded=true`
   */
  isEmbedded: boolean;
}

function refineRunListQueryParams(query: Record<string, string>): RunListParams {
  return {
    sortBy: query?.sortBy === 'distance' ? 'distance' : 'date',
    isEmbedded: query?.isEmbedded === 'true',
  };
}

export function useRunListParams() {
  return useQueryParser(refineRunListQueryParams);
}
```

Context 등 URL 외 소스가 필요할 때만 훅 내부에서 후처리한다.

## 네이밍 규칙

> Page prefix(`useRunDetailParams`)와 Feature prefix(`useRunListParams`)는 동일 개념이다. Feature/SubFeature 폴더 구조에서는 Feature 네이밍을 사용한다.

### Page / Feature 레벨 (단일 SubFeature / Index)

| 요소 | 패턴 | 예시 |
|------|------|------|
| 훅 이름 | `use{Page}Params` / `use{Feature}Params` | `useRunDetailParams`, `useRunListParams` |
| 인터페이스 | `{Page}Params` / `{Feature}Params` | `RunDetailParams`, `RunListParams` |
| 정제 함수 | `refine{Page}QueryParams` / `refine{Feature}QueryParams` | `refineRunDetailQueryParams`, `refineRunListQueryParams` |
| 파일명 | `use{Page}Params.ts` / `use{Feature}Params.ts` | `useRunDetailParams.ts`, `useRunListParams.ts` |

### SubFeature 레벨

| 요소 | 패턴 | 예시 |
|------|------|------|
| 훅 이름 | `use{Feature}{SubFeature}Params` | `useRunDetailShareParams` |
| 인터페이스 | `{Feature}{SubFeature}Params` | `RunDetailShareParams` |
| 정제 함수 | `refine{Feature}{SubFeature}QueryParams` | `refineRunDetailShareQueryParams` |

### Common (SubFeature 간 공용)

| 요소 | 패턴 | 예시 |
|------|------|------|
| 훅 이름 | `use{Feature}CommonParams` | `useRunCommonParams` |
| 인터페이스 | `{Feature}CommonParams` | `RunCommonParams` |
| 정제 함수 | `refine{Feature}CommonQueryParams` | `refineRunCommonQueryParams` |

### 중첩 SubFeature

3단계 이상 중첩도 동일 패턴 적용. 전체 경로를 연결한다.

| 요소 | 패턴 | 예시 |
|------|------|------|
| 훅 이름 | `use{전체경로}Params` | `useRunDetailSharePreviewParams` |
| 인터페이스 | `{전체경로}Params` | `RunDetailSharePreviewParams` |
| 정제 함수 | `refine{전체경로}QueryParams` | `refineRunDetailSharePreviewQueryParams` |

> SubFeature가 "Index"인 경우 생략, Common은 "Common"을 SubFeature 자리에 사용 ([folder-conventions.md](../docs/folder-naming.md) 규칙 준수)

## 파일 위치

| 레벨 | 경로 |
|------|------|
| Feature (Index) | `src/features/{Feature}/Index/hooks/use{Feature}Params.ts` |
| SubFeature | `src/features/{Feature}/{SubFeature}/Index/hooks/use{Feature}{SubFeature}Params.ts` |
| Common | `src/features/{Feature}/common/hooks/use{Feature}CommonParams.ts` |

Page prefix 구조(`pages/` + `hooks/`)를 사용하는 앱은 [folder-naming.md](../docs/folder-naming.md)의 `hooks/use{Page}Params.ts` 규칙을 따른다.

## JSDoc

파라미터 훅 반환 interface의 **각 필드에 JSDoc 필수**. 파라미터 용도와 출처(URL 쿼리 키, 동적 경로 등)를 명시한다.

```tsx
interface RunListParams {
  /**
   * 정렬 기준
   *
   * @default 'date'
   */
  sortBy: 'date' | 'distance';
}
```

- 속성 설명과 `@default`는 **하나의 블록**으로 작성한다.
- 분리된 JSDoc 블록 금지

전체 JSDoc 규칙은 [jsdoc.md](./jsdoc.md)를 참조한다.

## 기본값 처리

모든 파라미터에 **기본값 필수** (undefined 방지). Refiner 또는 훅 내부에서 처리한다.

| 타입 | 기본값 | 예시 |
|------|--------|------|
| `boolean` | `false` | `query?.flag === 'true'` |
| `string` | `''` | `query?.code ?? ''` |
| `number` | `0` 또는 적절한 값 | `Number(query?.index) \|\| 0` |

## 기반 훅: useQueryParser

쿼리 파라미터를 추출하는 공용 훅은 `useQueryParser`를 사용한다. 상세 구현은 [shared-modules.md](./shared-modules.md#usequeryparser)를 참조한다.

```typescript
import { useQueryParser } from '@/shared/hooks/useQueryParser';

const params = useQueryParser(refineRunListQueryParams);
```

## 사용 예시

```tsx
// Container에서 사용
function RunListContainer() {
  const { sortBy, isEmbedded } = useRunListParams();
  return <RunList sortBy={sortBy} isEmbedded={isEmbedded} />;
}
```

## 주의사항

- Page(Feature)/SubFeature **내에서만 사용** (외부 노출 금지)
- 타입 변환 및 기본값 처리는 **Refiner에서 완료** (훅은 URL 외 소스가 필요할 때만 후처리)
