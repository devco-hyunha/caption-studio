/** shortkey 시트 키 바인딩 타입 (S2: 이동·에딧·선택·CRUD) — 엔진 규격은 shared */

import type { RefObject } from 'react';
import type { Fn } from '@/shared/types/fn';
import type { SheetColorCommand } from '@/shared/types/color-command';
import type { ShortcutKeyHandler } from '@/shared/types/shortkey';
import type { SHORTKEY_IDS } from './model/keys/ids';
import type { SHORTKEY_LABEL_KEYS } from './model/keys/labels';

/** 시트 shortkey id — `SHORTKEY_IDS` 값 집합에서 파생 */
export type SheetShortkeyId = (typeof SHORTKEY_IDS)[keyof typeof SHORTKEY_IDS];

/** 라벨 있는 키 id — `SHORTKEY_LABEL_KEYS` 키 집합에서 파생 (설정 UI kbd 렌더 대상). labels는 types를 import하지 않아 사이클 없음 */
export type ShortkeyLabelId = Extract<SheetShortkeyId, keyof typeof SHORTKEY_LABEL_KEYS>;

/** 서식 명령 — bold/italic/underline · colorClear(color-reset) */
export type SheetTextFormatCommand = 'bold' | 'italic' | 'underline' | 'colorClear';

/** mask 저장 맵 — 부분집합 (persist merge·승격용) */
export type ShortkeyMasks = Partial<Record<SheetShortkeyId, string>>;

/** localStorage `shortkeyMasks` persist partialize 결과 */
export interface ShortkeyPersistedState {
  masks: ShortkeyMasks;
}

export interface ShortkeyStore {
  masks: Record<SheetShortkeyId, string>;
  setMask: (id: SheetShortkeyId, mask: string) => void;
  resetMasks: Fn<void>;
}

/** 시트 이동 — shortkey가 호출하는 API */
export interface SheetShortkeyMoveActions {
  moveTabNext: ShortcutKeyHandler;
  moveTabPrev: ShortcutKeyHandler;
  moveRowPrev: ShortcutKeyHandler;
  moveRowNext: ShortcutKeyHandler;
  moveColPrev: ShortcutKeyHandler;
  moveColNext: ShortcutKeyHandler;
  movePagePrev: ShortcutKeyHandler;
  movePageNext: ShortcutKeyHandler;
}

/** `/edit` 시트가 shortkey에 주입하는 동작 API (위젯 → feature, 역참조 없음) */
export interface SheetShortkeyActions extends SheetShortkeyMoveActions {
  isEditing: Fn<boolean>;
  isTextTarget: Fn<boolean>;
  hasFocus: Fn<boolean>;
  isMultiple: Fn<boolean>;
  /** F2 / Enter(비에딧) — 기존 값 로드 */
  beginEdit: Fn<void>;
  /** Esc — 값 취소, focus 유지 */
  cancelEdit: Fn<void>;
  /** printable / IME — 타입 투 리플레이스 (지연 setMode) */
  beginEditFromTyping: ShortcutKeyHandler;
  /** Enter(에딧 중) — 줄바꿈 */
  insertEditorLineBreak: Fn<void>;
  /** multiple 모드 토글 */
  toggleMultiple: Fn<void>;
  /** Space — multiple 중 현재 행 토글 */
  toggleRowSelect: Fn<void>;
  /** 현재 행 뒤 삽입 */
  insertRow: Fn<void>;
  /** 현재 행 삭제 */
  removeRow: Fn<void>;
  /** bold / italic / underline — multiple·에딧·단건 clip */
  applyTextFormat: (command: SheetTextFormatCommand) => void;
  /** color0~7·color_clear — 다중·에딧·단건 분기(훅 내장) */
  applyColor: (command: SheetColorCommand) => void;
  /** Backspace/Delete — text/memo 셀 비우기 (비에딧) */
  clearCell: Fn<void>;
  /** Ctrl+X — 비에딧 text/memo cut */
  clipCut: Fn<void>;
  /** Ctrl+C — 비에딧 text/memo copy */
  clipCopy: Fn<void>;
  /** Ctrl+V — 비에딧 text/memo paste */
  clipPaste: Fn<void>;
  /** shortkey용 — starttime/endtime 타깃 */
  isTimeTarget: Fn<boolean>;
  /** Ctrl+Plus — 다중: 선택 행 start/end 일괄 +jump · single: time 셀 +jump */
  timePlus: Fn<void>;
  /** Ctrl+Minus — 다중: 선택 행 start/end 일괄 −jump · single: time 셀 −jump */
  timeMinus: Fn<void>;
  /** `Ctrl+/` — 검색 패널 focus(닫히면 열기, 열림이면 input 재포커스) */
  focusSearch: Fn<void>;
  /** Esc — 검색 패널 열림 시 닫기 (에딧·다중선택보다 우선) */
  closeSearchPanel: Fn<void>;
  /** 검색 패널 열림 여부 — Esc 우선순위 판별 */
  isSearchPanelOpen: Fn<boolean>;
  /** Ctrl+Z — 에딧 중이 아닐 때만 */
  undo: Fn<void>;
  /** Ctrl+Y */
  redo: Fn<void>;
  /** Ctrl+` — 포커스 start/end 셀에 플레이어 시각 반영 */
  timeCarve: Fn<void>;
  /** Ctrl+Q — 현재 행 start로 플레이어 seek */
  videoJump: Fn<void>;
  /** Alt+Q — 재생 중 출력 행으로 시트 포커스·스크롤 (영상 seek 없음) */
  sheetJump: Fn<void>;
  /** Ctrl+Space — 재생/일시정지 */
  videoPlayToggle: Fn<void>;
  /** Ctrl+← — −10초 */
  videoSeekPrev: Fn<void>;
  /** Ctrl+→ — +10초 */
  videoSeekNext: Fn<void>;
  /** Ctrl+↑ — 볼륨 +0.1 */
  volumeUp: Fn<void>;
  /** Ctrl+↓ — 볼륨 −0.1 */
  volumeDown: Fn<void>;
  /** Ctrl+Alt+← — 이전 자막 시점으로 플레이어 seek */
  cuePrev: Fn<void>;
  /** Ctrl+Alt+→ — 다음 자막 시점으로 플레이어 seek */
  cueNext: Fn<void>;
}

export interface UseSheetShortkeyParams {
  getActions: Fn<SheetShortkeyActions>;
}

/** 설정 패널 props — 열림 상태는 라우트 셸이 소유, 닫기는 라우트 navigate */
export interface ShortkeySettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 다이얼로그 진입 시 저장 포커스 — 닫힘 시 복원 */
  prevFocusRef: RefObject<HTMLElement | null>;
}

/** 고정키 행 props — kbd 렌더 대상은 라벨 있는 키 */
export interface ShortkeyFixedRowProps {
  id: ShortkeyLabelId;
}

/** 커스텀키 행 props — 변경 상태(editing·raw)는 부모 패널이 소유 (Esc 게이트가 패널 수준). base는 fixed 행 props */
export interface ShortkeyCustomRowProps extends ShortkeyFixedRowProps {
  /** 이 행의 변경 UI 노출 중 */
  editing: boolean;
  /** 입력된 raw mask — 변경 UI 노출 중에만 부모가 유지 */
  raw: string;
  onStartEdit: Fn<void>;
  onRawChange: (raw: string) => void;
  onCancelEdit: Fn<void>;
}

/** 커스텀 키 변경 폼 — submit 검증 결과 */
export type CustomMaskValidation = 'empty' | 'single' | 'conflict' | 'ok';

/** submit 검증 입력 — normalize 전 raw mask + 스토어 현재 masks */
export interface CustomMaskCheck {
  rawMask: string;
  masks: Record<SheetShortkeyId, string>;
  /** 검사에서 제외할 자기 id */
  selfId: SheetShortkeyId;
}
