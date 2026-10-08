# S1 — Shortkey (엔진 + 시트 이동·에딧 키 이관)

상위: [전체 로드맵](./README.md)

## 목적

기존 `/`와 같이 **키보드 진입을 shortkey**로 둔다.  
dev.2에서 시트 widget에 붙은 이동·에딧 `window` keydown을 shortkey로 이관하면, 이후 CRUD·검색·video 키도 같은 흐름으로 붙일 수 있다.

## 범위

- 단축키 **매칭 엔진** 포팅 (`shortcuts` — mask, hold/down, preventDefault)
- `defaultKeys` 중 **시트 이동·편집 진입**에 해당하는 키를 shortkey 핸들러로 연결:
  - Tab / Shift+Tab, ←↑→↓, PageUp/PageDown
  - Enter / Esc / F2 (edit on/off·레이어 등은 Decision 범위 내)
- 시트 쪽은 **동작 API 유지** (`sheet-move` 순수 함수, 셀 edit on/off·커밋 API)
- widget의 **전역 keydown 리스너 제거** (`use-sheet-move` / `use-sheet-cell-edit`의 `window` 키 소유 이관)
- 키 매칭 **Vitest** (엔진)
- **포커스·에딧 모드 vs 키 분기는 아래 Decision — 착수 전 확인 필수** (범위에 “웹 표준 input 무시”를 기본값으로 넣지 않음)

## Out of scope

- Shift+Arrow **multi-select** · Tab 끝행 **insert** · 행 삭제 API (→ **S2**; S1에서는 이동만, append 시그널은 기존처럼 무시 가능)
- undo/redo · 검색 키 (→ S3; Ctrl+Z/Y는 S3에서 shortkey에 핸들러 추가)
- video 볼륨/재생 키 (→ S5 이후)
- 커스텀 키 **설정 UI** 전부 (기본 후속)
- 새 단축키 라이브러리 (기본 도입 안 함)
- `use-sheet-cell-edit` 대규모 구조 분해 (키 이관만)

## `/`·`public/js` 기준

| 영역 | 경로 |
|------|------|
| 엔진 | `public/js/modules/shortkey/shortcuts.js`, `index.js`, `init.js` |
| 기본 키 | `public/js/modules/shortkey/defaultKeys.js` (이동·edit·Esc·Enter·F2 등 — 대부분 `edit.state` / `isTextTarget` / `ui.layer`로 분기) |
| 시트 API | `public/js/modules/sheet/move.js`, `sheet/edit/*`, `sheet/trigger` |
| 설정창 등 실제 input | `shortcuts.js` `checkIsInput` — **시트 셀 에딧과 별개** (단축키 설정 UI 등) |
| 참고 | changelog contenteditable 판별 수정 — **시트 에딧 모델과 동일시하지 말고** 착수 전 대조 |

## React 착수지

| 구분 | 경로 / 이름 |
|------|-------------|
| 기존 | `src/widgets/sheet/lib/sheet-move.ts` (순수 이동 — **유지**) |
| 기존 | `src/widgets/sheet/lib/use-sheet-move.ts`, `use-sheet-cell-edit.ts` — **전역 keydown 제거·API만 노출** |
| 신설 예정 이름 | `features/shortkey` — 엔진 + defaultKeys 바인딩. **폴더는 착수 시에만** |
| 조립 | `/edit`에서 shortkey start + sheet/edit 액션 주입 |

## Decision 게이트

착수 시 아래를 **채택 + 대안 + 이유**로 대화에서 닫는다. (형식: [로드맵 README](./README.md)). changelog 옮기기는 사용자 지시 시에만.

| 게이트 | 채택 | 대안 | 이유 / 기각 | 상태 |
|--------|------|------|-------------|------|
| 엔진 | `public/js` shortkey 포팅 | hotkeys-js / mousetrap 등 라이브러리 | parity·YAGNI. 라이브러리는 사용자 확인 | 기본채택 |
| 키 소유 | shortkey만 전역 키 | 시트 widget `window` keydown 유지(dev.2) | `defaultKeys` 진입 | 잠김 |
| **시트 포커스·에딧 모델** | (후보) 에딧 보이기/숨김(`edit.state`)으로 키 분기 · 시트는 항상 에딧 영역 전제 | DOM 포커스 기반 — contenteditable/input이면 전역 키 무시 | 가설 vs React 관례. **착수 전 확인** | **미확정** |
| 설정 등 진짜 `input` | (후보) `checkIsInput`을 시트 셀과 분리 | 모든 포커스 가능 요소에 동일 무시 규칙 | 설정 UI vs 시트 셀 구분 | **미확정** |
| 커스텀 키 UI | 이번 슬라이스 제외(후속) | S1에 설정 UI까지 포함 | YAGNI | 기본채택 |

사용자 확인: 단축키 라이브러리 채택 시 · 에딧 모델을 React 포커스 관례로 바꿀 시.

## 완료 조건 (DoD)

| 종류 | 내용 |
|------|------|
| Parity | Tab/화살표/Page로 셀 이동, Enter/F2/Esc로 편집 진입·종료가 `/`와 동등 (S2 multi-select·insert 제외). **분기 기준은 Decision에 확정한 에딧 모델** |
| 구조 | `use-sheet-move` / cell-edit에 **전역 keydown 없음**. shortkey만 키 진입 |
| Vitest | 키 매칭. (에딧 on/off·`edit.state` 분기 순수 로직이 있으면 포함) |
| 수동 | 에딧 **숨김**(이동 키) vs **표시**(편집 키) parity. 설정/검색 등 별도 input이 있으면 Decision대로 |
| 기록 | 사용자 지시 시 `changelog/2.9/2.9.0-dev.N.md`에 **포커스·에딧 모델 Decision** · Verify |

## 의존

- 전제: **dev.2** (시트 UI·이동/편집 API·영속)
- 후속: S2가 shortkey에 selection/insert 핸들러를 추가. S3+도 동일 패턴

## 기록

changelog는 **사용자가 지시할 때만** `changelog/2.9/2.9.0-dev.N.md`에 Decision·범위·Verify를 남긴다. **지금 이 문서만으로는 구현하지 않는다.**
