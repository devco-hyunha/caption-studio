# Changelog

[Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## Legacy

- **1.9.8** — 운영 [Caption Studio](https://caption.devco.kr). 공식 버전 규칙 없이 관리.

## [2.0.0] — 2026-08-28

Git 저장소에 올리는 버전은 **2.0.0**부터 시작합니다.

- 운영 레거시 코드를 GitHub 리팩터링 **기준선**으로 추가
- SemVer, [VERSION](./VERSION), CHANGELOG 도입
- About UI·`VERSION`·Git tag `v2.0.0`을 동일하게 맞춤
- **1.9.8**은 Git 이전 운영 이력(Legacy)으로만 기록

상세 변경: [changelog/2.0.md](./changelog/2.0.md)

## [2.1.0] — 2026-08-28

`caption.js` i18n locale을 `public/js/modules/i18n/`로 분리.

상세 변경: [changelog/2.1.md](./changelog/2.1.md)

## [2.2.0] — 2026-08-31

`caption.js` 범용 유틸을 `public/js/modules/utils/`로 분리.

상세 변경: [changelog/2.2.md](./changelog/2.2.md)

## [2.2.1] — 2026-08-31

`Fn` 저장소·편집 히스토리·타임코드 유틸을 `modules/utils/`로 분리하고 API 전환.

상세 변경: [changelog/2.2.md](./changelog/2.2.md)

## [2.2.2] — 2026-08-31

`caption.js` eval 제거 — 색상 파싱·UI handler(`data-action` + `runAction`).

상세 변경: [changelog/2.2.md](./changelog/2.2.md)

## [2.3.0] — 2026-09-02

`caption.js` Subtitle 도메인을 `modules/subtitle/`로 분리.

상세 변경: [changelog/2.3.md](./changelog/2.3.md)

## [2.3.1] — 2026-09-03

자막보내기(SMI/SRT/VTT/JSON/Excel)를 서버 PHP 없이 클라이언트 Blob 다운로드로 전환.

상세 변경: [changelog/2.3.md](./changelog/2.3.md)

## [2.3.2] — 2026-09-03

`utilsModule()` 팩토리를 제거하고 storage·editHistory API를 정리.

상세 변경: [changelog/2.3.md](./changelog/2.3.md)

## Releases

| 버전 | 문서 | 요약 |
|------|------|------|
| 2.3.x | [changelog/2.3.md](./changelog/2.3.md) | subtitle 분리 · 클라이언트 다운로드 · utils 팩토리 정리 |
| 2.2.x | [changelog/2.2.md](./changelog/2.2.md) | utils 모듈 분리 |
| 2.1.x | [changelog/2.1.md](./changelog/2.1.md) | i18n locale 모듈 분리 |
| 2.0.x | [changelog/2.0.md](./changelog/2.0.md) | GitHub 리팩터링 기준선 및 레거시 정리 |

- **2.0.x** — PATCH 변경은 [2.0.md](./changelog/2.0.md)에 누적
- **2.1.0+** — 새 MINOR마다 `changelog/2.x.md` 추가
