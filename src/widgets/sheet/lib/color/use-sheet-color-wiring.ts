import { cloneTimeline, useSheetStore } from '@/entities/subtitle-sheet';
import { buildCurrents, buildMultiEntry, useSheetHistoryStore } from '@/features/sheet-history';
import type { SheetColorCommand } from '@/shared/types/color-command';
import { useSheetColorActions } from '@/features/sheet-color';
import type { ColorTextTransform } from '@/features/sheet-color';
import type { UseSheetColorWiringParams, UseSheetColorWiringResult } from '../../types';
import { isMultipleActive } from '../selection/is-multiple-active';
import { isTextMemoColumn, readTimelineText } from '../clip/use-sheet-clip-actions';
import { resolveFocusCursor } from '../focus/resolve-focus-cursor';

/**
 * color wiring adapter — feature color action에 시트 전속 deps(surface·스토어·history·커밋)를 주입한다.
 * 에딧 exec는 surface ref·다중 일괄은 multi.<command> history·단건은 onUpdateCell(update history).
 */
const useSheetColorWiring = ({
  format,
  currentRowIndex,
  currentColumn,
  isEditing,
  isTextTarget,
  inputRef,
  onUpdateCell,
  closeSearchPanel,
}: UseSheetColorWiringParams): UseSheetColorWiringResult => {
  const execToSelected = (transform: ColorTextTransform, command: SheetColorCommand) => {
    const store = useSheetStore.getState();
    const sheet = store.sheets[store.active];
    if (!sheet) return;

    const selected = sheet.selectedRows;
    if (selected.length === 0) return;

    const backups = selected.flatMap((index) => {
      const timeline = sheet.timelines[index];
      if (!timeline) return [];
      return [{ index, data: cloneTimeline(timeline) }];
    });
    if (backups.length === 0) return;

    const ok = useSheetStore.getState().updateSelectedTexts(transform);
    if (!ok) return;

    const afterSheet = useSheetStore.getState().sheets[store.active];
    const currents = buildCurrents(backups, afterSheet?.timelines ?? []);
    if (currents.length === 0) return;

    useSheetHistoryStore
      .getState()
      .pushHistory(
        buildMultiEntry(
          `multi.${command}`,
          backups,
          currents,
          resolveFocusCursor(format, currentRowIndex, currentColumn),
        ),
      );
  };

  const execToCurrent = (transform: ColorTextTransform) => {
    const store = useSheetStore.getState();
    const sheet = store.sheets[store.active];
    if (!sheet || currentRowIndex == null || !isTextMemoColumn(currentColumn)) return;

    const prev = readTimelineText(sheet.timelines[currentRowIndex], currentColumn);
    if (prev == null) return;
    const next = transform(prev);
    if (next === prev) return;

    // 커밋은 onUpdateCell — handleUpdateCell이 update history push
    onUpdateCell(currentRowIndex, currentColumn, next);
  };

  const { applyColorCommand } = useSheetColorActions({
    isEditing,
    isMultiple: isMultipleActive,
    isTextTarget,
    inputRef,
    closeSearchPanel,
    execToSelected,
    execToCurrent,
  });

  return { applyColor: applyColorCommand };
};

export { useSheetColorWiring };
