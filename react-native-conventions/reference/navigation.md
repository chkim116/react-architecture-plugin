# Navigation

화면 이동·라우팅 방식을 정한다. 기본값은 **Expo Router**(파일 기반 라우팅)다.

## 원칙

- `app/` 디렉토리의 **파일이 곧 경로**다. `app/profile.tsx` → `/profile`, `app/post/[id].tsx` → `/post/:id`.
- 레이아웃(탭·스택 묶음)은 그 폴더의 `_layout.tsx`에 둔다. 공통 헤더·탭바는 레이아웃에서 구성한다.
- 화면 이동은 `useRouter()`의 `push`/`replace`/`back`, 또는 선언형 `<Link href>`를 쓴다.
- 경로 파라미터는 `useLocalSearchParams`를 **화면에서 직접 호출하지 않는다.** [use-feature-params.md](../../react-code-conventions/reference/use-feature-params.md)의 파라미터 훅(`use{Feature}Params`)으로 래핑하고, 기반 훅만 `useLocalSearchParams`로 바꾼다. 타입 변환·기본값은 Refiner에서 끝낸다 — 제네릭은 타입만 우길 뿐 실제 검증이 아니다.
- 경로 문자열(`/post/123`)을 화면 곳곳에 흩뿌리지 않는다 — 경로를 만드는 함수/상수로 모은다 ([constants.md](../../react-code-conventions/reference/constants.md)).

## 구현 패턴 / 사용 예시

```tsx
// app/post/[id].tsx — 경로: /post/:id
import { useRouter, Link } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { usePostParams } from '@/features/Post/Index/hooks/usePostParams';
import { ROUTES } from '@/routes';

function PostScreen() {
  const { id } = usePostParams(); // useLocalSearchParams 직접 호출 대신 파라미터 훅 (id는 이미 number)
  const router = useRouter();

  const handleBackPress = () => {
    router.back();
  };

  return (
    <View>
      <Text>{id}</Text>
      {/* 선언형 이동 */}
      <Link href={ROUTES.settings()}>설정</Link>
      {/* 명령형 이동 */}
      <Pressable onPress={handleBackPress}>
        <Text>뒤로</Text>
      </Pressable>
    </View>
  );
}
```

경로 파라미터는 use-feature-params 패턴으로 래핑한다 — 기반 훅만 `useLocalSearchParams`로 바뀐다.

```tsx
// features/Post/Index/hooks/usePostParams.ts
import { useLocalSearchParams } from 'expo-router';

interface PostParams {
  /** 게시글 ID — 동적 경로 [id] */
  id: number;
}

function refinePostQueryParams(query: Record<string, string>): PostParams {
  return { id: Number(query.id) || 0 }; // 타입 변환·기본값은 Refiner에서 완료
}

export function usePostParams() {
  return refinePostQueryParams(useLocalSearchParams<{ id: string }>());
}
```

경로 문자열은 한 곳(`routes.ts`)에서 만들고, 화면은 함수만 부른다.

```tsx
// routes.ts
export const ROUTES = {
  post: (id: string) => `/post/${id}`,
  settings: () => `/settings`,
} as const;

router.push(ROUTES.post(post.id)); // 화면들은 문자열을 모르고 함수만 부른다
```

## 네이밍 규칙

| 요소 | 패턴 | 예시 |
| ---- | ---- | ---- |
| 동적 경로 파일 | `[param].tsx` | `app/post/[id].tsx` |
| 레이아웃 파일 | `_layout.tsx` | `app/(tabs)/_layout.tsx` |
| 그룹(경로 미반영) 폴더 | `(group)` | `app/(tabs)/` |

## 주의사항

- `push`(스택 쌓기)와 `replace`(현재 화면 교체)를 구분해 쓴다. 로그인 후 홈 진입처럼 뒤로 가면 안 되는 흐름은 `replace`.
- 페이지(Screen) 컴포넌트는 진입점일 뿐 — 데이터·UI 책임은 Container/Component로 내린다 ([component-architecture.md](../../react-code-conventions/reference/component-architecture.md)).
- 명령형 네비게이션(`@react-navigation/*`)이 필요하면 사용자가 명시할 때만 바꾼다.

## 참조

- [use-feature-params.md](../../react-code-conventions/reference/use-feature-params.md)
- [component-architecture.md](../../react-code-conventions/reference/component-architecture.md)
- [core-components.md](./core-components.md)
