# S7 — Cutover (완전 변환 점검)

상위: [전체 로드맵](./README.md)

## 목적

`/edit`가 `public/js` 없이 편집 가능한지 **체크리스트로 확인**하고, `2.9.0` 반영 조건을 정리한다.  
**VERSION / Git tag는 사용자가 판단·수행**한다.

## 범위

- `/edit` parity 수동 체크리스트
- `/edit`가 `public/js` modules를 런타임 의존하지 않는지 확인
- Remaining 정리 (iconv, YT/Vimeo, 커스텀 키 UI 등)
- changelog 2.9 완료 조건 대조
- (선택) analytics/ads — 기능 parity 밖

## Out of scope

- 새 기능 슬라이스 구현
- UI 개선 에픽
- 강제 VERSION/tag

## `/`·`public/js` 기준

| 영역 | 경로 |
|------|------|
| 조립 | `public/js/modules/index.js` |
| 완료 정의 | [changelog/2.9/README.md](../../changelog/2.9/README.md) |

## React 착수지

| 구분 | 경로 / 이름 |
|------|-------------|
| 점검 | `src/routes/edit.tsx`, widgets/features/entities |
| 문서 | 본 체크리스트 + `2.9.0-dev.N.md` |

## Decision 게이트

착수 시 **채택 + 대안 + 이유**로 대화에서 닫는다. ([로드맵 README](./README.md)). changelog 옮기기는 사용자 지시 시에만.

| 게이트 | 채택 | 대안 | 이유 / 기각 | 상태 |
|--------|------|------|-------------|------|
| cutover 시점 | 체크리스트 통과 후 `2.9.0` 후보 | 부분 이전 상태로 태그 | 완료 조건 문서와 일치 | 기본채택 |
| `/` | 당분간 유지 · 단일 진입은 별도 | cutover와 동시 `/` 제거 | 리스크 분리 | 기본채택 |
| analytics/ads | 마지막·최소 또는 Remaining | S7에 본격 이전 | 기능 parity 밖 | 기본채택 |

## 완료 조건 (DoD)

| 종류 | 내용 |
|------|------|
| 체크리스트 | Shortkey·Sheet·Subtitle·Video·스토리지 승격 |
| 의존 | `/edit`에 modules 런타임 의존 없음 |
| 테스트 | `pnpm test:run`, lint/typecheck |
| 문서 | Remaining + changelog 링크 |
| 릴리스 | **사용자**가 VERSION / tag |

### 수동 체크리스트 (초안)

- [ ] 단축키로 시트 이동·편집 진입 (widget 전역 keydown 없음; **에딧 보이기/숨김** 분기 — S1 Decision)
- [ ] multi-select · insert/delete · 탭 CRUD · 셀 편집
- [ ] 검색 · undo/redo
- [ ] SMI/SRT I/O (Decision 인코딩 범위)
- [ ] 비디오 싱크 (Decision 소스) · 관련 단축키
- [ ] 언어/포맷 · toast/confirm
- [ ] 설정/검색 등 **별도 input**과 단축키 관계 (S1 Decision)
- [ ] 새로고침 후 timelines 유지 · 뷰 상태 비영속
- [ ] `/edit`만으로 위 항목 수행

## 의존

- 전제: **S1–S6** (또는 Remaining에 명시한 defer)
- 후속: 없음 (2.9 종료)

## 기록

changelog는 **사용자가 지시할 때만** `changelog/2.9/2.9.0-dev.N.md`에 결과를 남긴다. **지금 이 문서만으로는 구현·태그를 하지 않는다.**
