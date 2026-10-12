# 2.9.0 — React 완전 변환

작업 목표 4: 바닐라 JS → React (Vite + TanStack Start).

| 항목 | 내용 |
|------|------|
| 상태 | 진행 중 |
| 현재 릴리스 | [VERSION](../../VERSION) (`2.8.4`) |
| 완료 시 | `VERSION` / About / Git tag → **`2.9.0`** |
| 완료 조건 | `/edit` React 편집기 **완전 변환** (`/` 바닐라 의존 없이 동작). 세팅만으로는 완료 아님 |

## 기록 규칙 (2.9만)

- 단계마다 `2.9.0-dev.N.md` **파일로 분리**해 기록한다.
- 완료 후에도 `dev.N` 파일을 **하나로 합치지 않는다**.
- 이 README는 **목록·링크만** 유지한다.

## 진행 목록

| 단계 | 문서 | 요약 |
|------|------|------|
| dev.1 | [2.9.0-dev.1.md](./2.9.0-dev.1.md) | TanStack Start 세팅 (`feat/tss-setup`) — `/` 바닐라, `/edit` 껍데기 |
| dev.2 | [2.9.0-dev.2.md](./2.9.0-dev.2.md) | Sheet UI · subtitleSheets 영속 · 셀 포커스 이동 · 다중 선택(Space·Shift) + 행 CRUD |
| dev.3 | [2.9.0-dev.3.md](./2.9.0-dev.3.md) | Shortkey 엔진(shared) · shortkeyMasks 영속 · 시트 이동·에딧·선택·CRUD 키 이관 |
| dev.4 | [2.9.0-dev.4.md](./2.9.0-dev.4.md) | 시트 clip(BIU·clear·X/C/V) · time ±jump · SMI dur/error parity |
| dev.5 | [2.9.0-dev.5.md](./2.9.0-dev.5.md) | 시트 검색 패널(text/memo·prev/next) · error-search · `/` 단축키 · 히트 셀 하이라이트 |
| dev.6 | [2.9.0-dev.6.md](./2.9.0-dev.6.md) | 시트 undo/redo — 탭별 비영속 스택 · Ctrl+Z/Y·Ctrl+Shift+Z · toolbar 버튼 · push/clear 지점 |
