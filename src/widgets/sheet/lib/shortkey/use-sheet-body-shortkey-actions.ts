import type {
  UseSheetBodyShortkeyActionsParams,
  UseSheetBodyShortkeyActionsResult,
} from '../../types';
import { isMultipleActive } from '../selection/is-multiple-active';
import { buildSheetShortkeyActions } from './build-sheet-shortkey-actions';

/**
 * sheet-body shortkey actions 조립 — getShortkeyActions 클로저를 lib로 이동.
 * 시트 훅 결과(clip·time·video·move) + 포커스·선택 콜백 → shortkey actions 팩토리.
 * `toggleRowSelect`는 현재 포커스 행이 있을 때만 Space 토글.
 */
const useSheetBodyShortkeyActions =
  ({
    move,
    clip,
    time,
    video,
    isEditing,
    isTextTarget,
    isTimeTarget,
    hasFocus,
    beginEdit,
    cancelEdit,
    beginEditFromTyping,
    insertEditorLineBreak,
    toggleMultiple,
    currentRowIndex,
    handleSpaceToggle,
    insertRow,
    removeRow,
    toggleSearch,
    undo,
    redo,
  }: UseSheetBodyShortkeyActionsParams): UseSheetBodyShortkeyActionsResult =>
  () =>
    buildSheetShortkeyActions({
      move,
      isEditing,
      isTextTarget,
      hasFocus,
      isMultiple: isMultipleActive,
      beginEdit,
      cancelEdit,
      beginEditFromTyping,
      insertEditorLineBreak,
      toggleMultiple,
      toggleRowSelect: () => {
        if (currentRowIndex == null) return;
        handleSpaceToggle(currentRowIndex);
      },
      insertRow,
      removeRow,
      applyTextFormat: clip.applyTextFormat,
      clearCell: clip.clearCell,
      clipCut: clip.clipCut,
      clipCopy: clip.clipCopy,
      clipPaste: clip.clipPaste,
      isTimeTarget,
      timePlus: time.timePlus,
      timeMinus: time.timeMinus,
      timeCarve: time.timeCarve,
      videoJump: video.videoJump,
      sheetJump: video.sheetJump,
      videoPlayToggle: video.videoPlayToggle,
      videoSeekPrev: video.videoSeekPrev,
      videoSeekNext: video.videoSeekNext,
      volumeUp: video.volumeUp,
      volumeDown: video.volumeDown,
      cuePrev: video.cuePrev,
      cueNext: video.cueNext,
      toggleSearch,
      undo,
      redo,
    });

export { useSheetBodyShortkeyActions };
