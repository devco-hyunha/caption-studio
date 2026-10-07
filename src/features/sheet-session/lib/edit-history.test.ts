import { describe, expect, it } from 'vitest';
import type { HistoryEntry } from '../types';
import {
	addStack,
	canRedo,
	canUndo,
	createEmptyStack,
	insertStackAt,
	nextEntry,
	prevEntry,
	pushEntry,
	removeStackAt,
	resetForSheets,
} from './edit-history';

const entry = (command: HistoryEntry['command'], id: number): HistoryEntry => ({
	command,
	id,
	before: null,
	after: { text: String(id) },
	current: { row: id, col: 0 },
});

describe('pushEntry / prevEntry / nextEntry', () => {
	it('push 후 undo·redo로 entry를 왕복한다', () => {
		let stack = createEmptyStack();
		expect(canUndo(stack)).toBe(false);
		expect(canRedo(stack)).toBe(false);

		stack = pushEntry(stack, entry('update', 0));
		stack = pushEntry(stack, entry('insert', 1));
		expect(stack.index).toBe(1);
		expect(canUndo(stack)).toBe(true);
		expect(canRedo(stack)).toBe(false);

		const undone = prevEntry(stack);
		expect(undone?.entry.id).toBe(1);
		stack = undone!.stack;
		expect(stack.index).toBe(0);
		expect(canRedo(stack)).toBe(true);

		const redone = nextEntry(stack);
		expect(redone?.entry.id).toBe(1);
		stack = redone!.stack;
		expect(stack.index).toBe(1);
	});

	it('중간 undo 뒤 push면 앞부분만 남기고 truncate한다', () => {
		let stack = createEmptyStack();
		stack = pushEntry(stack, entry('update', 0));
		stack = pushEntry(stack, entry('update', 1));
		stack = pushEntry(stack, entry('update', 2));
		stack = prevEntry(stack)!.stack;
		stack = prevEntry(stack)!.stack;
		expect(stack.index).toBe(0);

		stack = pushEntry(stack, entry('remove', 9));
		expect(stack.entries.map((item) => item.id)).toEqual([0, 9]);
		expect(stack.index).toBe(1);
	});
});

describe('resetForSheets / addStack / removeStackAt / insertStackAt', () => {
	it('시트 개수만큼 빈 스택을 만든다', () => {
		const { stacks, activeSheetIndex } = resetForSheets(3, 2);
		expect(stacks).toHaveLength(3);
		expect(activeSheetIndex).toBe(2);
		expect(stacks.every((stack) => stack.index === -1)).toBe(true);
	});

	it('탭 추가·삭제·삽입 시 스택을 맞춘다', () => {
		let stacks = resetForSheets(2, 0).stacks;
		stacks = addStack(stacks);
		expect(stacks).toHaveLength(3);

		stacks = insertStackAt(stacks, 1);
		expect(stacks).toHaveLength(4);

		const removed = removeStackAt(stacks, 1, 2);
		expect(removed.stacks).toHaveLength(3);
		expect(removed.activeSheetIndex).toBe(1);
	});
});
