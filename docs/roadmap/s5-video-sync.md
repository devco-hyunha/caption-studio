# S5 — Video ↔ Sheet sync

상위: [전체 로드맵](./README.md)

## 목적

플레이어와 시트 타임코드를 연결한다.  
재생·seek 관련 **키는 기존 shortkey(S1)에 핸들러를 추가**한다 (엔진 재구현 없음).

## 범위

- Video.js 기반 플레이어 마운트 (`/edit`)
- 시간 ↔ 행 매핑 순수 함수
- seek / 재생 / 일시정지 시 시트 싱크
- shortkey에 video 관련 defaultKeys 연결 (볼륨·재생 등 Decision 범위)
- 루프 방지 설계

## Out of scope

- shortkey 엔진 본체 (→ S1)
- 전체 i18n/settings 셸 (→ S6)
- 플레이어 교체 에픽

## 레거시 기준

| 영역 | 경로 |
|------|------|
| 플레이어 | `public/js/modules/video/*` |
| 시트 seek | `sheet/seek.js` |
| 키 | `shortkey/defaultKeys.js` (volume 등), `customKeys.js` |

## React 착수지

| 구분 | 경로 / 이름 |
|------|-------------|
| 기존 | `widgets/sheet`, `entities/subtitle-sheet`, `features/shortkey` |
| 신설 예정 이름 | `widgets/video-player` — **착수 시에만** |

## Decision 게이트

착수 시 **채택 + 대안 + 이유**로 대화에서 닫는다. ([로드맵 README](./README.md)). changelog 옮기기는 사용자 지시 시에만.

| 게이트 | 채택 | 대안 | 이유 / 기각 | 상태 |
|--------|------|------|-------------|------|
| 플레이어 | Video.js 유지 | 다른 플레이어로 교체 | 레거시 parity. 교체는 별도 에픽 | 기본채택 |
| 동기 방향 | 단방향 이벤트 + 명시적 seek | 양방향 자동 동기 | 루프 방지 | 기본채택 |
| YouTube/Vimeo | (후보) 로컬·URL 먼저 / 포함 | 전부 한 슬라이스 | 착수 전 범위 | **미확정** |
| video.js 도입 | (후보) `public/js/lib` 재사용 vs npm | — | npm이면 사용자 확인 | **미확정** |
| 키 | shortkey 핸들러 추가 | video widget 전용 keydown | 키보드 진입=shortkey | 잠김 |

## 완료 조건 (DoD)

| 종류 | 내용 |
|------|------|
| Parity | quality-verification **Video** (Decision 소스 범위) |
| Vitest | time→row 매핑 |
| 수동 | 플레이어 + 행 클릭 seek + (범위 내) 단축키 |
| 기록 | 사용자 지시 시 `changelog/2.9/2.9.0-dev.N.md` |

## 의존

- 전제: **S1** shortkey, **S2** 행 모델. 로드맵 순서상 S4 다음
- 후속: S6, S7

## 기록

changelog는 **사용자가 지시할 때만** `changelog/2.9/2.9.0-dev.N.md`에 Decision·범위·Verify를 남긴다. **지금 이 문서만으로는 구현하지 않는다.**
