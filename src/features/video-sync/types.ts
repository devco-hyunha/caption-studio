import type { Fn } from '@/shared/types/fn';
import type { SheetTimelineItem, TimeSlotIndex } from '@/entities/subtitle-sheet';

export interface VideoSyncState {
  /** 분 버킷 인덱스 · 비영속 */
  timeSlots: TimeSlotIndex;
  /** 마지막 timeSearchAll 결과 — 재생 시각에 활성인 행 index (겹침 포함) */
  activeIndices: number[];
}

export interface VideoSyncActions {
  /** import · 탭 전환 · timelines 통째 교체 */
  rebuildTimeSlots: (timelines: readonly SheetTimelineItem[]) => void;
  /** 행 시간 수정 · 해당 행 replace */
  syncRowTimeSlot: (rowIndex: number, timelines: readonly SheetTimelineItem[]) => void;
  /** 행 삽입 반영 후 timelines */
  insertRowTimeSlot: (atIndex: number, timelines: readonly SheetTimelineItem[]) => void;
  /** 행 삭제 (삭제 전 index) */
  removeRowTimeSlot: (atIndex: number) => void;
  /** onProgress 등에서 활성 행 갱신 */
  setActiveIndices: (indices: number[]) => void;
  clearActiveIndices: Fn<void>;
  reset: Fn<void>;
}

export type VideoSyncStore = VideoSyncState & VideoSyncActions;

/** VideoPlayer가 등록하는 제어 API (shortkey·오버레이·컨트롤 공용) */
export interface VideoPlayerControlApi {
  /** 성공 시 true (미디어 미준비 등이면 false) */
  seekTo: (seconds: number) => boolean;
  getCurrentTime: Fn<number>;
  toggle: Fn<void>;
  setVolume: (volume: number) => void;
  getVolume: Fn<number>;
}
