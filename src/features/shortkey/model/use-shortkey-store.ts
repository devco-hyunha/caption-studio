import { create } from 'zustand';
import type { ShortkeyStore } from '../types';
import { DEFAULT_SHEET_SHORTKEY_MASKS } from './default-sheet-shortkey-masks';
import { normalizeMask } from '../lib/shortcuts';

const useShortkeyStore = create<ShortkeyStore>((set) => ({
	masks: { ...DEFAULT_SHEET_SHORTKEY_MASKS },

	setMask: (id, mask) => {
		set((state) => ({
			masks: {
				...state.masks,
				[id]: normalizeMask(mask),
			},
		}));
	},

	resetMasks: () => {
		set({ masks: { ...DEFAULT_SHEET_SHORTKEY_MASKS } });
	},
}));

export { useShortkeyStore };
