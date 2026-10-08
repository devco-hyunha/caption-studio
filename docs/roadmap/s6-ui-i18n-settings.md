# S6 — UI 셸 + i18n / settings

상위: [전체 로드맵](./README.md)

## 목적

공통 피드백(toast/confirm/dialog)과 언어·포맷 설정을 `/edit`에 올린다.

## 범위

- toast / alert / confirm / dialog
- i18n `t()` · ko/en/ja
- format · language settings
- 필요 시 최소 RTL

## Out of scope

- shortkey 엔진 (→ S1 완료)
- analytics / ads
- i18next 기본 도입 안 함
- 시각 리디자인 (parity만)

## `/`·`public/js` 기준

| 영역 | 경로 |
|------|------|
| UI | `public/js/modules/ui/*` |
| i18n | `public/js/modules/i18n/*` |
| settings | `public/js/modules/settings/*` |

## React 착수지

| 구분 | 경로 / 이름 |
|------|-------------|
| 기존 | `src/shared/ui` |
| 신설 예정 이름 | app-settings / i18n — **착수 시에만** |

## Decision 게이트

착수 시 **채택 + 대안 + 이유**로 대화에서 닫는다. ([로드맵 README](./README.md)). changelog 옮기기는 사용자 지시 시에만.

| 게이트 | 채택 | 대안 | 이유 / 기각 | 상태 |
|--------|------|------|-------------|------|
| i18n | `t()`·사전 포팅 | i18next 등 | YAGNI · parity | 기본채택 |
| 다이얼로그 | shadcn/Radix | DOM dialog 이식 | 기존 `shared/ui` 패턴 | 기본채택 |
| 설정 영속 | 키 호환 또는 migrate | 키 파괴적 교체 | 파괴 시 사용자 확인 | 기본채택 |

## 완료 조건 (DoD)

| 종류 | 내용 |
|------|------|
| Parity | 언어 전환, confirm, toast |
| Vitest | `t()` fallback |
| 수동 | format/language 반영 |
| 기록 | 사용자 지시 시 `changelog/2.9/2.9.0-dev.N.md` |

## 의존

- 전제: S4~S5에서 공통 UI가 막히면 일부 선행 흡수 가능 (Decision 명시)
- 기본 순서: S5 다음
- 후속: S7

## 기록

changelog는 **사용자가 지시할 때만** `changelog/2.9/2.9.0-dev.N.md`에 Decision·범위·Verify를 남긴다. **지금 이 문서만으로는 구현하지 않는다.**
