import type { Fn } from '@/shared/types/fn';
import type { RefObject } from 'react';
import type { SheetColorCommand } from '@/shared/types/color-command';

/** HSB 색 (h 0..360, s/b 0..100) */
export interface HsbColor {
  h: number;
  s: number;
  b: number;
}

/** RGB 색 (r/g/b 0..255) */
export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

/** 팔레트 8셀 — hex 문자열 (`#rrggbb` 소문자) */
export type ColorList = string[];

/** localStorage `CaptionColorTemp` 영속 payload */
export interface ColorPersistedState {
  colors: ColorList;
}

export interface ColorStore {
  colors: ColorList;
  /** 팔레트 셀 교체 + 영속 저장 */
  setColor: (index: number, hex: string) => void;
}

/** color exec 인자 — color_clear는 `removeFormat`(value=foreColor 무시) */
export interface ColorExecArgs {
  attr: 'foreColor' | 'removeFormat';
  value: string | null;
}

/** execOnHtml transform — text → exec 실행 후 encode된 text */
export type ColorTextTransform = (text: string) => string;

/** color 적용 훅 params — surface·스토어·history·커밋은 widget 주입 (FSD: feature는 상위·수평 import 없음) */
export interface UseSheetColorActionsParams {
  isEditing: Fn<boolean>;
  isMultiple: Fn<boolean>;
  isTextTarget: Fn<boolean>;
  inputRef: RefObject<HTMLDivElement | null>;
  /** 검색 패널 닫기 — clip과 동일 게이트 */
  closeSearchPanel: Fn<void>;
  /** 다중 선택 — 선택 행 text 일괄 + `multi.<command>` history (widget clip 패턴) */
  execToSelected: (transform: ColorTextTransform, command: SheetColorCommand) => void;
  /** 단건 — 포커스 셀 text transform + `update` history + 커밋 (widget clip 패턴) */
  execToCurrent: (transform: ColorTextTransform) => void;
}

export interface UseSheetColorActionsResult {
  /** color0..7·color_clear 실행 — 에딧 execCommand / 다중 일괄 / 단건 커밋 분기 */
  applyColorCommand: (command: SheetColorCommand) => void;
}

/** color selector dialog props — DialogShell을 감싼 셸. 열림은 widget 툴바 소유 */
export interface ColorSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 다이얼로그 진입 시 저장 포커스 — 닫힘 시 복원 */
  prevFocusRef: RefObject<HTMLElement | null>;
}

/** 팔레트 8셀 렌더 props — 8 panel + `.current` */
export interface ColorPaletteProps {
  colors: ColorList;
  /** 현재 선택된 팔레트 index — `.current`에 해당 */
  activeIndex: number | null;
  onSelect: (index: number) => void;
}

/** color 피커 props — DialogShell body 슬롯에 조립. 필드(hex/rgb/hsb) + submit */
export interface ColorPickerProps {
  /** 현재 HSB — 필드·preview와 동기화 */
  value: HsbColor;
  onValueChange: (hsb: HsbColor) => void;
  /** submit — hex는 소비 측 hsbToHex */
  onSubmit: (hsb: HsbColor) => void;
}
