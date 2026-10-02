import { describe, expect, it } from 'vitest';
import {
	createEmptyTimeline,
	fillDefaultTimes,
	insertTimelineAfter,
	insertTimelineAt,
	removeTimelineAt,
} from './sheet-mutate';
import type { SheetTimelineItem } from '../types';

const row = (partial: Partial<SheetTimelineItem> = {}): SheetTimelineItem => ({
	start: 0,
	end: 0,
	text: '',
	memo: '',
	...partial,
});

describe('fillDefaultTimes', () => {
	it('srt: start/end가 0이면 neighbor.end를 채운다', () => {
		expect(fillDefaultTimes(row(), row({ start: 1000, end: 2000 }), 'srt')).toEqual(
			row({ start: 2000, end: 2000 }),
		);
	});

	it('smi: start가 0이면 neighbor.start를 채운다', () => {
		expect(fillDefaultTimes(row(), row({ start: 1500, end: 0 }), 'smi')).toEqual(
			row({ start: 1500 }),
		);
	});
});

describe('insertTimelineAfter', () => {
	it('현재 행 뒤에 빈 행을 넣고 인덱스를 반환한다', () => {
		const timelines = [
			row({ text: 'a', start: 100, end: 200 }),
			row({ text: 'b', start: 1000, end: 2000 }),
		];
		const result = insertTimelineAfter(timelines, 0, 'srt');
		expect(result.insertIndex).toBe(1);
		expect(result.timelines).toHaveLength(3);
		expect(result.timelines[1]?.text).toBe('');
		// insertIndex === lastIndexBefore → neighbor = 이전 행(a)
		expect(result.timelines[1]?.start).toBe(200);
		expect(result.timelines[1]?.end).toBe(200);
	});

	it('마지막 행 뒤에는 이전 행을 neighbor로 쓴다', () => {
		const timelines = [row({ start: 100, end: 200 }), row({ start: 300, end: 400 })];
		const result = insertTimelineAfter(timelines, 1, 'srt');
		expect(result.insertIndex).toBe(2);
		expect(result.timelines[2]?.start).toBe(400);
		expect(result.timelines[2]?.end).toBe(400);
	});
});

describe('insertTimelineAt', () => {
	it('지정 인덱스에 삽입한다', () => {
		const timelines = [row({ text: 'a' }), row({ text: 'b' })];
		const next = insertTimelineAt(timelines, 1, createEmptyTimeline(), 'smi');
		expect(next).toHaveLength(3);
		expect(next[1]?.text).toBe('');
	});
});

describe('removeTimelineAt', () => {
	it('행을 삭제하고 focusRow를 클램프한다', () => {
		const timelines = [row({ text: 'a' }), row({ text: 'b' }), row({ text: 'c' })];
		expect(removeTimelineAt(timelines, 2)).toEqual({
			timelines: [row({ text: 'a' }), row({ text: 'b' })],
			focusRow: 1,
			cleared: false,
		});
	});

	it('마지막 1행이면 빈 행으로 교체한다', () => {
		expect(removeTimelineAt([row({ text: 'only' })], 0)).toEqual({
			timelines: [createEmptyTimeline()],
			focusRow: 0,
			cleared: true,
		});
	});

	it('범위 밖이면 null', () => {
		expect(removeTimelineAt([row()], 3)).toBeNull();
	});
});
