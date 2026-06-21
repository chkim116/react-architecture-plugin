 # Queries
 
 `queries/` 폴더에는 데이터 페칭을 위한 React Query Hooks를 정의합니다.
 
 > 서버 응답을 UI 모델로 변환하는 규칙은 [data-modeling.md](./data-modeling.md)를 참조하세요.
 **역할**
 - 서버 상태 관리, SSR Prefetch 지원
 
 **네이밍 규칙**
 
 | 구분 | 패턴 | 예시 |
 |------|------|------|
 | 파일명 | `use{Feature}{SubFeature}{도메인}SuspenseQuery.ts` | `useHomeDetailSuspenseQuery.ts` |
 | queryOptions | `{feature}{subFeature}{도메인}QueryOptions` | `homeDetailQueryOptions` |
 | Query Hook (useSuspenseQuery) | `use{Feature}{SubFeature}{도메인}SuspenseQuery` | `useHomeDetailSuspenseQuery` |
 | Query Hook (useQuery) | `use{Feature}{SubFeature}{도메인}Query` | `useHomeDetailQuery` |
 
 > ⚠️ `useSuspenseQuery`를 사용하면 `-SuspenseQuery` suffix, `useQuery`를 사용하면 `-Query` suffix를 사용합니다.
 > queryOptions 변수명에는 SuspenseQuery를 붙이지 않습니다.
 > SubFeature가 없거나 "Index"인 경우, 네이밍에서 생략합니다.
 **작성 규칙**
 - `@tanstack/react-query`에서 import
 - GET 요청만 정의 (POST/PUT/DELETE는 Container에서 직접 호출)
   - **예외**: POST 메서드라도 **데이터 조회(읽기) 목적**이면 queryOptions에서 사용 가능
   - 예: `postUserNoByToken` (토큰으로 유저 번호 조회), `postTransactionsBetween` (거래 내역 조회)
 - `queryOptions` export 필수 (QueriesHydration용)
 - `select` 함수가 필요하면 `models/`에 정의
 - SubFeature가 없거나 "Index"인 경우, 네이밍에서 생략
 
 ### useMutation을 사용하지 않는 이유
 
 **핵심**: Mutation 후 플로우는 Container의 비즈니스 로직이다.
 
 | 관점 | 설명 |
 |------|------|
 | **React Query의 가치** | GET에서 캐싱, 리페칭, stale 관리. Mutation에는 이 가치가 없음 |
 | **플로우 가시성** | 성공 → navigate, 실패 → overlay 등 후속 동작이 Container에 명시적으로 보임 |
 | **단순성** | async/await + try-catch로 충분. 추가 추상화 레이어 불필요 |
 
 ```tsx
 // ✅ Container에서 직접 호출
 function SomeContainer() {
   const handleSubmit = async () => {
     try {
       await homeApi.postSomething();
       navigate.somewhere();
     } catch (error) {
       showErrorOverlay(error);
     }
   };
 
   return <Button onClick={handleSubmit} />;
 }
 ```
 
 **요약**: GET은 React Query로 캐싱 이점을 누리고, POST/PUT/DELETE는 Container에서 직접 제어한다.
 
 ### queryOptions를 Hook으로 감싸는 이유
 
 **핵심**: 관심사 분리. Container는 **값**만 필요하고, 나머지는 queries가 처리한다.
 
 | 역할 | Container | Query Hook |
 |------|-----------|------------|
 | **관심사** | 비즈니스 로직, UI 렌더링 | 캐싱, 리페칭, stale 관리, 에러 재시도 |
 | **알아야 할 것** | 반환된 데이터 | queryKey, queryFn, select, enabled 등 |
 | **경계** | `const { data } = useXxxQuery()` | React Query 설정 전체 |
 
 ```tsx
 // ❌ Container가 React Query 설정을 알아야 함
 function SomeContainer() {
   const { data } = useSuspenseQuery({
     queryKey: ['homeDetail'],
     queryFn: () => homeApi.fetchHomeDetail(),
     select: toHomeDetailModel,
   });
 }
 
 // ✅ Container는 값만 받음. 나머지는 Query Hook이 캡슐화
 function SomeContainer() {
   const { data } = useHomeDetailSuspenseQuery();
 }
 ```
 
 **queryOptions 작성 규칙**
 - 항상 `queryKey`와 `queryFn` 정의
 - `queryKey`는 배열 형식
 - `queryKey` 첫번째 원소 = 함수명, 이후 = 파라미터
 
 **금지 의존성**
 - Container, Components
 
 ```tsx
 import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
 import { homeApi } from 'external/apis/home.api';
 
 // 기본 queryOptions
 export const homeDetailQueryOptions = queryOptions({
   queryKey: ['homeDetailQueryOptions'],
   queryFn: () => homeApi.fetchHomeStatus(),
 });
 
 // 파라미터가 있는 경우
 export const homeDetailQueryOptions = (id: string) => queryOptions({
   queryKey: ['homeDetailQueryOptions', id],
   queryFn: () => homeApi.fetchProfile(id),
 });
 
 // Hook (useSuspenseQuery 사용 → SuspenseQuery suffix)
 export function useHomeDetailSuspenseQuery() {
   return useSuspenseQuery(homeDetailQueryOptions);
 }
 ```
 
 ### 변환 함수(`select`)와의 연결
 
 서버 응답을 UI 모델로 변환하는 `to{Model}` 함수는 `models/`에 정의하고, `queryOptions`의 `select`에서 사용합니다. 변환 함수 작성 규칙과 nullable 처리 원칙은 [data-modeling.md](./data-modeling.md)를 참조하세요.
 
 ```tsx
 // queries/useHomeDetailStatusSuspenseQuery.ts
 import { toHomeDetailStatusModel } from '../models/status.model';
 
 export const homeDetailStatusQueryOptions = queryOptions({
   queryKey: ['homeDetailStatus'],
   queryFn: () => homeApi.fetchHomeStatus(),
   select: toHomeDetailStatusModel, // 서버 응답 → UI 모델 변환
 });
 
 export function useHomeDetailStatusSuspenseQuery() {
   return useSuspenseQuery(HomeDetailStatusQueryOptions);
 }
 ```

### `select`로 1차 변환 — 1:N이라고 select를 버리지 않는다

응답→모델 **1차 변환은 항상 `select`**. 1:N이라도 주 모델은 select, **시간·모델 간 의존 2차 파생만** Container에 남긴다.

```tsx
const { data: coupon } = useCouponSuspenseQuery();          // select: toCouponModel (1차)
const isExpiringSoon = getDaysUntil(coupon.expiresAt) <= 3; // new Date() 의존 → Container 2차 파생
```

### 다중 suspense 쿼리는 `useSuspenseQueries`로 병렬화

suspense 쿼리를 **2개 이상** 쓰면 `useSuspenseQueries`로 병렬화한다 — 연달아 호출하면 **워터폴**(앞이 끝나야 뒤 시작). 뒤 쿼리가 앞 결과에 *진짜* 의존할 때만 직렬.

```tsx
// ❌ 워터폴: const {data:user}=useUserQ(); const {data:att}=useAttQ(user.id);
// ✅ 병렬:
const [{ data: user }, { data: att }] = useSuspenseQueries({
  queries: [userQueryOptions(ID), attendanceQueryOptions(ID)],
});
```

### 명령형 prefetch / 읽기 — `ensureQueryData`

컴포넌트 렌더링이 아니라 **이벤트 핸들러·로더 등에서 GET 데이터를 미리 가져오거나 한 번 읽어야 할 때**는 같은 `queryOptions`를 `queryClient.ensureQueryData`에 넘긴다. 캐시에 있으면 그 값을, 없으면 fetch 후 캐시에 채워 반환한다.

- 직접 `api`를 호출하지 않고 항상 `queryOptions`를 거친다. → queryKey·캐시·`select` 모델링을 그대로 재사용한다.
- 반환값도 `select`로 변환된 UI 모델이므로, [data-modeling.md](./data-modeling.md) 원칙이 동일하게 적용된다.

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { homeDetailQueryOptions } from '../queries/useHomeDetailSuspenseQuery';

function SomeContainer() {
  const queryClient = useQueryClient();

  const handlePrefetchClick = async () => {
    // 캐시에 있으면 캐시값, 없으면 fetch 후 반환 (select 모델 적용됨)
    const homeDetail = await queryClient.ensureQueryData(homeDetailQueryOptions);
    // ...
  };
}
```

> `ensureQueryData`는 GET(읽기)에만 사용한다. POST/PUT/DELETE는 [error-handling.md](./error-handling.md)대로 Container에서 직접 호출한다.