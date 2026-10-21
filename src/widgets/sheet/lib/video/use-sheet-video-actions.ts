import { timeSearch, useSheetStore } from '@/entities/subtitle-sheet';
import {
  adjustVideoVolume,
  getVideoPlayerControlApi,
  seekPlayerToNextCue,
  seekPlayerToPrevCue,
  seekPlayerToRowIndex,
  seekVideoBySeconds,
  toggleVideoPlayback,
  VIDEO_SEEK_STEP_SEC,
  useVideoSyncStore,
  VOLUME_STEP,
} from '@/features/video-sync';
import { secondsToMs } from '@/shared/lib/timecode';
import type { UseSheetVideoActionsParams, UseSheetVideoActionsResult } from '../../types';
import { isMultipleActive } from '../selection/is-multiple-active';

/** 포커스 행 — 셀 포커스 없으면 첫 행 */
const resolveFocusRow = (currentRowIndex: number | null) => currentRowIndex ?? 0;

/**
 * 시트 ↔ 플레이어 shortkey 동작 API — Ctrl+Q/Alt+Q/Ctrl+Space/±10s/volume.
 * video widget 전용 keydown 없음 (키보드 진입 = shortkey).
 */
const useSheetVideoActions = ({
  isEditing,
  currentRowIndex,
  currentColumn,
  endEdit,
  applyFocus,
}: UseSheetVideoActionsParams): UseSheetVideoActionsResult => {
  const videoJump = () => {
    if (isMultipleActive()) return;
    seekPlayerToRowIndex(resolveFocusRow(currentRowIndex));
  };

  /** Alt+Q — 재생 중 출력 행(없으면 timeSearch)으로 시트 포커스. 영상 seek 없음 */
  const sheetJump = () => {
    const sheetState = useSheetStore.getState();
    const sheet = sheetState.sheets[sheetState.active];
    if (!sheet || sheet.multipleActive) return;

    const { activeIndices } = useVideoSyncStore.getState();
    let targetRow: number | null = null;

    if (activeIndices.length > 0) {
      targetRow = Math.min(...activeIndices);
    } else {
      const seconds = getVideoPlayerControlApi()?.getCurrentTime();
      const ms = seconds != null ? secondsToMs(seconds) : 0;
      const hit = timeSearch(sheet.timelines, ms);
      if (hit.index >= 0) targetRow = hit.index;
    }

    if (targetRow == null) return;
    if (isEditing()) endEdit(true);
    applyFocus(targetRow, currentColumn ?? 'text');
  };

  return {
    videoJump,
    sheetJump,
    videoPlayToggle: () => {
      toggleVideoPlayback();
    },
    videoSeekPrev: () => {
      seekVideoBySeconds(-VIDEO_SEEK_STEP_SEC);
    },
    videoSeekNext: () => {
      seekVideoBySeconds(VIDEO_SEEK_STEP_SEC);
    },
    cuePrev: () => {
      seekPlayerToPrevCue();
    },
    cueNext: () => {
      seekPlayerToNextCue();
    },
    volumeUp: () => {
      adjustVideoVolume(VOLUME_STEP);
    },
    volumeDown: () => {
      adjustVideoVolume(-VOLUME_STEP);
    },
  };
};

export { useSheetVideoActions };
