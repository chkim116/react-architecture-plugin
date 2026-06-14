# React Architecture Plugin

React, Next.js, React Router 프로젝트 개발 시 적용할 코드 컨벤션을 Claude Code 스킬로 제공하는 플러그인입니다.

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
| 공용 모듈 | shared-modules |

## 공통 규칙

모든 스킬에서 참조하는 기본 규칙입니다:

- **코드 스타일**: if문 중괄호 필수, 변수명 축약 금지 등
- **추상화 원칙**: 남용 방지, 구조적 리팩토링 우선

스킬 실행 시 이 규칙들이 항상 먼저 제시됩니다.

## 구조

```
react-architecture-plugin/
├── .claude-plugin/
│   ├── plugin.json              # 플러그인 설정
│   └── marketplace.json         # 마켓플레이스 카탈로그
├── skills/
│   ├── react-conventions/
│   ├── react-router-conventions/
│   └── nextjs-conventions/
├── common-code-conventions/reference/
├── react-code-conventions/reference/
├── react-router-conventions/reference/
└── next-js-code-conventions/reference/
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
