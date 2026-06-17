# TODO

## shared-modules.md 보일러플레이트 추가

### 1. toast/confirm/alert 구현체

`error-handling.md`에 사용 예시(`showToast`, `showConfirm`, `showAlert`)는 추가했지만, `useLoading`/`useQueryParser`/`createStorage`처럼 실제 구현체가 `shared-modules.md`에 없음.

- useLoading과 동일한 JSDoc + 구현 형식으로 toast/confirm/alert 모듈 추가

### 2. runtimeEnv 구현 예시

`env-config.md`에 `getRequiredEnv` 패턴은 적었지만, `shared-modules.md`에 정식 모듈로 등록되지 않음.

- `storage.md` → `shared-modules.md`의 `createStorage`처럼, `env-config.md`도 `shared-modules.md`에 대응하는 구현 예시 추가
</content>
