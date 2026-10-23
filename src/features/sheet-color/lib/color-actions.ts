import type { SheetColorCommand } from '@/shared/types/color-command';
import type { UseSheetColorActionsParams, UseSheetColorActionsResult } from '../types';
import { parseColorSlot, toExecArgs } from './apply-color';
import { execOnHtml } from './exec-dom';

/**
 * color0~7·color_clear 실행 API — slot·store·exec 인자·3분기 선택만 소유한다.
 * surface exec·다중 일괄(history)·단건 커밋(history)은 widget 주입 콜백(transform)에 위임한다.
 * 에딧 execCommand / 다중 일괄 / 단건 3분기.
 */
const useSheetColorActions = ({
  isEditing,
  isMultiple,
  isTextTarget,
  inputRef,
  closeSearchPanel,
  execToSelected,
  execToCurrent,
}: UseSheetColorActionsParams): UseSheetColorActionsResult => {
  const applyColorCommand = (command: SheetColorCommand) => {
    closeSearchPanel();

    const slot = parseColorSlot(command);
    const { attr, value } = toExecArgs(command, slot);

    // 에딧 중 — 현재 에디터 selection에 exec (clip과 동일 게이트)
    if (isEditing()) {
      inputRef.current?.focus();
      document.execCommand(attr, false, value ?? undefined);
      return;
    }

    const transform = (text: string) => execOnHtml(text, attr, value);

    // 다중 선택 — 선택 행 text 일괄 + `multi.<command>` history (widget clip 패턴)
    if (isMultiple()) {
      execToSelected(transform, command);
      return;
    }

    // 단건 — text 타깃만 (exec·커밋·history는 widget clip 패턴)
    if (isTextTarget()) execToCurrent(transform);
  };

  return { applyColorCommand };
};

export { useSheetColorActions };
