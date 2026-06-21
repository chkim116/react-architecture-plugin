# 목록 렌더링

데이터로 목록을 그릴 때 무엇을 쓰는지 정한다.

## 원칙

- 데이터 배열을 `.map()`으로 펼쳐 `ScrollView`에 넣지 않는다 — 항목 전부를 한 번에 렌더해 길어질수록 느려진다. 가상화(보이는 만큼만 렌더)되는 리스트를 쓴다.
- 일반 목록은 `FlatList`, 항목이 많거나 스크롤 성능이 중요하면 `@shopify/flash-list`의 `FlashList`를 쓴다.
- 머리말로 묶이는 목록은 `SectionList`를 쓴다.
- `keyExtractor`로 안정적인 key를 지정한다(인덱스 대신 항목 고유 id).
- `renderItem`의 JSX가 길어지면 **별도 컴포넌트로 분리**한다 — 인라인 거대 JSX를 두지 않는다.
- 짧고 개수가 고정된 묶음(스크롤 불필요)만 `View`/`ScrollView`로 둔다.

## 구현 패턴 / 사용 예시

```tsx
import { FlashList } from '@shopify/flash-list';

interface PostListProps {
  posts: Post[];
  onItemPress: (id: string) => void;
}

function PostList({ posts, onItemPress }: PostListProps) {
  return (
    <FlashList
      data={posts}
      keyExtractor={(post) => post.id}
      renderItem={({ item }) => (
        <PostRow post={item} onPress={() => onItemPress(item.id)} />
      )}
    />
  );
}
```

## 주의사항

- `renderItem` 안에서 매번 새 핸들러를 만드는 것 자체는 괜찮지만, 행 컴포넌트(`PostRow`)는 분리해 책임을 나눈다 ([component-architecture.md](../../react-code-conventions/reference/component-architecture.md)).
- 목록 항목으로 보여줄 **UI 모델**은 서버 응답을 그대로 쓰지 말고 변환을 거친다 ([data-modeling.md](../../react-code-conventions/reference/data-modeling.md)).

## 참조

- [core-components.md](./core-components.md)
- [component-architecture.md](../../react-code-conventions/reference/component-architecture.md)
- [data-modeling.md](../../react-code-conventions/reference/data-modeling.md)
