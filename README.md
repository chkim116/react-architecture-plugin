# React Architecture Plugin

React, React Native, Next.js, React Router 프로젝트 개발 시 적용할 코드 컨벤션을 Claude Code 스킬로 제공하는 플러그인입니다.

## 설치

### 1. 마켓플레이스 등록

```bash
/plugin marketplace add chkim116/react-architecture-plugin
```

### 2. 플러그인 설치

```bash
/plugin install react-architecture-plugin@react-architecture-plugin
```

## 사용

### React 프로젝트

```
/react-architecture-plugin:react-conventions
```

컴포넌트, 훅, API, 상태관리, 폴더구조 등 React 공통 컨벤션 로드맵을 제공합니다.

| 작업 | 참조 문서 |
|------|---------|
| 폴더/파일 위치 결정 | folder-conventions, folder-structure |
| 컴포넌트 생성 | component-architecture |
| Custom Hook 작성 | custom-hooks |
| API 연동 | api-layer, queries |
| 데이터 모델링 | data-modeling |
| 에러 처리 | error-handling |
| 타입 및 JSDoc | jsdoc |

### React Router SPA

```
/react-architecture-plugin:react-router-conventions
```

React Router 기반 라우팅, 네비게이션, URL 파라미터 컨벤션을 제공합니다.

| 작업 | 참조 문서 |
|------|---------|
| Route 정의 | routes |
| 페이지 이동 | navigation |
| URL 파라미터 처리 | use-feature-params |

### Next.js 프로젝트

```
/react-architecture-plugin:nextjs-conventions
```

RSC/RCC 분리, 데이터 페칭 등 Next.js 특화 컨벤션을 제공합니다.

| 작업 | 참조 문서 |
|------|---------|
| RSC/RCC 선택 | rsc-and-rcc-data-fetching |
| 패키지 확인 | packages |
| 공용 모듈 | modules |

### React Native 프로젝트

```
/react-architecture-plugin:react-native-conventions
```

Expo Router 네비게이션, StyleSheet 스타일링, 코어 컴포넌트, 플랫폼 분기 등 React Native 특화 컨벤션을 제공합니다. 컴포넌트·훅·쿼리·폴더 구조 등 React 공통 규칙은 react-conventions를 함께 참조합니다.

| 작업 | 참조 문서 |
|------|---------|
| 코어 컴포넌트, 웹 태그 대체 | core-components |
| 스타일링 | styling |
| 네비게이션 | navigation |
| 플랫폼 분기, 안전영역 | platform-specific |
| 목록 렌더링 | lists |
| 스토리지 | storage |
| 패키지 확인 | packages |

## 공통 규칙

모든 스킬에서 참조하는 기본 규칙입니다:

- **코드 스타일**: if문 중괄호 필수, 변수명 축약 금지 등
- **추상화 원칙**: 남용 방지, 구조적 리팩토링 우선
- **유틸리티**: 직접 구현 대신 es-toolkit 함수 우선 사용

스킬 실행 시 이 규칙들이 항상 먼저 제시됩니다.

## 구조

```
react-architecture-plugin/
├── .claude-plugin/
│   ├── plugin.json              # 플러그인 설정
│   └── marketplace.json         # 마켓플레이스 카탈로그
├── skills/
│   ├── doc-update/               # 문서 관리 (SKILL.md + reference/)
│   ├── react-conventions/
│   ├── react-native-conventions/
│   ├── react-router-conventions/
│   └── nextjs-conventions/
├── scripts/
│   └── check-links.mjs           # 링크 검증 스크립트
├── common-code-conventions/reference/
├── react-code-conventions/reference/
├── react-native-conventions/reference/
├── react-router-conventions/reference/
└── next-js-code-conventions/reference/
```

## 문서 관리

문서끼리의 링크 표기 규칙은 [skills/doc-update/reference/LINK-CONVENTIONS.md](skills/doc-update/reference/LINK-CONVENTIONS.md)를 따릅니다. SKILL.md는 플러그인 루트 기준 백틱 경로, reference 문서끼리는 마크다운 링크를 사용합니다.

문서를 추가·이름변경·분할·삭제할 때는 [skills/doc-update/reference/AUTHORING.md](skills/doc-update/reference/AUTHORING.md)의 변경 프로토콜(원자적 변경 + 4표면 동기화)을 따르고, 새 문서는 [skills/doc-update/reference/reference-template.md](skills/doc-update/reference/reference-template.md) 골격을 사용합니다.

새 문서를 추가하거나 이동·삭제한 뒤에는 링크 검증을 실행해 깨진 링크가 없는지 확인합니다:

```bash
npm run lint:links
```

커밋 시 자동으로 검증하려면 클론당 1회 git hook을 활성화합니다(깨진 링크가 있으면 커밋이 차단됩니다):

```bash
git config core.hooksPath .githooks
```

## 로컬 테스트

GitHub 클론 후 로컬에서 테스트하려면:

```bash
cd react-architecture-plugin
/plugin marketplace add ./
/plugin install react-architecture-plugin@react-architecture-plugin
```

## 스킬 특징

- **로드맵 기반**: 작업 유형별 참조 문서를 명확히 제시
- **모듈식 설계**: React, React Router, Next.js 선택적 설치 가능
- **완전 오프라인**: 설치 후 인터넷 없이도 모든 컨벤션 참조 가능
- **단일 플러그인**: 의존성 관리 간단

## 라이선스

MIT
