import { create } from 'zustand';
import {
	insertRowTimeSlot as insertRowIntoSlots,
	rebuildTimeSlotIndex,
	removeRowTimeSlot as removeRowFromSlots,
	syncRowTimeSlot as syncRowIntoSlots,
} from '@/entities/subtitle-sheet';
import type { VideoSyncStore } from '../types';

const createEmptySlots = () => rebuildTimeSlotIndex([]);

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
		const timeSlots = get().timeSlots;
		syncRowIntoSlots(timeSlots, rowIndex, timelines);
		set({ timeSlots });
	},

	insertRowTimeSlot: (atIndex, timelines) => {
		const timeSlots = get().timeSlots;
		insertRowIntoSlots(timeSlots, atIndex, timelines);
		set({ timeSlots });
	},

	removeRowTimeSlot: (atIndex) => {
		const timeSlots = get().timeSlots;
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
