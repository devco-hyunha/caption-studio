import { useSheetStore } from '@/entities/subtitle-sheet';
import { useSheetSessionStore } from '@/features/sheet-session';
import { convertSheetTimelines } from '@/features/subtitle-io';
import { rebuildVideoTimeSlotsFromActiveSheet } from '@/features/video-sync';
import type { SheetFormat } from '../types';
import { writeStoredSheetFormat } from './sheet-format-storage';

/** SMI/SRT 버튼 — 모든 자막 탭 timelines 변환 · 전 탭 history clear · format 영속 */
const applySheetFormatChange = (from: SheetFormat, to: SheetFormat) => {
	if (from === to) return;

	const session = useSheetSessionStore.getState();
	session.closeSearchPanel();

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

	// 전 탭 변환이므로 `/` 활성만 clear와 달리 전 탭 reset (리뷰 H1)
	const { sheets, active } = useSheetStore.getState();
	session.resetForSheets(sheets.length, active);

	writeStoredSheetFormat(to);
	rebuildVideoTimeSlotsFromActiveSheet();
};

export { applySheetFormatChange };
