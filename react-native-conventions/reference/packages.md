# Packages

React Native(Expo) 작업에서 기본값으로 쓰는 패키지를 정리한다.

- **작업을 시작하기 전에 이 목록을 확인하고, 프로젝트에 없는 패키지는 설치한 뒤 시작한다 (필수).** 이 패키지들을 기본값으로 사용한다.
- 단, 사용자가 다른 패키지를 쓰겠다고 명시하면 그 선택을 따른다.
- React 공통 패키지(es-toolkit, react, React Query 계열 등)는 [react packages.md](../../react-code-conventions/reference/packages.md)를 함께 본다. 여기에는 RN 전용만 적는다.

## 사용하는 패키지

- [expo](https://www.npmjs.com/package/expo): RN 앱의 빌드·런타임 기반(SDK). 빌드 기반은 Expo로 잡는다.
- [react-native](https://www.npmjs.com/package/react-native): RN 코어 컴포넌트·API. ([core-components.md](./core-components.md))
- [expo-router](https://www.npmjs.com/package/expo-router): 파일 기반 라우팅(기본 네비게이션). ([navigation.md](./navigation.md))
- [react-native-safe-area-context](https://www.npmjs.com/package/react-native-safe-area-context): 노치·홈 인디케이터 안전영역 여백. ([platform-specific.md](./platform-specific.md))
- [@shopify/flash-list](https://www.npmjs.com/package/@shopify/flash-list): 긴 목록을 위한 고성능 리스트. ([lists.md](./lists.md))
- [react-native-mmkv](https://www.npmjs.com/package/react-native-mmkv): 동기 key-value 저장소(웹 localStorage 대체). ([storage.md](./storage.md))
- [expo-image](https://www.npmjs.com/package/expo-image): 이미지 컴포넌트(캐싱·플레이스홀더 내장). ([core-components.md](./core-components.md))

## 주의사항

- 네비게이션 기본값은 Expo Router다. 명령형 네비게이션(`@react-navigation/*`)이 필요하면 사용자가 명시할 때만 바꾼다.
- 스타일링 기본값은 RN 내장 `StyleSheet`다 — 별도 스타일링 패키지를 추가하지 않는다. ([styling.md](./styling.md))
