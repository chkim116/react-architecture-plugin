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