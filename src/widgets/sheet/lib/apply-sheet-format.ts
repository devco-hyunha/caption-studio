import { useSheetStore } from '@/entities/subtitle-sheet';
import { useSheetSessionStore } from '@/features/sheet-session';
import { convertSheetTimelines } from '@/features/subtitle-io';
import type { SheetFormat } from '../types';

/** SMI/SRT 버튼 — 모든 자막 탭 timelines 변환 */
const applySheetFormatChange = (from: SheetFormat, to: SheetFormat) => {
	if (from === to) return;

	useSheetSessionStore.getState().closeSearchPanel();

	useSheetStore.setState((state) => ({
		...state,
		sheets: state.sheets.map((sheet) => ({
			...sheet,
			timelines: convertSheetTimelines(sheet.timelines, from, to),
			selectedRows: [],
			multipleActive: false,
			multipleStart: null,
		})),
	}));
};

export { applySheetFormatChange };
