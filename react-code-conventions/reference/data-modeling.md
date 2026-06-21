 # Data Modeling
 
 `models/`에 UI 도메인 모델과 변환 함수를 정의합니다. (데이터 페칭은 [queries.md](./queries.md))
 
 ## 역할
 
 모델링의 목적은 **서버 응답 파싱이 아니라 UI에 적합한 인터페이스 설계**입니다. 모델은 서버 응답의 거울이 아니라, "이 화면이 무엇을 표시/판단해야 하는가"에서 출발해 설계하고 변환 함수가 서버 응답을 그 형태로 맞춥니다.
 
 ```typescript
 // ❌ 서버 응답 구조를 그대로 복사 → 중첩·네이밍·nullable이 UI까지 전파
 export interface BadModel {
   userInfo: { profile: { displayName: string | null } | null } | null;
   pointResponse: { amount: number | null };
 }
 
 // ✅ 화면이 필요로 하는 형태로 재설계
 export interface ProfileModel {
   /**
    * 표시할 이름 (없으면 빈 문자열)
    */
   name: string;
   /**
    * 보유 포인트 (없으면 0)
    */
   point: number;
 }
 ```
 
 ## model 함수의 경계 — 변환은 model, 생성기는 utils

 데이터 모델링은 **양방향**이다: 서버→도메인(`to{Model}`) + **도메인→서버 변환도 model**(이때 서버 모델 = API request 타입, 예 `PostSpinParams`). 판정은 내부 복잡도가 아니라 **입출력 경계**로 한다.

 1. **한쪽이 서버 모델(응답 *또는* request 타입)인 변환 = model** (`to{Model}`, 계산 포함해도 변환).
    - 서버→도메인 `toAttendanceStreakModel`, 도메인→서버 `toPostSpinParams`(→ `external/apis/types/` request 타입 import 허용).
    - **판정 함수도 변환**: 서버 응답→boolean/number(`canX`/`getRemainingX`)도 model — 가능하면 모델 필드로 흡수해 `select`로 올린다.
 2. **무→도메인 생성기·비결정적(`Math.random`) = utils.** 입력이 이미 도메인이거나 `new Date()` 시각 의존 뷰 구성도 utils. (예: `spinSlot()`)
 3. **타입(`{X}Model`/`{X}Type`)은 항상 models** — 함수가 utils로 가도 타입은 남는다.

 ```typescript
 // model: 변환(도메인→서버)
 export function toPostSpinParams(result: SpinResultModel, userId: string): PostSpinParams { /* ... */ }
 // utils: 생성기(무→도메인, 비결정적). 결과 타입 SpinResultModel은 model에서 import
 export function spinSlot(): SpinResultModel { /* Math.random */ }
 ```

 > 도메인 모델이 뷰 형태를 다 품으면 중간 변환을 없앤다 — `buildWeek` util 대신 `AttendanceStreakModel.week`로 흡수.

 ## 네이밍
 
 | 구분 | 패턴 | 예시 |
 |------|------|------|
 | 파일명 | `{역할}.model.ts` | `home.model.ts` |
 | export interface | `{Feature}{SubFeature}{역할}Model` | `HomeDetailModel` |
 | export type (객체 · 객체 union) | `{Feature}{SubFeature}{역할}Model` | `RewardClaimModel` |
 | export type (원시 · literal union) | `{Feature}{SubFeature}{역할}Type` | `TmoneyPassStatusType` |
 | 변환 함수 (서버↔도메인, 양방향) | `to{Model}` | `toHomeDetailModel`(서버→도메인), `toPostSpinParams`(도메인→서버) |
 
 > SubFeature가 없거나 "Index"면 생략. Feature 이름은 축약 없이 완전히 포함, 역할은 구체적으로(`Data`보다 `BalanceData`).
 > **suffix는 `export`하는 선언에만 강제**한다(파일 내부 전용 보조 타입은 자유 — 예: union을 이루는 비-export 멤버). `interface`는 객체만 선언하므로 export하면 항상 `Model`. `type`은 **문법이 아니라 의미**로 가른다 — 객체·객체들의 discriminated union은 `Model`(예: `RewardClaimModel`), 원시 형태(`type StatusType = 'A' | 'B'` 같은 literal/primitive union 등 비객체)는 `Type`.
 > **함수는 변환 함수에만** `to{Model}`을 강제한다. 서버↔도메인 변환(응답→모델 *또는* 모델→request 타입)이 아니면(타입 가드·헬퍼·생성기 등) 이 규칙과 무관하며 일반 함수 네이밍을 쓴다.

 
 ## 작성 규칙
 
 - 모든 필드에 JSDoc 주석 필수 — 한 줄 `/** ... */` 금지, 항상 여러 줄 형식 (본문 예시 참고)
 - 변환 함수: 구조 분해 → 직접 반환. 복잡한 조건은 `ts-pattern`
 - **의존 금지**: React 코드(Container/Components/Queries/Hooks/Contexts), `external/`. 단 `external/apis/types/`(서버 응답·요청 원본 타입)만 import 허용
 
 **Models vs API Types**
 
 | 위치 | 역할 | 예시 |
 |------|------|------|
 | `external/apis/types/` | 서버 응답·요청 원본 타입 | `HomeDetailStatusResponse`, `PostSpinParams` |
 | `models/` | UI에서 사용할 변환 타입 | `HomeDetailStatusModel` |
 
 > 모델 타입을 `types/` 폴더에 두지 말 것 — `models/*.model.ts`에 둔다.
 ## Nullable 설계 원칙
 
 모델의 핵심 책임은 **서버의 nullable·optional을 흡수해 UI가 신뢰할 형태로 좁히는 것**입니다. nullable이 UI까지 새면 컴포넌트마다 방어 코드와 버그가 늘어납니다.
 
 ### 1. 서버 nullable은 모델 경계에서 흡수한다
 
 변환 함수(`to{Model}`)에서 확정값으로 좁힙니다. 우선순위:
 
 1. **기본값 흡수** — 의미가 통하는 기본값(`0`/`''`/`[]`)이 있으면 `??`로 채운다.
 2. **`| null` 유지** — 기본값이 정말 부적절할 때만 (최후 수단).
 
 ```typescript
 // ❌ 서버 nullable을 그대로 전파
 export interface BadModel {
   rewardAmount: number | null;
   nickname: string | null;
 }
 
 // ✅ 모델 경계에서 기본값으로 흡수
 export interface RewardModel {
   /**
    * 보상 금액 (없으면 0)
    */
   rewardAmount: number;
   /**
    * 닉네임 (없으면 빈 문자열)
    */
   nickname: string;
 }
 
 export function toRewardModel(response: RewardResponse): RewardModel {
   return {
     rewardAmount: response.rewardAmount ?? 0,
     nickname: response.nickname ?? '',
   };
 }
 ```
 
 **nullable 객체는 필드를 풀어서(flatten) 모델링한다.** 객체를 통째로 넘겨 UI에서 `reward?.balance`를 반복하게 두지 말고, 필요한 필드를 평탄화해 개별 필드로 내립니다. 객체가 통째로 없을 수 있어 기본값이 부적절하면 각 필드를 `T | null`로 둡니다.
 
 ```typescript
 // ❌ nullable 객체를 그대로 전파 → UI에서 reward?.balance 반복
 export interface BadModel {
   reward: { balance: number; dateTime: string } | null;
 }
 
 // ✅ 필드를 풀어서 평탄화 (보상이 통째로 없을 수 있으므로 | null)
 export interface RewardModel {
   /**
    * 보상 잔액. 없으면 null
    */
   rewardBalance: number | null;
   /**
    * 보상 적립 시각. 없으면 null
    */
   rewardDateTime: Date | null;
 }
 
 export function toRewardModel(response: RewardResponse): RewardModel {
   return {
     rewardBalance: response.reward?.balance ?? null,
     rewardDateTime: response.reward?.dateTime != null ? new Date(response.reward.dateTime) : null,
   };
 }
 ```
 
 > 필드들이 "항상 함께 있거나 함께 없다"면 흩어진 `| null`보다 **discriminated union**(원칙 3)이 더 명확합니다.
 > **`| null`은 최후 수단**: 기본값으로 흡수 가능하면 그쪽이 우선이고, 억지 기본값으로 "없음"을 덮어서도 안 됩니다. 남길 땐 의도를 JSDoc에 명시(예: "진행 중이 아니면 null").
 ### 2. "값 없음"은 `undefined`가 아닌 `null`로 표현한다
 
 UI 모델 필드에 optional(`?:`, → `undefined`)을 쓰지 않습니다. → `couponCode?: string` ❌ / `couponCode: string | null` ✅
 
 | 이유 | 설명 |
 |------|------|
 | 직렬화 일관성 | `undefined`는 JSON 직렬화 시 키가 사라짐. `null`은 보존됨 |
 | 의미 구분 | `?:`는 "필드 없음"과 "값 없음"을 뭉갬. `\| null`은 후자를 명시 |
 | 렌더링 안전성 | React에서 `null`은 안전하게 "렌더 안 함". `undefined`는 의도치 않은 분기 유발 |
 
 ### 3. 옵셔널이 불가피하면 guard/변환으로 명확히 한다
 
 필드 존재가 **다른 필드(주로 상태)에 종속**되면, optional로 흩뿌리지 말고 상태로 묶어 **discriminated union**으로 표현합니다. 타입이 "이 상태엔 이 필드가 반드시 있다"를 보장합니다.
 
 ```typescript
 // ❌ 상태 종속 필드를 optional로 → 어떤 조합이 유효한지 타입이 모름
 export interface BadRewardModel {
   status: 'AVAILABLE' | 'NONE';
   receivableRewards?: Reward[];
 }
 
 // ✅ 상태별로 필드를 보장하는 discriminated union
 interface RewardClaimAvailableModel {
   status: 'AVAILABLE';
   /**
    * 수령 가능한 보상 목록
    */
   receivableRewards: Reward[];
 }
 
 interface RewardClaimNoneModel {
   status: 'NONE';
 }
 
 // 객체들의 union = 데이터 집합 → Model (원시 union이면 Type)
 export type RewardClaimModel = RewardClaimAvailableModel | RewardClaimNoneModel;
 
 export function toRewardClaimModel(response: RewardResponse): RewardClaimModel {
   if (response.rewards != null && response.rewards.length > 0) {
     return { status: 'AVAILABLE', receivableRewards: response.rewards };
   }
   return { status: 'NONE' };
 }
 ```
