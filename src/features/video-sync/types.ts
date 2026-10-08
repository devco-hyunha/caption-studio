import type { SheetTimelineItem, TimeSlotIndex } from '@/entities/subtitle-sheet';

/** 재생 시각에 활성인 행 index 목록 (겹침 포함) */
export type VideoActiveIndices = number[];

export interface VideoSyncState {
	/** 분 버킷 인덱스 · 비영속 */
	timeSlots: TimeSlotIndex;
	/** 마지막 timeSearchAll 결과 */
	activeIndices: VideoActiveIndices;
}

export interface VideoSyncActions {
	/** import · 탭 전환 · timelines 통째 교체 */
	rebuildTimeSlots: (timelines: readonly SheetTimelineItem[]) => void;
	/** 행 시간 수정 · 해당 행 replace */
	syncRowTimeSlot: (
		rowIndex: number,
		timelines: readonly SheetTimelineItem[],
	) => void;
	/** 행 삽입 반영 후 timelines */
	insertRowTimeSlot: (
		atIndex: number,
		timelines: readonly SheetTimelineItem[],
	) => void;
	/** 행 삭제 (삭제 전 index) */
	removeRowTimeSlot: (atIndex: number) => void;
	/** onProgress 등에서 활성 행 갱신 */
	setActiveIndices: (indices: VideoActiveIndices) => void;
	clearActiveIndices: () => void;
	reset: () => void;
}

export type VideoSyncStore = VideoSyncState & VideoSyncActions;
