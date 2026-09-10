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

## [2.3.3] — 2026-09-03

analytics 모듈 분리, export GA 보완, 개발 환경에서 GA·wcs·AdSense 차단.

상세 변경: [changelog/2.3.md](./changelog/2.3.md)

## [2.4.0] — 2026-09-03

`caption.js` Video 도메인을 `modules/video/`로 분리.

상세 변경: [changelog/2.4.md](./changelog/2.4.md)

## [2.5.0] — 2026-09-05

`caption.js` Sheet 도메인을 `modules/sheet/`로 분리. camelCase API · Flex 레이아웃 · 바닐라 edit UI · 미사용 플러그인 정리.

상세 변경: [changelog/2.5.md](./changelog/2.5.md)

## [2.5.1] — 2026-09-05

`sheet.init`에 timeControl·search·config 초기화를 통합.

상세 변경: [changelog/2.5.md](./changelog/2.5.md)

## [2.6.0] — 2026-09-06

`caption.js` Interface(UI 셸) 도메인을 `modules/ui/`로 분리. camelCase API · `ui.init` · jQuery 제거. README 기준선/현재 구조·scope 정리.

상세 변경: [changelog/2.6.md](./changelog/2.6.md)

## [2.6.1] — 2026-09-06

`ui.initialize` 주입을 `sheet`·평평한 context(getter)·`initializeDomainModules` 안으로 정리.

상세 변경: [changelog/2.6.md](./changelog/2.6.md)

## [2.7.0] — 2026-09-06

`caption.js` Shortkey를 `modules/shortkey/`로 분리. 바닐라 Shortcuts(`event.code`) · jQuery/플러그인 제거 · `registerKeys` · 설정 UI 바닐라화.

상세 변경: [changelog/2.7.md](./changelog/2.7.md)

## [2.8.0] — 2026-09-06

`caption.js` 부트스트랩 정리 · `settings` · `bootstrap` · `configure`/`mount` · 셀 타깃 판별 공통화.

상세 변경: [changelog/2.8.md](./changelog/2.8.md)

## [2.8.1] — 2026-09-06

`lib/jquery` 제거 · 터치 드래그 · `isJQuery`/`toElement` 제거 · `html5-video` → `video-js`.

상세 변경: [changelog/2.8.md](./changelog/2.8.md)

## [2.8.2] — 2026-09-06

시트 PageUp/PageDown(`move.page`) 기대 동작 정리 — 뷰 안·밖 분기 · 가장자리에서 1화면 점프.

상세 변경: [changelog/2.8.md](./changelog/2.8.md)

## [2.8.3] — 2026-09-07

시트 탭 도메인(`sheets` / `active` · `subtitleSheets`) 선반영 · UI `locale`(`ko`/`en`/`ja`) · interim으로 바닐라 탭 UI 숨김 · SMI export는 locale→KRCC 프리셋 호환.

상세 변경: [changelog/2.8.md](./changelog/2.8.md)

## [2.8.4] — 2026-09-08

시트 탭명 편집을 `input`으로 전환하고, `checkIsInput`의 contenteditable 판별을 제거해 시트 편집 중 단축키 차단을 해소.

상세 변경: [changelog/2.8.md](./changelog/2.8.md)

## [2.8.5] — 2026-09-10

시트 탭 `timelines` · undo 히스토리의 이중 복사를 제거하고 `activeSheetIndex` 기준으로 SSOT를 통일.

상세 변경: [changelog/2.8.md](./changelog/2.8.md)

## [2.9.0] — 진행 중

React 완전 변환 (Vite + TanStack Start). 세팅은 `2.9.0-dev.1`, 이후 단계는 `changelog/2.9/`에 `dev.N` 파일로 분리 기록.

상세: [changelog/2.9/](./changelog/2.9/)

## Releases

| 버전 | 문서 | 요약 |
|------|------|------|
| 2.9.x | [changelog/2.9/](./changelog/2.9/) | React 완전 변환 (진행 중 · `dev.N` 파일 분리) |
| 2.8.x | [changelog/2.8.md](./changelog/2.8.md) | caption bootstrap · settings · jQuery/`lib` 정리 · 시트 탭 도메인 interim |
| 2.7.x | [changelog/2.7.md](./changelog/2.7.md) | shortkey 분리 · Shortcuts 바닐라 · 플러그인 삭제 |
| 2.6.x | [changelog/2.6.md](./changelog/2.6.md) | ui 셸 분리 · initialize API 정리 |
| 2.5.x | [changelog/2.5.md](./changelog/2.5.md) | sheet 분리 · init 통합 |
| 2.4.x | [changelog/2.4.md](./changelog/2.4.md) | video 분리 |
| 2.3.x | [changelog/2.3.md](./changelog/2.3.md) | subtitle 분리 · 클라이언트 다운로드 · utils · analytics · ads |
| 2.2.x | [changelog/2.2.md](./changelog/2.2.md) | utils 모듈 분리 |
| 2.1.x | [changelog/2.1.md](./changelog/2.1.md) | i18n locale 모듈 분리 |
| 2.0.x | [changelog/2.0.md](./changelog/2.0.md) | GitHub 리팩터링 기준선 및 레거시 정리 |

- **2.0.x** — PATCH 변경은 [2.0.md](./changelog/2.0.md)에 누적
- **2.1.0+** — 새 MINOR마다 `changelog/2.x.md` 추가
