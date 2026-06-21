---
name: doc-layer-separation
description: 컨벤션 문서 repo에서 코드 규칙 문서와 문서 관리(메타) 규칙을 섞지 말 것
type: feedback
---

react-architecture-plugin처럼 "컨벤션 문서"를 담는 repo에서는, 실제 서비스 코드가
지킬 규칙(folder-structure.md의 Architectural Invariants, 레이어 의존성 등)과
"이 문서들을 어떻게 관리하나"라는 메타 규칙(SSOT — 구현은 modules/{module}.md 단일
파일에, 주제 문서는 링크만)을 **같은 문서에 섞지 않는다.**

**Why:** 코드 불변식 문서의 독자는 "서비스 개발자"라, 문서 관리 규칙이 끼면
"이게 실제 코드 얘기냐 문서 얘기냐" 혼동이 생긴다 (이번 세션 실제 지적).

**How to apply:** SSOT·문서 구조 같은 메타 규칙은 인덱스 문서(modules.md)나 docs/에
두고, folder-structure·folder-conventions 같은 코드 규칙 문서에는 넣지 않는다.
