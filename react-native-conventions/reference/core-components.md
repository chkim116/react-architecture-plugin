# 코어 컴포넌트

화면을 그릴 때 쓰는 RN 기본 컴포넌트와, 웹 HTML 태그를 무엇으로 대체하는지 정한다.

## 원칙

- 웹 HTML 태그(`div`, `span`, `p`, `button`, `img`, `a`, `ul`/`li`)를 쓰지 않는다 — RN 코어 컴포넌트로 대체한다.
- **모든 글자는 반드시 `<Text>` 안에 둔다.** `<View>`에 문자열을 직접 넣으면 런타임 에러가 난다.
- 누를 수 있는 영역은 `Pressable`을 기본으로 쓴다. `TouchableOpacity`·`TouchableHighlight`는 레거시라 새로 만들 때 쓰지 않는다.
- 입력은 `TextInput`을 쓰고, 값은 `onChangeText`로 받는다 — 웹처럼 이벤트 객체(`event.target.value`)를 받지 않는다.
- 이미지는 `expo-image`의 `Image`를 쓴다(캐싱·플레이스홀더 내장).
- 짧고 개수가 고정된 스크롤은 `ScrollView`, 데이터로 만드는 목록은 `FlatList`/`FlashList`를 쓴다 ([lists.md](./lists.md)).

## 웹 태그 → RN 컴포넌트 대체

| 웹 | RN | 비고 |
| ---- | ---- | ---- |
| `div`, `section` | `View` | 레이아웃 컨테이너 |
| `span`, `p`, `h1`~`h6` | `Text` | 글자는 반드시 `Text` 안에 |
| `button` | `Pressable` | `onPress`로 받는다 |
| `input` | `TextInput` | `onChangeText`로 값만 받는다 |
| `img` | `Image` (`expo-image`) | `source={{ uri }}` 또는 `require(...)` |
| `a` | `Link` (expo-router) / `Pressable` | 화면 이동은 [navigation.md](./navigation.md) |
| `ul`/`li` 목록 | `FlatList`/`FlashList` | [lists.md](./lists.md) |

## 구현 패턴 / 사용 예시

```tsx
import { View, Text, Pressable, TextInput } from 'react-native';
import { Image } from 'expo-image';

interface ProfileCardProps {
  name: string;
  avatarUrl: string;
  onEditPress: () => void;
  onNameChange: (name: string) => void;
}

function ProfileCard({ name, avatarUrl, onEditPress, onNameChange }: ProfileCardProps) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      {/* 글자는 반드시 Text 안에 */}
      <Text style={styles.name}>{name}</Text>
      <TextInput value={name} onChangeText={onNameChange} style={styles.input} />
      <Pressable onPress={onEditPress}>
        <Text>수정</Text>
      </Pressable>
    </View>
  );
}
```

## 주의사항

- 핸들러 네이밍 규칙(컴포넌트 내부 `handle{Action}{Event}`, props는 `on{Action}{Event}`)은 웹과 같다 — [handler-patterns.md](../../react-code-conventions/reference/handler-patterns.md)를 따른다. RN에서는 이벤트 이름만 `onPress`·`onChangeText`로 바뀐다.
- `TextInput`의 `onChangeText`는 이미 가공된 문자열을 준다. 상위로 올릴 때는 웹과 동일하게 **이벤트 객체가 아니라 필요한 값만** 가공해 전달한다.
- `style` prop에는 인라인 객체 대신 `StyleSheet` 참조를 넘긴다 ([styling.md](./styling.md)).

## 참조

- [styling.md](./styling.md)
- [lists.md](./lists.md)
- [navigation.md](./navigation.md)
- [handler-patterns.md](../../react-code-conventions/reference/handler-patterns.md)
- [component-architecture.md](../../react-code-conventions/reference/component-architecture.md)
