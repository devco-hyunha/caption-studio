import { beforeEach, describe, expect, it } from 'vitest';
import { useSheetStore, type SheetTimelineItem } from '@/entities/subtitle-sheet';
import type { HistoryEntry } from '../types';
import { useSheetHistoryStore } from './use-sheet-history-store';

const resetSheets = (timelines: SheetTimelineItem[]) => {
	useSheetStore.setState({
		active: 0,
		sheets: [
			{
				name: 'sheet1',
				timelines: timelines.map((item) => ({ ...item })),
				smiName: '',
				smiLang: '',
				scroll: 0,
				current: {},
				selectedRows: [],
				multipleActive: false,
				multipleStart: null,
			},
		],
	});
};

const activeTimelines = () => useSheetStore.getState().sheets[0].timelines;

const updateEntry = (
	id: number,
	before: SheetTimelineItem,
	after: SheetTimelineItem,
): HistoryEntry => ({
	command: 'update',
	id,
	before,
	after,
	current: { row: id, col: 0 },
});

describe('useSheetHistoryStore — 스택 소비(U1)', () => {
	beforeEach(() => {
		useSheetHistoryStore.getState().resetForSheets(1, 0);
		resetSheets([
			{ start: 0, end: 1000, text: 'A', memo: '' },
			{ start: 1000, end: 2000, text: 'B', memo: '' },
		]);
	});

	it('pushHistory 후 undo는 스택을 선소비하고 포커스를 반환한다', () => {
		const before = { start: 0, end: 1000, text: 'A', memo: '' };
		const after = { start: 0, end: 1000, text: 'X', memo: '' };
		useSheetStore.getState().patchActiveTimeline(0, after);

		useSheetHistoryStore.getState().pushHistory(updateEntry(0, before, after));
		expect(useSheetHistoryStore.getState().canUndo()).toBe(true);

		const focus = useSheetHistoryStore.getState().undo();
		expect(focus).toEqual({ row: 0, col: 0 });
		expect(activeTimelines()[0]?.text).toBe('A');
		expect(useSheetHistoryStore.getState().canRedo()).toBe(true);
	});

	it('update 가드 실패(현재가 after와 다름)해도 스택은 소비된다 (U1 parity)', () => {
		const before = { start: 0, end: 1000, text: 'A', memo: '' };
		const after = { start: 0, end: 1000, text: 'X', memo: '' };
		useSheetHistoryStore.getState().pushHistory(updateEntry(0, before, after));

		// 현재 시트는 'A' — after와 다르므로 가드 실패
		const focus = useSheetHistoryStore.getState().undo();
		expect(focus).toBeNull();
		// 스택은 소비 → index -1, canUndo false
		expect(useSheetHistoryStore.getState().stacks[0].index).toBe(-1);
		expect(useSheetHistoryStore.getState().canUndo()).toBe(false);
		expect(activeTimelines()[0]?.text).toBe('A');
	});

	it('undo 후 pushHistory는 분지 truncate한다', () => {
		const e1 = updateEntry(0, { text: 'A' }, { text: 'X' });
		const e2 = updateEntry(1, { text: 'B' }, { text: 'Y' });
		useSheetHistoryStore.getState().pushHistory(e1);
		useSheetHistoryStore.getState().pushHistory(e2);
		useSheetHistoryStore.getState().undo();
		expect(useSheetHistoryStore.getState().stacks[0].index).toBe(0);

		const e3 = updateEntry(0, { text: 'X' }, { text: 'Z' });
		useSheetHistoryStore.getState().pushHistory(e3);
		const stack = useSheetHistoryStore.getState().stacks[0];
		expect(stack.entries.map((entry) => entry.id)).toEqual([0, 0]);
		expect(stack.index).toBe(1);
	});

	it('CRUD 스택 동기화 — resetForSheets·add·insert·remove', () => {
		useSheetHistoryStore.getState().pushHistory(updateEntry(0, { text: 'A' }, { text: 'X' }));

		useSheetHistoryStore.getState().addHistoryStack();
		expect(useSheetHistoryStore.getState().stacks).toHaveLength(2);

		useSheetHistoryStore.getState().insertHistoryStackAt(1);
		expect(useSheetHistoryStore.getState().stacks).toHaveLength(3);

		useSheetHistoryStore.getState().removeHistoryStackAt(0);
		const state = useSheetHistoryStore.getState();
		expect(state.stacks).toHaveLength(2);
		expect(state.activeSheetIndex).toBe(0);
	});

	it('탭 전환은 activeSheetIndex를 맞춘다', () => {
		useSheetHistoryStore.getState().resetForSheets(2, 0);
		useSheetHistoryStore.getState().setActiveSheetIndex(1);
		expect(useSheetHistoryStore.getState().activeSheetIndex).toBe(1);
	});
});
