import type { SheetTimelineItem } from '@/entities/subtitle-sheet';
import {
	cloneTimelineSnapshot,
	emptyTimelineSnapshot,
	useSheetSessionStore,
} from '@/features/sheet-session';
import type { SheetColumnId } from '../types';

const isTextMemoColumn = (
	column: SheetColumnId | null | undefined,
): column is 'text' | 'memo' => column === 'text' || column === 'memo';

const readTimelineTextColumn = (
	timeline: SheetTimelineItem | null | undefined,
	column: SheetColumnId,
): string | null => {
	if (!timeline || !isTextMemoColumn(column)) return null;
	if (column === 'text') return typeof timeline.text === 'string' ? timeline.text : '';
	return typeof timeline.memo === 'string' ? timeline.memo : '';
};

interface CommitTimelineTextColumnParams {
	row: number;
	col: number;
	column: 'text' | 'memo';
	value: string;
	before: SheetTimelineItem;
	updateActiveCell: (row: number, column: 'text' | 'memo', value: string) => boolean;
	getAfter: () => SheetTimelineItem | undefined;
	closeSearchPanel: () => void;
}

const commitTimelineTextColumn = ({
	row,
	col,
	column,
	value,
	before,
	updateActiveCell,
	getAfter,
	closeSearchPanel,
}: CommitTimelineTextColumnParams): boolean => {
	closeSearchPanel();
	const beforeSnap = cloneTimelineSnapshot(before);
	const ok = updateActiveCell(row, column, value);
	if (!ok) return false;
	const after = getAfter() ?? emptyTimelineSnapshot();
	useSheetSessionStore.getState().pushHistory({
		command: 'update',
		id: row,
		before: beforeSnap,
		after: cloneTimelineSnapshot(after),
		current: { row, col },
	});
	return true;
};

const writeClipboardText = (value: string) => navigator.clipboard.writeText(value);

const readClipboardText = () => navigator.clipboard.readText();

export {
	commitTimelineTextColumn,
	isTextMemoColumn,
	readClipboardText,
	readTimelineTextColumn,
	writeClipboardText,
};
