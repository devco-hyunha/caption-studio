# S3 — Sheet: 검색 + undo/redo

상위: [전체 로드맵](./README.md)

## 목적

시트 단독으로 “편집기”가 성립하도록 세션 보조 기능을 붙인다.  
undo/redo·검색 점프의 **키는 shortkey**에 핸들러로 추가한다.

## 범위

- 시트 내 **검색** (매치·다음/이전·포커스 점프)
- **undo/redo** (영속과 분리된 세션 스택)
- shortkey에 Ctrl+Z/Y(및 검색 관련 키가 있으면) 연결
- 검색 매치·히스토리 push/pop **Vitest**

## Out of scope

- 행 CRUD/다중 선택 (→ S2)
- subtitle I/O, video, i18n 셸
- 영속 스토어에 undo 스택 저장
- shortkey 엔진 재구현 (→ S1)

## `/`·`public/js` 기준

| 영역 | 경로 |
|------|------|
| 검색 | `public/js/modules/sheet/search.js`, `helpers/closeSearchPanel.js` |
| 히스토리 | `sheet/history.js`, `utils/editHistory.js` |
| 키 | `shortkey/defaultKeys.js` (undo/redo) |

## React 착수지

| 구분 | 경로 / 이름 |
|------|-------------|
| 기존 | `entities/subtitle-sheet`, `widgets/sheet`, `features/shortkey` |
| 신설 예정 이름 | `features/sheet-session` — 검색·undo 모델. **착수 시에만** |

## Decision 게이트

착수 시 **채택 + 대안 + 이유**로 대화에서 닫는다. ([로드맵 README](./README.md)). changelog 옮기기는 사용자 지시 시에만.

| 게이트 | 채택 | 대안 | 이유 / 기각 | 상태 |
|--------|------|------|-------------|------|
| undo/redo 상태 | 영속과 분리된 세션 스토어 | 시트 persist에 스택 포함 | FSD 세션 vs 영속 분리 | 기본채택 |
| 검색 상태 | 세션 UI만 · 점프는 sheet API | 검색 결과를 영속 | 뷰 상태 비영속 | 기본채택 |
| 키 | shortkey에 Ctrl+Z/Y 등 핸들러 추가 | 검색 패널 전용 keydown | 키보드 진입=shortkey | 잠김 |

## 완료 조건 (DoD)

| 종류 | 내용 |
|------|------|
| Parity | 검색 점프, Ctrl+Z/Y로 변경 되돌리기 |
| Vitest | undo push/pop, search match index |
| 수동 | 검색 UI, undo 후 화면·영속 일치 |
| 기록 | 사용자 지시 시 `changelog/2.9/2.9.0-dev.N.md` |

## 의존

- 전제: **S1** shortkey, **S2** 행 mutate(히스토리 대상)
- 후속: S4 이상

## 기록

changelog는 **사용자가 지시할 때만** `changelog/2.9/2.9.0-dev.N.md`에 Decision·범위·Verify를 남긴다. **지금 이 문서만으로는 구현하지 않는다.**
