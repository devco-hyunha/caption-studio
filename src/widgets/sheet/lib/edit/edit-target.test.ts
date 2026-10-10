import { describe, expect, it } from 'vitest';
import type { SheetRowView } from '../../types';
import { resolveTargetByIndex } from './edit-target';

const ROWS: SheetRowView[] = [
	{ index: 0, starttime: '00:00:00.000', endtime: '00:00:01.000', dur: '00:00:01.000', text: 'A', memo: 'm0', height: 40 },
	{ index: 1, starttime: '00:00:01.000', endtime: '00:00:02.000', dur: '00:00:01.000', text: 'B', memo: 'm1', height: 30 },
	{ index: 2, starttime: '00:00:02.000', endtime: '00:00:03.000', dur: '00:00:01.000', text: 'C', memo: '', height: 40 },
];

describe('edit-target', () => {
	it('resolveTargetByIndex builds target from row heights and column left without DOM', () => {
		const target = resolveTargetByIndex(ROWS, 'smi', 2, 'text');
		expect(target).toEqual({
			rowIndex: 2,
			column: 'text',
			left: 54 + 108 + 73, // index + starttime + dur
			top: 40 + 30, // accumulated heights before row 2
			minWidth: 361,
			minHeight: 40,
			value: 'C',
		});
	});

	it('resolveTargetByIndex returns null for out-of-range row', () => {
		expect(resolveTargetByIndex(ROWS, 'smi', 9, 'text')).toBeNull();
	});

	it('resolveTargetByIndex uses format-specific column left (srt adds endtime)', () => {
		const smi = resolveTargetByIndex(ROWS, 'smi', 0, 'text');
		const srt = resolveTargetByIndex(ROWS, 'srt', 0, 'text');
		expect(smi?.left).toBe(54 + 108 + 73);
		expect(srt?.left).toBe(54 + 108 + 108 + 73);
	});
});
