# 플랫폼 분기 · 안전영역 · 키보드

iOS/Android가 다르게 동작해야 할 때, 그리고 노치·키보드처럼 RN에서만 챙기는 화면 처리를 정한다.

## 원칙

- 값 한두 개만 다르면 `Platform.select`(또는 `Platform.OS`)로 분기한다.
- 구현 전체가 플랫폼마다 다르면 분기문 대신 **파일을 나눈다**: `Foo.ios.tsx` / `Foo.android.tsx` (import는 `./Foo`로 그대로).
- 상단 노치·하단 홈 인디케이터 여백은 직접 하드코딩하지 않는다 — `react-native-safe-area-context`의 `useSafeAreaInsets`/`SafeAreaView`를 쓴다.
- 입력 화면에서 키보드가 입력창을 가리지 않게 `KeyboardAvoidingView`로 감싼다(iOS는 `behavior="padding"`).
- 분기는 **최소화**한다 — 공통으로 만들 수 있으면 한 컴포넌트로 두고, 정말 다른 부분만 가른다.

## 구현 패턴 / 사용 예시

```tsx
import { Platform, View, KeyboardAvoidingView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function ComposeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.fill}
    >
      {/* 안전영역만큼 위에서 띄운다 */}
      <View style={{ paddingTop: insets.top }}>{/* ... */}</View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    // 값 한두 개 차이는 Platform.select
    paddingTop: Platform.select({ ios: 12, android: 8 }),
  },
  fill: { flex: 1 },
});
```

## 네이밍 규칙

| 요소             | 패턴                                    | 예시                 |
| ---------------- | --------------------------------------- | -------------------- |
| 플랫폼 전용 파일 | `{Name}.ios.tsx` / `{Name}.android.tsx` | `DatePicker.ios.tsx` |

## 주의사항

- `.ios`/`.android` 파일로 나눌 때 두 파일의 **props 타입(인터페이스)을 동일하게** 맞춘다 — 호출부는 어느 쪽이 잡히는지 몰라도 되게 한다.
- `Platform.OS` 분기가 한 컴포넌트에 여러 번 나오면, 파일 분리 신호다.

## 참조

- [styling.md](./styling.md)
- [core-components.md](./core-components.md)
