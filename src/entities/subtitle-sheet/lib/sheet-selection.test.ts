import { describe, expect, it } from 'vitest';
import {
	enterMultipleSelection,
	exitMultipleSelection,
	toggleSelectedRow,
} from './sheet-selection';

describe('toggleSelectedRow', () => {
	it('토글: 미선택 행을 추가하고 start를 갱신한다', () => {
		expect(toggleSelectedRow({ selectedRows: [], multipleStart: null }, 2, false)).toEqual({
			multipleStart: 2,
			selectedRows: [2],
		});
	});

	it('토글: 이미 선택된 행을 제거한다', () => {
		expect(
			toggleSelectedRow({ selectedRows: [1, 2, 3], multipleStart: 1 }, 2, false),
		).toEqual({
			multipleStart: 2,
			selectedRows: [1, 3],
		});
	});

	it('Shift: start~row 구간을 합집합으로 추가한다', () => {
		expect(
			toggleSelectedRow({ selectedRows: [1], multipleStart: 1 }, 4, true),
		).toEqual({
			multipleStart: 1,
			selectedRows: [1, 2, 3, 4],
		});
	});

	it('Shift: 이미 포함된 행은 건너뛴다', () => {
		expect(
			toggleSelectedRow({ selectedRows: [1, 3], multipleStart: 1 }, 3, true),
		).toEqual({
			multipleStart: 1,
			selectedRows: [1, 3, 2],
		});
	});
});

describe('enterMultipleSelection / exitMultipleSelection', () => {
	it('진입 시 현재 행만 선택한다', () => {
		expect(enterMultipleSelection(5)).toEqual({
			multipleActive: true,
			multipleStart: 5,
			selectedRows: [5],
		});
	});

	it('종료 시 선택과 start를 비운다', () => {
		expect(exitMultipleSelection()).toEqual({
			multipleActive: false,
			multipleStart: null,
			selectedRows: [],
		});
	});
});
