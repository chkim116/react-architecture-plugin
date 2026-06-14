# Abstraction

## 추상화 기본 원칙 (Core Principles)

- 남용 방지 (No Over-Abstraction): 단순히 재사용될 가능성이 있다는 이유만으로 로직을 분리하거나 추상화 계층을 만들지 않는다. 중복 코드의 비용보다 잘못된 추상화의 비용이 훨씬 크다.
- 구조적 리팩토링 우선 (Structure First): 로직을 별도 모듈이나 객체로 추출하기 전에, 함수/클래스/컴포넌트 자체의 책임을 쪼개고 분리하는 것이 우선이다.
- 새는 추상화 금지 (Anti-Leaky Abstraction): 추상화된 모듈의 내부 구현을 알아야만 해당 모듈을 올바르게 사용할 수 있다면, 이는 잘못된 추상화이다. 내부 구현은 철저히 숨겨져야 한다.


## 새는 추상화 (Leaky Abstraction)

- 모듈(함수, 클래스, 컴포넌트, 모듈 등)의 인터페이스를 설계할 때 다음 기준을 엄격히 적용한다.

### 인터페이스 노출 기준

- 의도(Intent) 기반 인터페이스 (✅ 허용): "무엇을 할 것인가"에 대한 행동과 결과 데이터만 외부에 노출한다.
- 구현(Implementation) 기반 인터페이스 (❌ 금지): 내부 상태를 어떻게 조작하는지, 내부 참조가 어떻게 구성되어 있는지 외부에 노출하지 않는다.

```ts
// ❌ Before: 새는 추상화 (Leaky Abstraction)
// 내부 상태 조작기(set)를 그대로 노출하여 외부에서 이 모듈의 내부 메커니즘을 알아야 함
class LocationTracker {
    private status = "IDLE"
    private coordinates = []

    public getStatus() { return this.status }
    public setStatus(status) { this.status = status } // 내부 상태 조작 메커니즘 노출
    public setCoordinates(coords) { this.coordinates = coords }
}

// 위 잘못된 추상화를 사용하는 호출부
const tracker = new LocationTracker()
tracker.setCoordinates([])    // 사용자가 초기화 순서를 알아서 제어해야 함
tracker.setStatus("TRACKING") // 의도가 아닌 구현을 지시함
```

```ts
// ✅ After: 올바른 추상화 (의도 기반 인터페이스)
// 외부에 구현을 감추고 오직 행동(Intent)만 노출함
class LocationTracker {
    private status = "IDLE"
    private coordinates = []

    public getMetrics() {
        return { isTracking: this.status === "TRACKING", count: this.coordinates.length }
    }

    // 명시적인 행동 정의
    public startTracking() {
        this.coordinates = []
        this.status = "TRACKING"
    }

    public stopTracking() {
        this.status = "IDLE"
        return this.coordinates
    }
}

// 위 올바른 추상화를 사용하는 호출부
const tracker = new LocationTracker()
tracker.startTracking() // 사용자는 무엇을 할지만 지시하며, 내부 메커니즘을 알 필요가 없음
```

### 노출 유형

| 노출 유형 | 판단 | 설명 | 예시 |
|----------|------|------|------|
| 읽기 전용 상태 및 데이터 | ✅ OK | 모듈이 가공 완료한 결과물 데이터 | "isTracking, totalDistance" |
| 행동 기반 함수 (의도 표현) | ✅ OK | 외부에서 호출할 수 있는 명시적인 행위 | "start(), stop(), reset()" |
| 구현 기반 함수 (상태 직접 조작) | ❌ 금지 | 외부에서 내부 상태 조작 메커니즘을 통제 | "setValue(), setInternalState()" |
| 내부 참조 및 포인터 | ❌ 금지 | 내부에서만 사용해야 하는 참조 객체 직접 노출 | "timerRef, dbConnection" |

**핵심:** "무엇을 할지"(의도) 노출은 OK, "어떻게 조작할지"(구현) 노출은 금지.

새는 추상화의 주요 징후 (코드 검토 시 필수 체크)

- 과도한 의존성 체인: 모듈 A가 B에 의존하고, B가 C에 의존하며, C의 변경이 A의 명세에 영향을 주는 3단계 이상의 체인이 발생하는 경우.
- 지식의 요구: "이 모듈 내부에서 X 알고리즘/상태를 쓰니까 외부에서도 Y 처리를 해줘야 한다"식의 설명이 주석이나 문서에 필요할 때.
- 직접 조작기 노출: 반환 값이나 파라미터에 내부 원시 상태를 직접 제어하는 핸들러(set- 형태 등)가 포함되어 있을 때.

##  과도한 추상화 (Over-Abstraction)

- 단순 연산 및 조건식의 오버헤드 금지: 복잡한 상태를 가지지 않고, 단순 조건을 판단하는 로직을 굳이 별도 디자인 패턴이나 프레임워크 전용 확장(예: 커스텀 훅, 미들웨어)으로 만들지 않는다.
- 순수 함수 활용: 상태 변경이 없는 순수 계산 로직은 시스템 프레임워크나 특정 라이브러리에 의존하지 않는 순수 함수(Pure Function)로 작성하여 유틸리티 계층으로 격리한다.

```ts
// ❌ Before: 과도한 추상화
// 단순 조건 비교일 뿐인데 별도의 디자인 패턴이나 추상 인터페이스를 남용함
class DistancePolicy implements Evaluator {
    public isLongDistance(distanceKm) {
        return distanceKm >= 10
    }
}

// ✅ After: 단순하고 직관적인 순수 함수 활용
// 상태가 없고 확장 계획이 없다면 단순 유틸리티 함수로 충분함
function isLongDistance(distanceKm) {
    return distanceKm >= 10
}
```

## 잘못된 추상화 대응 전략

- 추상화 계층이 깊어지고 흐름이 파편화될 때 추상화 계층을 과감히 제거하고, 호출부(Page 또는 Main 진입점)에 로직을 인라인(Inline)하여 전체 흐름을 명시적으로 보이게 제어한다.
- 내부 상태를 외부에 노출해야 하는 요구사항이 발생할 때 현재 설계된 추상화의 경계(Boundary)가 잘못되었음을 인지하고, 모듈의 책임 범위를 재검토하거나 상위 계층으로 상태를 끌어올린다.
- "내부 구현이 이러해서..."라는 제약 조건이 생길 때 추상화를 즉시 해제(풀어놓기)하고, 결합도를 낮추는 인터페이스로 재설계한다.