# S2 — Sheet: 행 선택 + 행 CRUD

상위: [전체 로드맵](./README.md)

## 목적

dev.2에서 남은 sheet gap(다중 선택·행 mutate)을 닫는다.  
**키보드 바인딩은 S1 shortkey**에 두고, 이 슬라이스는 **선택·insert/delete API**와 shortkey 핸들러 연결만 추가한다.

## 범위

- Shift+Arrow **multi-select** (`selectedRows` 런타임 · 행 하이라이트)
- Tab 마지막 행 **insert**, 행 **추가/삭제** entity API + 스토어 액션
- shortkey에 레거시 `defaultKeys`/`customKeys`의 selection·insert/remove 핸들러 연결 (시트에 전역 keydown 추가 금지)
- 선택·insert/delete **순수 함수 Vitest**

## Out of scope

- shortkey 엔진 본체 · 이동/에딧 키 이관 (→ **S1** 완료 전제)
- 검색, undo/redo (→ S3)
- subtitle I/O, video, i18n
- `use-sheet-cell-edit` 대규모 분해, 동명 파일 rename
- persist `beforeunload` flush (별도 chore)

## 레거시 기준

| 영역 | 경로 |
|------|------|
| 다중 선택 | `public/js/modules/sheet/multiple.js` |
| 행 mutate | `public/js/modules/sheet/mutate/*` |
| 키 진입 | `shortkey/defaultKeys.js` (shift+up/down, space 등), `customKeys.js` (sheet-insert/remove) |
| 이동 API | `sheet/move.js` / React `sheet-move.ts` (S1에서 이미 shortkey 연결) |

## React 착수지

| 구분 | 경로 / 이름 |
|------|-------------|
| 기존 | `src/entities/subtitle-sheet`, `src/widgets/sheet` |
| 기존 | `features/shortkey` (S1) — 핸들러만 추가 |
| 신설 | 폴더 사전 생성 금지. entity `lib/`에 selection/mutate 순수 함수 |

## Decision 게이트

착수 시 **채택 + 대안 + 이유**로 대화에서 닫는다. ([로드맵 README](./README.md)). changelog 옮기기는 사용자 지시 시에만.

| 게이트 | 채택 | 대안 | 이유 / 기각 | 상태 |
|--------|------|------|-------------|------|
| `selectedRows` 보관 | 런타임만 시트 스토어 필드 | 별도 selection 스토어 / 영속 포함 | 영속 제외는 잠긴 결정. 스토어 신설은 YAGNI | 기본채택 |
| insert/delete API | `entities/subtitle-sheet` 순수 함수 + 스토어 액션 | widget 안에 mutate | FSD · 도메인 위치 | 기본채택 |
| 키 연결 | shortkey 핸들러만 추가 | 시트 `window` keydown 재도입 | S1 잠김(키보드 진입=shortkey) | 잠김 |

## 완료 조건 (DoD)

| 종류 | 내용 |
|------|------|
| Parity | Shift+Arrow 범위 선택, Tab 끝행 insert, 행 삭제/추가가 `/`와 동등 |
| Vitest | selection range · insert/delete 순수 함수 |
| 수동 | 다중 선택 하이라이트, Tab insert 후 포커스, `selectedRows` 비영속 |
| 기록 | 사용자 지시 시 `changelog/2.9/2.9.0-dev.N.md`에 Decision · Verify |

## 의존

- 전제: **S1** (shortkey + 이동/에딧 키 이관)
- 후속: S3 이상

## 기록

changelog는 **사용자가 지시할 때만** `changelog/2.9/2.9.0-dev.N.md`에 Decision·범위·Verify를 남긴다. **지금 이 문서만으로는 구현하지 않는다.**
