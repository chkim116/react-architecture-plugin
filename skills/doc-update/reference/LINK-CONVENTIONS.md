# 문서 링크 표기 규칙

이 레포의 문서는 두 층으로 나뉜다.

- `skills/*/SKILL.md` — 작업 유형별로 어떤 reference 문서를 읽을지 안내하는 **로드맵**. 소비자는 Claude이며, 플러그인 루트에서 파일을 읽는다.
- `*/reference/*.md` — 실제 컨벤션이 적힌 **규칙 문서**. 소비자는 사람과 LLM이며, 문맥 안에서 문서 사이를 이동한다.

소비자가 다르므로 링크 표기도 맥락별로 다르게 둔다. **두 가지 형식을 의도적으로 유지**하되, 아래 규칙을 정확히 따른다.

## 1. SKILL.md → reference 문서

- 백틱으로 감싼 **플러그인 루트 기준 상대경로**를 쓴다.
- 항상 확장자 `.md`를 포함한다.
- 반드시 실존하는 파일을 가리킨다.

```md
| API 함수/타입 정의 | `react-code-conventions/reference/api-layer.md` |
```

> 이유: SKILL.md는 Claude가 읽고 곧바로 해당 파일을 Read 한다. 기준점이 플러그인 루트이므로 루트경로가 맞다. 클릭 가능한 마크다운 링크일 필요가 없다.

## 2. reference ↔ reference 문서

클릭 가능한 **마크다운 링크**를 쓴다.

| 상황 | 형식 | 예시 |
|------|------|------|
| 같은 폴더 | `[표시텍스트](./파일.md)` | `[queries.md](./queries.md)` |
| 다른 컨벤션 폴더 | `[표시텍스트](../../<folder>/reference/파일.md)` | `[abstraction.md](../../common-code-conventions/reference/abstraction.md)` |
| 특정 섹션 | `[표시텍스트](./파일.md#heading)` | `[use-query-parser.md](./modules/use-query-parser.md#react-router에서-사용하는-경우)` |

> 크로스 폴더 주의: reference 문서는 `<folder>/reference/` 안에 있으므로, 다른 컨벤션 폴더로 가려면 **두 단계**(`../../`) 올라가야 한다. (`../`는 reference 폴더까지만 벗어난다.)

> 하위 폴더 중첩(예: `reference/modules/`): 상위가 인덱스 문서로 하위를 `./modules/파일.md`로 링크하고, 하위에서 상위 reference 문서로 돌아갈 땐 `../파일.md`를 쓴다. (`modules.md` ↔ `modules/use-loading.md` 구조)

## 3. README.md → 문서

README의 작업별 카탈로그 표는 사람용이므로 **확장자·경로 없는 문서 이름**만 적는다. 단, 이름은 실제 파일 stem과 정확히 일치해야 한다.

```md
| 데이터 모델링 | data-modeling |
```

## 검증

검사기는 `node scripts/check-links.mjs`(= `npm run lint:links`)이며, 다음을 모두 본다.

- reference 문서의 마크다운 링크(파일 디렉토리 기준) + SKILL.md의 백틱 루트경로(플러그인 루트 기준)
- 링크가 가리키는 **파일이 실제로 존재**하는가
- 링크에 `#앵커`가 있으면, 대상 문서에 해당 **heading(GitHub 슬러그)이 존재**하는가
- **고아 문서**: 모든 `*/reference/*.md`가 SKILL·다른 문서·README 중 한 곳 이상에서 참조되는가 (아무 데서도 안 불리면 실패)
- **README 카탈로그 이름**: README 표의 문서 이름(kebab-case)이 실제 파일 stem과 일치하는가 (§3 규칙 — 링크가 아니라 검사기가 직접 대조)

링크가 절대 깨지지 않도록 **3겹으로 강제**한다(어느 하나라도 깨지면 통과 불가):

1. **작성 시점** — Claude Code PostToolUse hook(`.claude/settings.json`)이 `.md` 편집마다 자동 실행.
2. **커밋 시점** — git `pre-commit` hook(`.githooks/`)이 깨진 링크가 있으면 커밋을 차단. `npm install` 시 `prepare` 스크립트가 `core.hooksPath`를 자동 설정한다(클론 직후 1회 `npm install` 또는 `git config core.hooksPath .githooks`).
3. **푸시/PR 시점** — GitHub Actions(`.github/workflows/check-links.yml`)가 우회 불가능하게 검사. `--no-verify`로 로컬을 건너뛰어도 여기서 막힌다.

> 새 문서를 추가·이동·삭제하거나 heading을 바꿀 때는 위 검사를 통과시킨 뒤 커밋한다.
