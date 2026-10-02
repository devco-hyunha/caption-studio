# S4 — Subtitle I/O (SMI/SRT)

상위: [전체 로드맵](./README.md)

## 목적

가져오기·내보내기 경로를 React `/edit`에 올린다. 한글·특수문자 인코딩 parity가 핵심이다.

## 범위

- SMI / SRT **parse · serialize** 순수 로직
- 가져오기·내보내기 UI/핸들러 (`features` 슬라이스)
- encode/valid 등 레거시와 동등한 정규화
- 파서/직렬화 **Vitest** (한글·특수문자)

## Out of scope

- Excel/zip — Decision에서 제외 가능
- video, 전체 i18n 셸 (막히는 toast만 최소 흡수 시 Decision 명시, 본격 셸은 S6)
- 서버 API
- shortkey 엔진 (이미 S1)

## 레거시 기준

| 영역 | 경로 |
|------|------|
| 변환 | `public/js/modules/subtitle/convert/*` |
| import/export | `importHandlers.js`, `export/*` |
| encode/valid | `encode.js`, `valid.js`, `header.js` |
| 인코딩 | `export/download/*` (iconv 등) |

## React 착수지

| 구분 | 경로 / 이름 |
|------|-------------|
| 기존 | `entities/subtitle-sheet`, `routes/edit.tsx` |
| 신설 예정 이름 | `entities/subtitle`, `features/subtitle-io` — **착수 시에만** |

## Decision 게이트

착수 시 **채택 + 대안 + 이유**로 대화에서 닫는다. ([로드맵 README](./README.md)). changelog 옮기기는 사용자 지시 시에만.

| 게이트 | 채택 | 대안 | 이유 / 기각 | 상태 |
|--------|------|------|-------------|------|
| 파서 위치 | `entities/subtitle` 순수 · UI는 `features/*-io` | 전부 feature / shared에 파서 | FSD | 기본채택 |
| 인코딩 경로 | 클라이언트 only | 서버 API 신설 | 레거시 parity · YAGNI | 기본채택 |
| iconv 다중 인코딩 | (후보) 포함 또는 UTF-8만 + Remaining | — | 착수 전 범위 확정 | **미확정** |
| Excel/zip | 이번 슬라이스 제외 | S4에 포함 | YAGNI | 기본채택 |

## 완료 조건 (DoD)

| 종류 | 내용 |
|------|------|
| Parity | quality-verification **Subtitle** (Decision 인코딩 범위) |
| Vitest | parse/serialize 픽스처 |
| 수동 | `/edit` round-trip |
| 기록 | 사용자 지시 시 `changelog/2.9/2.9.0-dev.N.md` |

## 의존

- 전제: **S2** (행/시트 mutate). S3 권장
- 후속: S5~S6

## 기록

changelog는 **사용자가 지시할 때만** `changelog/2.9/2.9.0-dev.N.md`에 Decision·범위·Verify를 남긴다. **지금 이 문서만으로는 구현하지 않는다.**
