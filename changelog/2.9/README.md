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
| dev.7 | [2.9.0-dev.7.md](./2.9.0-dev.7.md) | Subtitle I/O — SMI/SRT/VTT/JSON/Excel parse·serialize · 가져오기·내보내기 · 인코딩 분리 · 병합·재사용 리팩터링 |
| dev.8 | [2.9.0-dev.8.md](./2.9.0-dev.8.md) | Video Sync · Video Player · Video Shortkey — react-player · 분 슬롯 싱크 · Ctrl+Space/←→/↑↓/Q/`/Alt+Q/Alt+←→ |
| dev.9 | [2.9.0-dev.9.md](./2.9.0-dev.9.md) | Sheet Body 리팩터링 — sheet-body 슬림화 · action composite · toolbar 섹션 분리 · ISP props 번들 |
| dev.10 | [2.9.0-dev.10.md](./2.9.0-dev.10.md) | i18n 코어 — 자체 로케일 스토어 · 사전 new-keys · useT 시임 · 언어 전환 UI · 전 UI 라벨·aria·status locale 키 통일 |
| dev.11 | [2.9.0-dev.11.md](./2.9.0-dev.11.md) | Findings 해소 — push 엔트리 공용 헬퍼 · closeSearchPanel prop 래퍼 · 죽은 selection-keys 사본 제거 |
| dev.12 | [2.9.0-dev.12.md](./2.9.0-dev.12.md) | 피드백 셸 — toast(alert/success) · confirm 게이트 · 에딧창 포커스 복원 |
| dev.13 | [2.9.0-dev.13.md](./2.9.0-dev.13.md) | 공통 다이얼로그 셸 — DialogShell(head·body 슬롯·Esc·포커스 복원) |
| dev.14 | [2.9.0-dev.14.md](./2.9.0-dev.14.md) | L3 shortkey 엔진 meta 지원 · 커스텀 ctrl 키 dual registration |
| dev.15 | [2.9.0-dev.15.md](./2.9.0-dev.15.md) | 커스텀 키 설정 UI(`/edit/settings`) · 엔진 engine/input/label 계층 분리 |
| dev.16 | [2.9.0-dev.16.md](./2.9.0-dev.16.md) | 상수 정본 분리 · SRT 상한 통일 (C1~C7·D3·D7·D8·E 해소) |
| dev.17 | [2.9.0-dev.17.md](./2.9.0-dev.17.md) | I/O 모달 · 다중 탭 zip · 인코딩 localStorage 영속 · SmiMeta shared 정본 |
