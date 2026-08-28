# Caption Studio

온라인 자막 편집 도구입니다.  
이 저장소는 2017년에 jquery를 기반으로 제작한 [Caption Studio](https://caption.devco.kr)의 레거시 코드를 기준으로, 문제를 하나씩 수정하고 개선하는 과정을 기록합니다.

**운영 사이트:** https://caption.devco.kr

## 주요 기능

브라우저에서 동영상을 **참고·동기화**하며 자막을 작성·수정·내보냅니다.

- 자막 시트에서 시간·내용 편집
- SRT / SMI 가져오기·내보내기
- 로컬 파일, URL, YouTube, Vimeo 영상을 불러와서 자막의 싱크 확인
- 단축키, 검색, 히스토리 등 편집 보조 기능
- 다국어 UI (한국어/영어/일본어)

## 작업 목표

1. 단일 파일 스크립트를 기능별로 분리
2. 읽기 어려운 변수·스크립트 구조 개선
3. jQuery 및 jQuery 플러그인 제거
4. 코드 최신화 및 최적화
5. UI 개선 *(미정)*

## 레거시 구조 (기준선)

운영과 동일한 정적 앱 구성입니다.

```
.
├── index.html              # 앱 셸
├── manual.html             # 사용 설명
├── public/
│   ├── css/                # 스타일
│   └── js/
│       ├── caption.js      # 핵심 로직 (단일 파일)
│       ├── lib/            # jQuery, Video.js 등
│       └── plugin/         # 단축키, 컬러피커 등
├── download/               # 자막 내보내기(서버) 관련
├── favicon/
├── CHANGELOG.md            # 변경 이력 목차
├── VERSION                 # 현재 SemVer (Git tag와 맞춤)
└── changelog/              # MINOR별 상세 변경 (예: 2.0.md)
```

| 구분 | 설명 |
|------|------|
| UI / 셸 | `index.html` |
| 핵심 로직 | `public/js/caption.js` |
| 플레이어 | Video.js (+ YouTube / Vimeo 플러그인) |

## 로컬에서 레거시 실행

정적 파일만으로 UI·편집 흐름을 확인할 수 있습니다.
자막 **다운로드(서버/PHP 연동)** 등은 운영 환경과 동일하지 않을 수 있습니다.

> 운영 동작·전체 기능 확인은 https://caption.devco.kr 를 기준으로 합니다.

## 작업 방식

1. **기준선 고정** — 레거시가 동작하는 상태를 먼저 기록한다
2. **한 번에 하나** — 버그 수정, 구조 정리, UX 개선 중 한 가지에 집중한다
3. **검증 후 전진** — 깨지면 롤백하고, 통과한 변경만 남긴다
4. **문서화** — 왜 바꿨는지, 어떻게 확인했는지 짧게 남긴다

진행 기록은 [CHANGELOG.md](./CHANGELOG.md), [changelog/](./changelog/), 이 README, 이슈로 이어 갑니다.

## 버전 정책

[Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

| 구분 | 설명 |
|------|------|
| **1.9.8** | Git 이전 운영 [Caption Studio](https://caption.devco.kr) 레거시 최종. CHANGELOG [Legacy](./CHANGELOG.md#legacy) 참고 |
| **2.0.0** | GitHub **첫 커밋**부터 SemVer 시작. `VERSION`, About UI, Git tag `v2.0.0`과 동일 |
| **2.0.x** | PATCH — `fix`, 사소한 `remove` 등. [changelog/2.0.md](./changelog/2.0.md)에 누적 |
| **2.1.0+** | MINOR — `feat`, 마일스톤 `refactor`. `changelog/2.x.md` 새 파일 |
| **3.0.0** | MAJOR — breaking 변경, 대규모 목표 완료 (예: jQuery 완전 제거) |

- **현재 버전:** 루트 [VERSION](./VERSION) 파일
- **변경 이력:** [CHANGELOG.md](./CHANGELOG.md) (목차) → [changelog/](./changelog/) (상세)
- **릴리즈:** Git tag `vX.Y.Z` (검증 완료된 마일스톤마다)

## 커밋 메시지 규칙

커밋 히스토리만 봐도 **무엇을, 왜, 어떤 영역에서** 바꿨는지 알 수 있도록 아래 형식을 따릅니다.

### 형식

```text
<type>(<scope>): <subject>

[optional body]
```

| 항목 | 규칙 |
|------|------|
| `type` | 변경 성격 (필수) |
| `scope` | 영역 (선택) |
| `subject` | 한 줄 요약, 50자 내외, 마침표 없음, 명령형 |
| `body` | 변경 이유·검증 방법 (선택) |

### type — 사용 시점

| type | 사용 시점 | 예시 |
|------|-----------|------|
| `chore` | 기능·동작과 무관한 정리. 기준선 추가, 설정, 의존성, 빌드 스크립트 | `chore: 운영 레거시 코드를 리팩터링 기준선으로 추가` |
| `refactor` | **동작은 유지**하면서 구조 개선. 모듈 분리, 변수 정리, 파일 이동 | `refactor(sheet): caption.js의 draw 로직을 sheet/draw.js로 분리` |
| `fix` | 잘못된 동작·버그 수정 | `fix(subtitle): SMI import 시 인코딩 깨짐 수정` |
| `feat` | 새 기능 추가 (기존에 없던 동작) | `feat(shortkey): 자막 검색 단축키 추가` |
| `perf` | 성능만 개선 (동작·UI 동일) | `perf(sheet): 자막 시트 렌더링 중복 호출 제거` |
| `style` | UI·CSS·마크업만 변경 (로직 변경 없음) | `style(ui): 자막 시트 행 간격 조정` |
| `docs` | README, 주석, 진행 문서 등 | `docs: 커밋 메시지 규칙 추가` |
| `test` | 테스트 추가·수정·실패 수정 | `test(subtitle): SRT 파서 단위 테스트 추가` |
| `remove` | jQuery·플러그인·미사용 코드 **제거** (대체 구현 포함) | `remove(jquery): colorpicker jQuery 플러그인을 vanilla로 교체` |

**type 선택이 애매할 때**

- 동작은 같고 코드만 정리 → `refactor`
- jQuery/플러그인을 없애는 변경 → `remove` (히스토리에서 찾기 쉽게)
- 사용자가 체감하는 새 동작 → `feat`
- 한 커밋에 여러 type이 섞이면 → 커밋을 나눈다

### scope — 영역

| scope | 대상 |
|-------|------|
| `sheet` | 자막 시트 (편집, 그리기, 트리거) |
| `player` | Video.js, 재생·타임라인 |
| `subtitle` | SRT/SMI 파싱, import/export |
| `i18n` | 다국어 |
| `shortkey` | 단축키 |
| `jquery` | jQuery·jQuery UI 의존 제거 |
| `structure` | 전역 변수, 모듈 구조, 네이밍 |
| `ui` | 화면·레이아웃·CSS |
| `build` | 번들, 빌드 설정 |
| `docs` | 문서 |

영역이 명확하지 않으면 scope 생략 가능합니다.

### body (선택)

큰 변경이거나 검증이 필요할 때 본문에 짧게 남깁니다.

```text
- Why: (변경 이유)
- Verify: (확인 방법 — 예: index.html에서 SRT import/export)
```

### 예시

```text
chore: 운영 중인 Caption Studio 레거시 코드를 리팩터링 기준선으로 추가
```

```text
refactor(sheet): caption.js의 시트 트리거 로직을 sheet/trigger.js로 분리

- Why: 단일 파일 분리 1단계
- Verify: 자막 추가·삭제·이동 수동 확인
```

```text
remove(jquery): jquery.shortcuts.js를 native keydown 핸들러로 교체
```

## 관련 링크

- 운영: https://caption.devco.kr
- 저장소: https://github.com/devco-hyunha/caption-studio
