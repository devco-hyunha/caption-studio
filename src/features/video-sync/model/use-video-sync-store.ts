import { create } from 'zustand';
import {
  cloneTimeSlotIndex,
  insertRowTimeSlot as insertRowIntoSlots,
  rebuildTimeSlotIndex,
  removeRowTimeSlot as removeRowFromSlots,
  syncRowTimeSlot as syncRowIntoSlots,
} from '@/entities/subtitle-sheet';
import type { VideoSyncStore } from '../types';

const createEmptySlots = () => rebuildTimeSlotIndex([]);

/** 시트 ↔ 플레이어 시간 싱크 스토어 — 분 슬롯 · 활성 행. 비영속 */
const useVideoSyncStore = create<VideoSyncStore>((set, get) => ({
  timeSlots: createEmptySlots(),
  activeIndices: [],

  rebuildTimeSlots: (timelines) => {
    set({
      timeSlots: rebuildTimeSlotIndex(timelines),
      activeIndices: [],
    });
  },

  syncRowTimeSlot: (rowIndex, timelines) => {
    const timeSlots = cloneTimeSlotIndex(get().timeSlots);
    syncRowIntoSlots(timeSlots, rowIndex, timelines);
    set({ timeSlots });
  },

  insertRowTimeSlot: (atIndex, timelines) => {
    const timeSlots = cloneTimeSlotIndex(get().timeSlots);
    insertRowIntoSlots(timeSlots, atIndex, timelines);
    set({ timeSlots });
  },

  removeRowTimeSlot: (atIndex) => {
    const timeSlots = cloneTimeSlotIndex(get().timeSlots);
    removeRowFromSlots(timeSlots, atIndex);
    set({ timeSlots });
  },

  setActiveIndices: (indices) => {
    set({ activeIndices: indices });
  },

  clearActiveIndices: () => {
    set({ activeIndices: [] });
  },

  reset: () => {
    set({
      timeSlots: createEmptySlots(),
      activeIndices: [],
    });
  },
}));

export { useVideoSyncStore };
