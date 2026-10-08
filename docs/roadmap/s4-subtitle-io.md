# S4 — Subtitle I/O

상위: [전체 로드맵](./README.md)

## 목적

가져오기·내보내기 경로를 React `/edit`에 올린다. 한글·특수문자 인코딩 parity가 핵심이다.

## 범위 (이번 슬라이스 · 브랜치 `feat/edit-subtitle-io`)

- SMI / SRT / VTT / JSON / Excel(zip) **parse · serialize** (export 포맷 parity)
- 가져오기·내보내기 UI/핸들러 (`features/subtitle-io`) — Verify용 최소 진입점
- encode/valid 등 기존 `/`와 동등한 정규화
- 파서/직렬화 **Vitest** (한글·특수문자)

## 이번 슬라이스에 안 넣는 것

- 풀 import/export 모달 · 전체 i18n 셸 → S6 (UI 셸만 · 포맷 로직은 여기 S4)
- video (→ S5)
- 서버 API (기존 `/`에도 클라이언트 I/O가 본선)
- shortkey 엔진 (S1)

Excel / VTT / JSON을 Remaining·다른 슬라이스로 빼지 않는다. **지금 I/O 브랜치 범위.**

## `/`·`public/js` 기준

| 영역 | 경로 |
|------|------|
| 변환 | `public/js/modules/subtitle/convert/*` |
| import/export | `importHandlers.js`, `export/*` (smi/srt/vtt/json/excel) |
| encode/valid | `encode.js`, `valid.js`, `header.js` |
| 인코딩 | `export/download/*` (iconv 등) |

## React 착수지

| 구분 | 경로 / 이름 |
|------|-------------|
| 기존 | `entities/subtitle-sheet`, `routes/edit.tsx` |
| 신설 | `entities/subtitle`, `features/subtitle-io` |

## Decision 게이트

착수 시 **채택 + 대안 + 이유**로 대화에서 닫는다. ([로드맵 README](./README.md)). changelog 옮기기는 사용자 지시 시에만.

| 게이트 | 채택 | 대안 | 이유 / 기각 | 상태 |
|--------|------|------|-------------|------|
| 파서 위치 | `entities/subtitle` 순수 · UI는 `features/*-io` | 전부 feature / shared에 파서 | FSD | 잠김 |
| 인코딩 경로 | 클라이언트 only | 서버 API 신설 | 클라이언트 I/O parity | 잠김 |
| iconv 다중 인코딩 | `iconv-lite` npm (EUC-KR 등 parity) | UTF-8만 (Web API) | `/` 다중 인코딩 parity | 잠김 |
| 포맷 범위 | SMI/SRT/VTT/JSON/Excel — **이 브랜치(S4)** | Remaining·S6로 분리 | I/O 도메인 = 현재 브랜치 | **잠김** |
| import/export UI | Verify용 최소 진입점 · 풀 셸은 S6 | 풀 UI를 이번 작업에 포함 | 수동 Verify. 풀 셸은 S6 | 잠김 |
| import 후 시트 | 활성 탭 timelines 교체 | 항상 새 탭 | `/` parity | 잠김 |
| import 인코딩 UX | UI 선택 + FileReader (BOM 브라우저 우선) | 휴리스틱 자동 감지 | parity | 잠김 |

## 완료 조건 (DoD)

| 종류 | 내용 |
|------|------|
| Parity | quality-verification **Subtitle** (SMI/SRT/VTT/JSON/Excel) |
| Vitest | parse/serialize 픽스처 |
| 수동 | `/edit` round-trip |
| 기록 | 사용자 지시 시 `changelog/2.9/2.9.0-dev.N.md` |

## 의존

- 전제: **S2** (행/시트 mutate). S3 권장
- 후속: S5 · S6(UI 셸)

## 기록

changelog는 **사용자가 지시할 때만** `changelog/2.9/2.9.0-dev.N.md`에 Decision·범위·Verify를 남긴다. **지금 이 문서만으로는 구현하지 않는다.**
