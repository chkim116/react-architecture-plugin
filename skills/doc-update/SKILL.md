---
name: doc-update
description: 이 레포(react-architecture-plugin)의 컨벤션 문서(`*/reference/*.md`, `skills/*/SKILL.md`)를 추가·이름변경·분할·통폐합·삭제하거나 내용을 수정할 때 사용. "문서 추가/정리/리팩토링", "컨벤션 문서 수정", "reference 문서 옮기기" 등에서 트리거. 변경이 여러 표면에 걸쳐 일관성이 깨지는 것을 막는다.
---

# 문서 업데이트 가이드

이 레포의 컨벤션 문서를 바꿀 때 **일관성**을 지키도록 안내하는 스킬이다. (다른 컨벤션 스킬과 함께 `skills/`에 있다.)

규칙의 출처:
- 변경 절차: `skills/doc-update/reference/AUTHORING.md`
- 새 문서 형식: `skills/doc-update/reference/reference-template.md`
- 링크 표기: `skills/doc-update/reference/LINK-CONVENTIONS.md`
- 쉬운 표현(전문용어 풀기·모호하면 변형안 비교): `skills/doc-update/reference/plain-language.md`

## 절차

### 1. 변경 유형 판별
추가 / 이름변경·이동 / 분할·통폐합 / 삭제 / heading 변경 / 단순 내용수정 중 무엇인가.

### 2. `skills/doc-update/reference/AUTHORING.md` 체크리스트 적용
해당 유형의 체크리스트를 따른다. 핵심은 **4표면 동시 동기화**:
① reference 파일 ② `skills/*/SKILL.md` 로드맵 행 ③ `README.md` 카탈로그 ④ 상호참조·인덱스(`modules.md` 등).

### 3. 새 문서는 `skills/doc-update/reference/reference-template.md` 골격 사용
제목+요약 / 원칙 / 구현·예시 / 네이밍 규칙 / 주의사항 / 참조 순서. 구현 코드 중복 금지(SSOT).

### 4. 원자적 변경
옛 이름과 새 이름이 공존하는 중간 상태로 커밋하지 않는다. 모든 표면을 한 번에 옮긴다.

### 5. 검증 (필수, 통과 전 완료 선언 금지)
~~~bash
grep -rn "<옛 토큰>" --include="*.md" .   # 잔존 0
npm run lint:links                        # exit 0 (파일·앵커 검사)
~~~
고아 문서·README 이름 불일치는 `lint:links`가 자동으로 막는다. 추가로 `skills/doc-update/reference/AUTHORING.md`의 "수동 일관성 grep 레시피"로 SKILL 커버리지 등 나머지를 점검한다.

## 주의

- `skills/*/SKILL.md` 참조는 백틱 + 플러그인 루트 기준 경로, reference끼리는 마크다운 링크 — `skills/doc-update/reference/LINK-CONVENTIONS.md` 참조.
- 링크 검사는 `--no-verify`로 우회해도 CI(`.github/workflows/check-links.yml`)에서 막힌다. 우회하지 말 것.
