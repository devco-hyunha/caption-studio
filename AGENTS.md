# AGENTS.md — Caption Studio

이 문서는 **도구와 무관하게** 에이전트·자동화·외부 도구가 따라야 하는 프로젝트 공통 지시이다.  
Cursor(`.cursor/rules`)만 믿지 말고, **작업을 시작하기 전에 이 파일을 읽고** 아래에 적힌 문서를 확인한다.

소통 언어: **한국어**.

---

## 0. 필수 확인 문서 (작업 전)

| 상황 | 반드시 읽을 것 |
|------|----------------|
| 모든 작업 | 본 `AGENTS.md` |
| 2.9 `/edit` React 이전 · 슬라이스 구현 · 마이그레이션 계획 | [`docs/roadmap/README.md`](./docs/roadmap/README.md) + **해당 슬라이스** `docs/roadmap/sN-*.md` |
| 2.9 진행 이력 · 완료 조건 | [`changelog/2.9/README.md`](./changelog/2.9/README.md) |
| 신규 FE(`src/**`) 아키텍처 상세 | [`.cursor/rules/fsd-architecture.mdc`](./.cursor/rules/fsd-architecture.mdc) (본 문서에도 동일 내용 수록) |
| 신규 FE 코드 컨벤션 상세 | [`.cursor/rules/code-conventions.mdc`](./.cursor/rules/code-conventions.mdc) (본 문서에도 동일 내용 수록) |
| 품질·parity·테스트 상세 | [`.cursor/rules/quality-verification.mdc`](./.cursor/rules/quality-verification.mdc) (본 문서에도 동일 내용 수록) |
| Cursor 전용 워크플로 규칙 | [`.cursor/rules/project-workflow.mdc`](./.cursor/rules/project-workflow.mdc) (본 문서에도 동일 내용 수록) |
| 제품·실행·커밋 메시지 형식 | [`README.md`](./README.md) |

**로드맵이 “구현하라”는 신호가 아니다.** 사용자가 **한 슬라이스만** 명시적으로 지정했을 때만 그 슬라이스를 구현한다.  
로드맵·플랜·`Implement the plan`만으로 **S1–S7을 한꺼번에 구현하지 않는다.**

---

## 1. 기본 작업 원칙

- **한 번에 하나**: 버그 수정 / 구조 정리 / UX 개선 / 도메인 이전 중 **한 작업 단위에 한 가지만** 수행한다.
- 요청받지 않은 리팩터링, 문서 추가, 의존성 설치를 일체 하지 않는다.
- 질문·방향 논의 중에도 임의로 파일을 생성·수정·삭제하지 않는다.

---

## 2. Git 브랜치 전략

### 베이스 브랜치

- `main`: 안정화 기준선 및 릴리스 브랜치
- `feature/tanstack-start`: 신규 FE 마이그레이션 작업의 기준 브랜치

### 단위 (슬라이스 / 작업 / Decision)

| 단위 | 역할 |
|------|------|
| **슬라이스** | 로드맵 범위 (`docs/roadmap` S1…). 작업이 여러 개일 수 있다 |
| **작업** | **브랜치 단위**. 한 덩어리 변경마다 브랜치 하나 (`type/scope`) |
| **Decision** | 작업 전 기술 선택 표. Decision ≠ 브랜치. 한 작업에 여러 Decision 행 가능 |

Decision마다 브랜치를 기계적으로 만들지 않는다. 다만 슬라이스가 크면 **작업이 나뉘며 브랜치가 여러 개** 생길 수 있다.

### 작업 브랜치 생성 기준

- **신규 FE 마이그레이션**: `feature/tanstack-start`를 기준으로 **작업별** 브랜치를 생성한다. (`public/**` 등 레거시 파일은 생성/수정/삭제 일체 금지)
- **레거시 오류 수정 / 기능 개선**: `feature/tanstack-start`에서 작업하지 않고, 반드시 **`main` 브랜치를 기준**으로 새 작업 브랜치를 생성한다.

### 작업 시작 순서 (필수)

1. **이번 작업 범위 확인** — 사용자와 “이번에 무엇을 할지”를 확인한다 (슬라이스 전체 일괄 가정 금지)
2. **브랜치 먼저 생성** — 확인된 이름으로 분기한 뒤 구현을 시작한다. 브랜치 없이 / 확인 없이 코드부터 쓰지 않는다
3. **Decision** (채택 + 대안 + 이유) → 구현 → changelog

---

## 3. 커밋 및 체인지로그

- **체인지로그 선기록**: 커밋 전 작업 브랜치의 변경 사항을 정리하여 `changelog/` 내 해당 마일스톤 문서에 먼저 작성한다.
- **커밋 메시지 형식**: README「커밋 메시지 규칙」을 준수한다.
  - 형식: `<type>(<scope>): <subject>` (50자 내외, 명령형, 마침표 없음)
  - 주요 Type: `feat`, `fix`, `refactor`, `remove`, `style`, `chore`, `docs`
  - Body (필요 시, **각 1줄**):
    - `- Why:` 핵심 이유만. **서술문(`~한다/이다`) 금지** — 명사구·개조식. 배경·버전·브랜치 나열 금지.
    - `- Verify:` 확인 방법만 1줄 (개조식).
    - 예 Why: `/` 레거시 유지, React 전환 기반 마련` (O) / `React 전환 기반을 둔다` (X) / `2.9.0-dev.1 — …` (X)
- **데이터 호환성**: localStorage 및 데이터 스키마 변경 시 이전 버전과의 호환을 위한 migrate 경로(변환 로직)를 반드시 구현한다.

### AI의 Git 경계

- **`git commit` / `git push` / PR 생성·머지를 AI가 직접 실행하지 않는다.** 사용자가 수행한다. 작업 완료 시 **커밋 메시지 제안까지만** 작성한다.
- 사용자가 “커밋해”라고 명시하지 않으면 스테이징·커밋하지 않는다.
- **`git clean -fd`**, hard reset, force push 등 파괴적 명령을 함부로 쓰지 않는다. untracked 중 **내가 만든 것만** 지울지 범위를 확인하고, 사용자 동의 없이 타인/기존 로컬 파일을 지우지 않는다.
- **임의 롤백/재생성 금지**: 문제 발생 시 사용자 동의 없이 코드를 롤백하거나 다시 생성하지 않는다.

---

## 4. AI 역할 및 금지 사항

- **임의 작업 일체 금지**: 사용자의 명시적인 요청 없는 파일 생성·수정·삭제를 하지 않는다.
- **사전 구조 생성 금지**: 요청 없이 전체 슬라이스 매핑표를 설계하거나, 빈 FSD 레이어/슬라이스 폴더를 미리 만들지 않는다.
- **간결한 응답**: 불필요한 장문과 변경 코드의 중복 출력을 하지 않는다. 다만 사용자가 **문서·규칙을 제대로 작성하라**고 하면 내용을 임의로 축약·누락하지 않는다.
- **플랜만 / 문서만** 요청이면 코드·구현·일괄 슬라이스 이전을 하지 않는다.
- Vitest 통과만으로 “기능이 된다”고 보고하지 않는다. 수동 Verify·parity를 구분해서 말한다.

---

## 5. 2.9 React 이전 로드맵 (필수)

기준 문서: [`docs/roadmap/`](./docs/roadmap/)

| 항목 | 내용 |
|------|------|
| 목표 | `/edit`가 **레거시 스크립트 의존 없이** 편집기로 동작 → `VERSION` / tag **`2.9.0`** (반영은 **사용자** 판단) |
| 기준선 | **dev.2 완료** — Sheet UI · `subtitleSheets` 영속 · 셀 포커스 이동 |
| 브랜치 | `feature/tanstack-start` |
| 현재 릴리스 | `2.8.4` |

### 슬라이스 순서 (한 번에 하나만)

| ID | 제목 | 상세 문서 |
|----|------|-----------|
| S1 | Shortkey (엔진 + 시트 이동·에딧 키 이관) | [s1-shortkey.md](./docs/roadmap/s1-shortkey.md) |
| S2 | Sheet: 행 선택 + 행 CRUD | [s2-sheet-crud-select.md](./docs/roadmap/s2-sheet-crud-select.md) |
| S3 | Sheet: 검색 + undo/redo | [s3-search-undo.md](./docs/roadmap/s3-search-undo.md) |
| S4 | Subtitle I/O (SMI/SRT) | [s4-subtitle-io.md](./docs/roadmap/s4-subtitle-io.md) |
| S5 | Video ↔ Sheet sync | [s5-video-sync.md](./docs/roadmap/s5-video-sync.md) |
| S6 | UI 셸 + i18n/settings | [s6-ui-i18n-settings.md](./docs/roadmap/s6-ui-i18n-settings.md) |
| S7 | Cutover | [s7-cutover.md](./docs/roadmap/s7-cutover.md) |

### 키보드 진입 원칙

- **시트** = 동작 API · **shortkey** = 키보드 진입
- S1에서 dev.2 widget `window` keydown(이동·에딧)을 shortkey로 이관한다
- 이후 슬라이스는 시트에 전역 keydown을 다시 붙이지 않고 shortkey 핸들러만 추가한다

### 로드맵 작업 원칙

- **한 번에 하나** — **작업** 혼재 금지 (슬라이스 전체를 한 브랜치에 몰아넣지 않음)
- **parity 우선** — 레거시 동작 동등성. 임의 UX 변경 없음
- **결정 먼저, 코드 나중** — **작업** 착수 전 Decision을 닫고 `changelog/2.9/2.9.0-dev.N.md`에 기록한 뒤 구현. **채택 + 대안 + 이유** 필수 ([docs/roadmap/README.md](./docs/roadmap/README.md)). 작업 시작은 **범위 확인 → 브랜치 생성 → Decision → 구현** 순서
- **빈 FSD 폴더 사전 생성 금지**
- 작업 단위로 changelog 선기록 (슬라이스 ≠ 무조건 브랜치 하나)

### 잠긴 결정 (재논의 금지)

| 결정 | 채택 |
|------|------|
| 앱 골격 | Vite + TanStack Start/Router + React + TS |
| 디렉터리 | FSD |
| 시트 윈도잉 | Legacy page 스냅 (Virtual 제거) |
| 시트 영속 | Zustand `persist` + `partialize`, 키 `subtitleSheets` |
| 뷰 상태 | `scroll` / `current` / `selectedRows`는 **디스크 제외** |
| React Compiler | Oxc `compiler: true` |
| `/` vs `/edit` | 하이브리드, 완전 변환 전까지 `/` 레거시 |
| 키보드 진입 | **shortkey** (S1 이후 시트 widget 전역 keydown 소유 금지) |

### 기술 결정 게이트

- 게이트가 열리면 **구현을 시작하지 않는다**. Decision 기록 후 진행.
- **필수**: Decision마다 **채택(정해진/쓸 기술)** 과 **대안 1개 이상**(또는 “대안 없음 + 이유”), **채택·기각 이유**, **상태**(`잠김`/`기본채택`/`미확정`/`사용자확인`)를 제시한다. 채택만 적고 끝내지 않는다.
- `changelog/2.9/2.9.0-dev.N.md` `### Decision` 표 형식은 [`docs/roadmap/README.md`](./docs/roadmap/README.md) 「필수: 채택 기술 + 대안 제시」를 따른다.
- 사용자 확인이 필요한 경우(새 의존성 · 의도적 UX/스키마 변경 · 스토리지 파괴 · `미확정` 게이트)는 표를 보여 준 뒤 한 번 묻는다.

### 의도적으로 뒤로 미루는 것 (기능 슬라이스와 섞지 않음)

- `use-sheet-cell-edit` 대규모 분해 (키 이관과 무관한 구조 분해)
- widget/entity 동명 파일 rename
- persist `beforeunload` flush
- analytics / ads
- 빈 `features/` · `pages/` 선제 생성
- shortkey 커스텀 키 설정 UI (S1에서 후속 가능)
- video 재생 키 바인딩은 S5에서 shortkey 핸들러로 추가

---

## 6. Architecture & Directory Structure (`src/**`)

신규 FE(`src/**`) 개발 시 적용하는 FSD 아키텍처 및 상태 관리 표준이다.

### 6.1 FSD 계층 및 의존성 규칙

레이어는 상위에서 하위로만 단방향 import하며, 역방향 및 동일 레이어 슬라이스 간 직접 참조는 엄격히 금지한다.

```text
app       (최상위: 앱 진입점, 글로벌 프로바이더, 라우팅 초기화)
 └── pages     (라우트별 페이지 단위)
      └── widgets   (독립 완성형 대형 UI 블록: 헤더, 시트 패널, 비디오 플레이어 영역 등)
           └── features  (사용자 인터랙션 기능: 자막 검색, SMI/SRT 내보내기, 단축키 처리 등)
                └── entities  (핵심 비즈니스 모델 및 기본 단위 UI: 자막 데이터, 시트 탭 모델 등)
                     └── shared    (최하위: 비즈니스 로직 없는 공통 UI, 범용 유틸, 공통 타입)
```

- **단방향 참조**: 상위 레이어만 하위 레이어를 조합할 수 있다.
- **수평 참조 금지**: 같은 레이어 내 슬라이스 간 직접 참조는 금지하며, 공통 로직이 필요하면 하위 레이어로 강등한다.
- **점진적 생성 (YAGNI)**: 쓰지 않는 빈 레이어/슬라이스를 미리 만들지 않는다.

### 6.2 레이어 구성 방식 (Slices & Segments)

- **`app` 및 `shared`**: 슬라이스 폴더 없이 세그먼트(`ui/`, `lib/`, `types/` 등)로 직접 구성한다.
- **`pages`, `widgets`, `features`, `entities`**: 반드시 도메인 슬라이스 폴더를 먼저 두고 내부에 세그먼트(`ui/`, `model/`, `api/`, `lib/`, `types.ts` 등)를 둔다.

### 6.3 캡슐화 및 Public API (`index.ts`)

- 각 슬라이스는 루트에 `index.ts`를 반드시 두며, 외부로 공개할 기능만 명시적으로 re-export한다.
- 슬라이스 외부에서는 반드시 Public API(`index.ts`)를 통해서만 import하며, 내부 세그먼트 파일로 직접 파고드는 import는 금지한다.

### 6.4 타입 파일 관리 (Type Co-location)

- **도메인 종속 타입**: 해당 도메인 슬라이스 내부의 `types.ts` (또는 `model/types.ts`)로 분리 관리한다.
- **공통 타입**: 비즈니스 도메인과 무관한 순수 공통 규격 및 범용 타입만 `shared/types/`에 둔다.

### 6.5 상태 관리 (State Management)

- **전역 거대 스토어 금지**: 단일 파일에 모든 상태를 몰아넣지 않고, 슬라이스별 `model/`에 Zustand 스토어로 분리 격리한다.
- **선택적 영속화 (`persist` + `partialize`)**: `localStorage` 저장 시 Zustand의 `persist` 미들웨어를 사용하되, 반드시 `partialize`로 영속화가 필요한 핵심 데이터만 선별 저장한다. 휘발성 UI 상태는 제외한다.
- **레거시 상태 마이그레이션 사전 검토**: 레거시 `state.js`를 단순히 1:1로 복사하지 않는다. 마이그레이션 시 데이터(영속), 편집 세션 UI(포커스, 편집 모드), 보조 기능(검색, 히스토리 등)으로 분리할 필요성과 React 환경에 맞춰 새로 추가할 상태가 있는지 반드시 사전 검토 후 설계한다.

---

## 7. Code Conventions (`src/**`)

신규 FE(`src/**`, React 19 + TypeScript + Tailwind 4) 개발 시 적용하는 코드 작성 표준이다.

### 7.1 핵심 설계 원칙

- **SRP**: 컴포넌트는 UI 표현, 커스텀 훅은 상태 및 라이프사이클 제어, 유틸은 순수 계산 로직만 담당한다.
- **KISS & YAGNI**: 복잡한 기교나 사전 추상화를 피하고, 가장 단순하고 읽기 쉬운 구조를 우선한다.
- **DRY**: 공통 비즈니스 계산 및 유틸 로직은 공통화하되, 구조만 우연히 유사한 UI는 억지로 공통 컴포넌트로 묶지 않는다.
- **ISP**: 컴포넌트나 함수에 거대한 객체를 통째로 넘기지 않고, 실제로 사용하는 최소한의 props/필드만 전달한다.

### 7.2 명명 규칙

- **파일 / 디렉터리**: `kebab-case` (예: `timeline-row.tsx`, `use-timeline.ts`, `types.ts`)
- **컴포넌트 / 타입 / 인터페이스**: `PascalCase` (예: `TimelineRow`, `SubtitleItem`)
- **변수 / 함수 / 훅**: `camelCase` (예: `isLoading`, `formatTime`, `useTimelineStore`)
- **상수**: `UPPER_SNAKE_CASE` (예: `DEFAULT_FRAME_RATE`, `MAX_SHEETS`)
- **이벤트 핸들러**: `handle*` 접두사 (예: `handleClick`, `handleChange`, `handleKeyDown`)

### 7.3 TypeScript 및 타입 관리

- **타입 분리**: 컴포넌트 파일 내부에 타입을 인라인으로 두지 않고, 반드시 별도의 `types.ts`로 분리한다.
- **인터페이스 우선**: 객체 모델 정의 시 `type`보다 `interface`를 우선 사용한다.
- **타입 안정성**: `any` 사용 일체 금지. `enum` 대신 `as const` 객체 맵 또는 문자열 유니온을 사용한다.

### 7.4 함수 및 컴포넌트 선언

- 컴포넌트, 커스텀 훅, 유틸 함수 등 모든 선언은 **`const` 화살표 함수로 일관되게 통일**한다.
- **`named export`**를 기본으로 사용한다 (프레임워크 라우팅 규약 파일 제외, `default export` 지양).
- 복잡한 조건 분기는 **조기 리턴**을 활용한다.

### 7.5 파일 내부 배치 순서

**컴포넌트 파일 (`.tsx`)**

1. `import` 문 (외부 라이브러리 → 내부 모듈 → `types`)
2. 파일 전용 로컬 상수 (`UPPER_SNAKE_CASE`)
3. 메인 컴포넌트 (`export const Component = () => { ... }`)
4. 파일 내부 전용 보조 컴포넌트 (외부 export 없음)

**로직 / 훅 파일 (`.ts`)**

1. `import` 문
2. 로컬 상수 및 초기 상태 정의
3. 메인 훅 / 함수
4. 파일 내부 전용 보조 계산 함수

### 7.6 스타일링 및 마크업

- **Tailwind 우선**: 일반 UI 및 레이아웃은 Tailwind 유틸리티. 조건부 클래스는 `cn`(`clsx` + `tailwind-merge`).
- **동적 값**: 런타임 계산값은 CSS 변수 주입 + Tailwind 대괄호 문법 (`h-[var(--custom-val)]`) 권장.
- **시트 데이터 본문 서식 예외**: 자막 시트 내부 사용자 편집 텍스트 서식은 데이터 원본 보존을 위해 인라인 서식 및 HTML 태그 사용을 **허용**한다.
- **A11y**: 시맨틱 태그, `aria-label`, 키보드 접근(`tabIndex`, `onKeyDown`)을 고려한다.

---

## 8. Quality & Verification (`src/**`)

### 8.1 정적 분석 및 포맷팅

- **ESLint**: 작업 완료 후 린트 에러·경고가 없어야 한다 (`pnpm lint`).
- **Prettier**: `.prettierrc.json` 준수 (`pnpm format`).
- **타입 검사**: `tsc --noEmit` 에러 없음.

### 8.2 마이그레이션 기능 검증 (Parity)

- **동작 동등성(Parity) 최우선**. 임의 UX 변경 금지.
- **도메인별 필수 수동 검증**:
  - **Subtitle**: SMI / SRT 가져오기·내보내기 시 한글/특수문자 인코딩 깨짐 없음
  - **Sheet**: 가상 스크롤 시 프레임 드랍 및 행 위치 어긋남 없음, 다중 선택/포커스 이동
  - **Video**: 재생/일시정지/탐색(Seek) 시 자막 시트 싱크
  - **Shortkey**: 주요 단축키가 입력 필드(`input`)와 충돌 없이 동작
- **스토리지 호환성**: 레거시 `localStorage` 데이터가 있는 상태에서 새 앱 로드 시 자동 마이그레이션(승격)이 에러 없이 수행되는지 확인한다.

### 8.3 테스트 (Vitest + React Testing Library)

- **표준 도구**: Vitest, React Testing Library.
- **우선순위**:
  1. **순수 로직 / 비즈니스 계산 (필수)**: 자막 파서/직렬화, 타임코드, 스키마 변환 등
  2. **핵심 인터랙션 UI (권장)**: 탭, 검색, 모달 등
  3. **수동 검증 대체**: 가상화 스크롤, `contenteditable` 등 재현이 어려운 렌더링
- **AI의 테스트 설명 원칙**: 테스트 코드를 처음 접하는 사용자를 위해 일방적으로 생성하지 않는다. **목적**, **문법 구조**, **실행·결과 확인 방법**을 설명한다.
- 2.9 기간 **E2E(Playwright 등) 신규 도입 안 함** (`docs/roadmap` 검증 정책).
- 단위 테스트 통과 ≠ 제품 parity 완료. 보고 시 구분한다.

### 8.4 슬라이스 DoD (로드맵과 동일)

슬라이스 완료 시 항상:

1. 해당 슬라이스 상세 문서의 DoD
2. 순수 로직 Vitest (필수)
3. `dev.N` Verify 수동 시나리오
4. `pnpm test:run` + lint/type 관련 통과

---

## 9. 하이브리드 앱 구조 (현재)

- `/` — 레거시 Caption Studio (`widgets/caption-shell` + `public/js`)
- `/edit` — React로 이전하는 편집기 (2.9 작업 장소)
- 운영·전체 기능 기준: https://caption.devco.kr
- 로컬: `pnpm install` · `pnpm dev` · `pnpm typecheck` · `pnpm build` · `pnpm lint` · `pnpm test:run`

상세 구조·버전 정책: [`README.md`](./README.md), [`CHANGELOG.md`](./CHANGELOG.md).

---

## 10. 충돌 시 우선순위

1. 사용자의 **이번 턴 명시 지시** (범위·금지 포함)
2. 본 `AGENTS.md`
3. `docs/roadmap/` (2.9 이전 관련)
4. `.cursor/rules/*`
5. `README.md` / `changelog/`

사용자가 “문서만”, “플랜만”, “로드맵만”이라고 하면 **구현하지 않는다.**
