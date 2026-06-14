# Routes

## Route Entry (App.tsx)

- React Router 라우트 정의 진입점
- 비즈니스 로직 금지 단순히 라우트 정의만 한다.

```tsx
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RunListPage />} />
        <Route path="/runs/:id" element={<RunDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```