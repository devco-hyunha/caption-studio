export type {
  VideoPlayerControlApi,
  VideoSyncActions,
  VideoSyncState,
  VideoSyncStore,
} from './types';

export { useVideoSyncStore } from './model/use-video-sync-store';

export { usePlaybackSet } from './lib/use-playback-set';

export {
  rebuildVideoTimeSlotsFromActiveSheet,
  refreshActiveIndicesFromPlayback,
  syncVideoTimeSlotsAfterInsert,
  syncVideoTimeSlotsAfterRemove,
  syncVideoTimeSlotsAfterRowTimeEdit,
} from './lib/sync-time-slots-with-active-sheet';

export { sameIndices, syncPlaybackFromPlayerTime } from './lib/sync-playback-from-player-time';

export { getVideoPlayerControlApi, registerVideoPlayerControlApi } from './lib/player-bridge';

export {
  seekPlayerToNextCue,
  seekPlayerToPrevCue,
  seekPlayerToRowIndex,
} from './lib/seek-player-to-row';

export {
  adjustVideoVolume,
  seekVideoBySeconds,
  toggleVideoPlayback,
} from './lib/video-playback-controls';

export { VIDEO_SEEK_STEP_SEC, VOLUME_STEP } from './lib/constants';

export {
  registerSheetTimeCarveHandler,
  requestSheetTimeCarve,
} from './lib/sheet-time-carve-bridge';
