export type {
	VideoActiveIndices,
	VideoSyncActions,
	VideoSyncState,
	VideoSyncStore,
} from './types';

export { useVideoSyncStore } from './model/use-video-sync-store';

export {
	rebuildVideoTimeSlotsFromActiveSheet,
	refreshActiveIndicesFromPlayback,
	syncVideoTimeSlotsAfterInsert,
	syncVideoTimeSlotsAfterRemove,
	syncVideoTimeSlotsAfterRowTimeEdit,
} from './lib/sync-time-slots-with-active-sheet';

export {
	sameIndices,
	syncPlaybackFromPlayerTime,
} from './lib/sync-playback-from-player-time';

export type {
	VideoPlayerControlApi,
	VideoPlayerSeekApi,
} from './lib/player-bridge';
export {
	getVideoPlayerControlApi,
	getVideoPlayerSeekApi,
	registerVideoPlayerControlApi,
	registerVideoPlayerSeekApi,
} from './lib/player-bridge';

export {
	resolveStartMs,
	seekPlayerToNextCue,
	seekPlayerToPrevCue,
	seekPlayerToRowIndex,
} from './lib/seek-player-to-row';

export {
	adjustVideoVolume,
	seekVideoBySeconds,
	toggleVideoPlayback,
} from './lib/video-playback-controls';
