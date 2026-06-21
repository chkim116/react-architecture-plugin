# 스타일링

RN에서 스타일을 정의·적용하는 방법을 정한다. 기본값은 RN 내장 `StyleSheet`다.

## 원칙

- 스타일은 `StyleSheet.create`로 **컴포넌트 바깥**에 `styles` 객체로 모은다. JSX 안에 객체 리터럴(`style={{ ... }}`)을 매번 새로 만들지 않는다 — 렌더마다 새 객체가 생긴다.
- CSS·className은 없다. `style` prop에 `StyleSheet` 참조를 넘긴다.
- 색·간격·폰트 크기 같은 값은 흩뿌리지 말고 **디자인 토큰 상수**로 모아 재사용한다 ([constants.md](../../react-code-conventions/reference/constants.md)).
- 조건부 스타일은 배열로 합성한다: `style={[styles.box, isActive && styles.active]}`.
- 플랫폼별로 값이 다르면 `Platform.select`를 쓴다 ([platform-specific.md](./platform-specific.md)).
- 레이아웃은 flexbox로 잡는다. RN은 기본이 `flexDirection: 'column'`이다 — 웹(`row`)과 다르다.

## 구현 패턴 / 사용 예시

```tsx
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/shared/styles/tokens';

function Badge({ label, isActive }: { label: string; isActive: boolean }) {
  return (
    <View style={[styles.badge, isActive && styles.badgeActive]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.gray100,
  },
  badgeActive: {
    backgroundColor: colors.blue500,
  },
  label: {
    fontSize: 14,
    color: colors.gray900,
  },
});
```

## 주의사항

- 동적으로 계산되는 값(예: 진행률 너비 `width: \`${percent}%\``)만 인라인으로 두고, 고정 스타일은 `styles`로 분리한다.
- 매직 넘버(색 hex·간격)를 컴포넌트마다 직접 쓰지 않는다 — 토큰 상수를 거친다.
- 스타일 객체가 길어지면 컴포넌트를 더 쪼갤 신호다 ([component-architecture.md](../../react-code-conventions/reference/component-architecture.md)).

## 참조

- [constants.md](../../react-code-conventions/reference/constants.md)
- [platform-specific.md](./platform-specific.md)
- [core-components.md](./core-components.md)
