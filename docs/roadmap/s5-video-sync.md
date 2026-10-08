# S5 — Video ↔ Sheet sync

상위: [전체 로드맵](./README.md)

## 목적

플레이어와 시트 타임코드를 연결한다.  
재생·seek 관련 **키는 기존 shortkey(S1)에 핸들러를 추가**한다 (엔진 재구현 없음).

## 범위

- react-player 기반 플레이어 마운트 (`/edit`) + 커스텀 컨트롤 UI
- 소스: file · URL · YouTube · Vimeo
- 시간 ↔ 행 매핑: 분 슬롯 인덱스 + `timeSearchAll`(다중 라인) · 전체 재빌드/행 단위 갱신
- seek / 재생 / 일시정지 시 시트 싱크
- shortkey에 video 관련 키 연결 (볼륨·재생 등)
- 루프 방지 설계

## Out of scope

- shortkey 엔진 본체 (→ S1)
- 전체 i18n/settings 셸 (→ S6)
- `/` Video.js 하이브리드 교체 (→ S7 cutover 전까지 `/` 유지)

## `/`·`public/js` 기준

| 영역 | 경로 |
|------|------|
| 플레이어 | `public/js/modules/video/*` |
| 시트 seek | `sheet/seek.js` |
| 키 | `shortkey/defaultKeys.js` (volume 등), `customKeys.js` |

## React 착수지

| 구분 | 경로 / 이름 |
|------|-------------|
| 기존 | `widgets/sheet`, `entities/subtitle-sheet`, `features/shortkey` |
| 신설 | `features/video-sync` (슬롯·activeIndices 스토어) |
| 신설 예정 | `widgets/video-player` — **착수 시에만** |

## Decision 게이트

착수 시 **채택 + 대안 + 이유**로 대화에서 닫는다. ([로드맵 README](./README.md)). changelog 옮기기는 사용자 지시 시에만.

| 게이트 | 채택 | 대안 | 이유 / 기각 | 상태 |
|--------|------|------|-------------|------|
| 플레이어 코어 | pnpm `react-player` | Video.js / native만 | 가벼움 · React 친화 · YT/Vimeo 기본. 커스텀 UI 전제 | **잠김** |
| 컨트롤 UI | widget 밖 커스텀 | Video.js bar DOM 삽입 | bar 해킹 폐기 | **잠김** |
| 소스 범위 | file · URL · YouTube · Vimeo | 로컬·URL만 | `/` parity | **잠김** |
| 활성 자막 | 다중 `indices[]` | 첫 행만 | 겹침 개선 | **잠김** |
| 시간 인덱스 | 분 슬롯 · 전체+행단위 | 매 틱 전체 스캔 / TextTrack | 후보 축소 · 그래프 재사용 | **잠김** |
| 동기 방향 | 단방향 이벤트 + 명시적 seek | 양방향 자동 동기 | 루프 방지 | 잠김 |
| 키 | shortkey 핸들러 추가 | video widget 전용 keydown | 키보드 진입=shortkey | 잠김 |

## 완료 조건 (DoD)

| 종류 | 내용 |
|------|------|
| Parity | quality-verification **Video** (file/URL/YT/Vimeo) |
| Vitest | timeSearch · timeSearchAll · time-slot-index |
| 수동 | 플레이어 + Ctrl+Q seek · Alt+Q 시트 이동 + 단축키 |
| 기록 | 사용자 지시 시 `changelog/2.9/2.9.0-dev.N.md` |

## 의존

- 전제: **S1** shortkey, **S2** 행 모델. 로드맵 순서상 S4 다음
- 후속: S6, S7

## 기록

changelog는 **사용자가 지시할 때만** `changelog/2.9/2.9.0-dev.N.md`에 Decision·범위·Verify를 남긴다. **지금 이 문서만으로는 구현하지 않는다.**
