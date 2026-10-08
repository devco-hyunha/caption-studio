import { useSheetStore } from '@/entities/subtitle-sheet';
import { getVideoPlayerSeekApi } from './player-bridge';
import { syncPlaybackFromPlayerTime } from './sync-playback-from-player-time';
import { useVideoSyncStore } from '../model/use-video-sync-store';

const readActiveTimelines = () => {
	const { sheets, active } = useSheetStore.getState();
	return sheets[active]?.timelines ?? [];
};

/** 슬롯 변경 후 현재 재생 시각으로 activeIndices 재동기화 (일시정지 포함) */
const refreshActiveIndicesFromPlayback = () => {
	const api = getVideoPlayerSeekApi();
	const seconds = api?.getCurrentTime();
	if (seconds == null || !Number.isFinite(seconds)) {
		useVideoSyncStore.getState().clearActiveIndices();
		return;
	}
	syncPlaybackFromPlayerTime(seconds);
};

/** 탭 전환 · import · undo/redo · 대량 교체 */
const rebuildVideoTimeSlotsFromActiveSheet = () => {
	useVideoSyncStore.getState().rebuildTimeSlots(readActiveTimelines());
	refreshActiveIndicesFromPlayback();
};

/**
 * start/end 셀 수정 후.
 * 이전 행 열린 end가 다음 start에 의존하므로 row와 row-1을 갱신한다.
 */
const syncVideoTimeSlotsAfterRowTimeEdit = (rowIndex: number) => {
	const timelines = readActiveTimelines();
	const store = useVideoSyncStore.getState();
	store.syncRowTimeSlot(rowIndex, timelines);
	if (rowIndex > 0) store.syncRowTimeSlot(rowIndex - 1, timelines);
	refreshActiveIndicesFromPlayback();
};

/** 행 삽입 반영 후 (`insertIndex` = 새 행) */
const syncVideoTimeSlotsAfterInsert = (insertIndex: number) => {
	const timelines = readActiveTimelines();
	const store = useVideoSyncStore.getState();
	store.insertRowTimeSlot(insertIndex, timelines);
	if (insertIndex > 0) store.syncRowTimeSlot(insertIndex - 1, timelines);
	refreshActiveIndicesFromPlayback();
};

/** 행 삭제 반영 후 (`removedIndex` = 삭제 전 index). 마지막 1행 clear는 rebuild 사용 */
const syncVideoTimeSlotsAfterRemove = (removedIndex: number) => {
	const store = useVideoSyncStore.getState();
	store.removeRowTimeSlot(removedIndex);
	const timelines = readActiveTimelines();
	if (removedIndex > 0) store.syncRowTimeSlot(removedIndex - 1, timelines);
	refreshActiveIndicesFromPlayback();
};

export {
	rebuildVideoTimeSlotsFromActiveSheet,
	refreshActiveIndicesFromPlayback,
	syncVideoTimeSlotsAfterInsert,
	syncVideoTimeSlotsAfterRemove,
	syncVideoTimeSlotsAfterRowTimeEdit,
};
