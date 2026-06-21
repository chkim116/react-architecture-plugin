# 문서 변경 프로토콜

문서를 **일관성 있게** 바꾸기 위한 절차다. 링크 검사([LINK-CONVENTIONS.md](./LINK-CONVENTIONS.md))는 *깨진 링크*만 잡는다. 이 문서는 변경이 여러 표면에 걸칠 때 **모두 함께 움직이도록** 보장한다.

> 새 문서의 형식은 [reference-template.md](./reference-template.md)를 따른다.

## 원칙: 원자적 변경

- 한 변경은 **한 커밋 안에서** 모든 표면을 옛 상태 → 새 상태로 함께 옮긴다.
- **옛 이름과 새 이름이 공존하는 중간 상태로 커밋하지 않는다.** (이 레포의 `shared-modules → modules` 통폐합이 이 규칙을 어겨 transient 깨짐을 냈다.)

## 문서의 4표면

reference 문서 하나를 바꾸면 아래가 **동시에** 맞아야 한다.

| # | 표면 | 위치 |
|---|------|------|
| ① | reference 파일 자체 | `*/reference/*.md` |
| ② | SKILL 로드맵 행 | `skills/*/SKILL.md`의 `작업 → 참조 파일` 표 |
| ③ | README 카탈로그 행 | `README.md`의 작업별 표 (확장자 없는 이름) |
| ④ | 상호참조·인덱스 | 다른 문서의 링크, `modules.md` 같은 인덱스 표 |

## 작업별 체크리스트

각 체크리스트 **끝에서 항상**: `grep`으로 옛 토큰 잔존 0 확인 → `npm run lint:links` 통과.

### 문서 추가
1. [reference-template.md](./reference-template.md) 골격으로 파일 생성.
2. 관련 `skills/*/SKILL.md` 표(②)에 행 추가.
3. `README.md`(③) 카탈로그에 이름 추가.
4. 인덱스 문서(④, 예: `modules.md`)가 있으면 표에 등록.

### 이름 변경 / 이동
1. 파일 이동(`git mv` 또는 `mv`).
2. 옛 경로/이름을 가리키는 **모든 참조**를 새 경로로: `grep -rn "옛이름" --include="*.md" .` 로 전수 → ①②③④ 갱신.

### 분할 / 통폐합
1. 새 구조(파일·인덱스) 생성.
2. 옛 대상으로 가던 **모든 참조를 새 경로로 일괄 갱신**.
3. 옛 파일 삭제. → 1~3을 **한 커밋**에.

### 삭제
1. 그 문서를 가리키는 참조를 제거하거나 다른 문서로 리다이렉트.
2. 파일 삭제. (참조가 남아 있으면 삭제 금지.)

### heading 변경
1. 그 heading을 `#앵커`로 가리키는 링크를 `grep -rn "파일.md#" --include="*.md" .` 로 찾아 함께 수정.
2. `lint:links`가 앵커까지 검증한다.

## 수동 일관성 grep 레시피

링크 검사가 못 잡는 일관성 구멍을 점검한다.

> **고아 문서**와 **README 이름 불일치**는 이제 `npm run lint:links`가 자동으로 막는다(위반 시 exit 1). 아래 레시피는 SKILL 커버리지·README 시각 대조 등 자동화가 안 된 부분의 보강용이다.

~~~bash
# 고아 문서: 어떤 SKILL/인덱스에서도 참조되지 않는 reference 문서
for f in $(find . -path ./.git -prune -o -name '*.md' -path '*/reference/*' -print); do
  base=$(basename "$f")
  grep -rqF "$base" --include="*.md" skills */reference 2>/dev/null || echo "ORPHAN? $f"
done

# README 카탈로그 이름 ↔ 실제 파일 stem 불일치 점검 (표의 이름이 실제 파일과 맞는지 육안 대조)
grep -nE '^\| ' README.md

# SKILL 커버리지: 새 reference 문서가 로드맵에 올라왔는지
grep -rn "<새문서이름>.md" skills
~~~

## 검증 (변경 후 필수)

~~~bash
grep -rn "<옛 토큰>" --include="*.md" .   # 잔존 0 이어야 함
npm run lint:links                        # exit 0 이어야 함
~~~
