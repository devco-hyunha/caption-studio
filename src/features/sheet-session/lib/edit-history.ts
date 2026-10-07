import type { HistoryEntry, HistoryStack } from '../types';

const createEmptyStack = (): HistoryStack => ({
	entries: [],
	index: -1,
});

const cloneStack = (stack: HistoryStack): HistoryStack => ({
	entries: [...stack.entries],
	index: stack.index,
});

const ensureStackAt = (stacks: HistoryStack[], index: number): HistoryStack[] => {
	if (stacks[index]) return stacks;
	const next = [...stacks];
	next[index] = createEmptyStack();
	return next;
};

const getActiveStack = (
	stacks: readonly HistoryStack[],
	activeSheetIndex: number,
): HistoryStack => {
	const stack = stacks[activeSheetIndex];
	return stack ?? createEmptyStack();
};

const canUndo = (stack: HistoryStack): boolean =>
	stack.entries.length > 0 && stack.index >= 0;

const canRedo = (stack: HistoryStack): boolean =>
	stack.entries.length > 0 && stack.index < stack.entries.length - 1;

/**
 * 활성 스택에 entry push. undo 중간이면 앞부분만 남기고 truncate.
 */
const pushEntry = (stack: HistoryStack, entry: HistoryEntry): HistoryStack => {
	const entries =
		stack.index !== stack.entries.length - 1
			? stack.entries.slice(0, stack.index + 1)
			: [...stack.entries];
	entries.push(entry);
	return {
		entries,
		index: entries.length - 1,
	};
};

/**
 * undo 한 칸 — index 감소 후, 방금 되돌린 entry 반환.
 * 더 없으면 null (index는 -1까지).
 */
const prevEntry = (
	stack: HistoryStack,
): { stack: HistoryStack; entry: HistoryEntry } | null => {
	if (!canUndo(stack)) return null;
	const entry = stack.entries[stack.index];
	if (!entry) return null;
	return {
		entry,
		stack: { ...stack, index: stack.index - 1 },
	};
};

/**
 * redo 한 칸 — index 증가 후, 적용할 entry 반환.
 */
const nextEntry = (
	stack: HistoryStack,
): { stack: HistoryStack; entry: HistoryEntry } | null => {
	if (!canRedo(stack)) return null;
	const nextIndex = stack.index + 1;
	const entry = stack.entries[nextIndex];
	if (!entry) return null;
	return {
		entry,
		stack: { ...stack, index: nextIndex },
	};
};

const clearStack = (): HistoryStack => createEmptyStack();

const resetForSheets = (sheetCount: number, activeIndex = 0): {
	stacks: HistoryStack[];
	activeSheetIndex: number;
} => {
	const count = Math.max(1, sheetCount);
	const stacks = Array.from({ length: count }, () => createEmptyStack());
	const activeSheetIndex = Math.min(Math.max(0, activeIndex), count - 1);
	return { stacks, activeSheetIndex };
};

const setActiveSheetIndex = (
	activeSheetIndex: number,
	stacks: HistoryStack[],
): { activeSheetIndex: number; stacks: HistoryStack[] } => {
	const nextIndex = Math.max(0, activeSheetIndex);
	return {
		activeSheetIndex: nextIndex,
		stacks: ensureStackAt(stacks, nextIndex),
	};
};

const addStack = (stacks: HistoryStack[]): HistoryStack[] => [
	...stacks,
	createEmptyStack(),
];

/** copy 탭 — `index` 위치에 빈 스택 삽입 */
const insertStackAt = (stacks: HistoryStack[], index: number): HistoryStack[] => {
	const clamped = Math.max(0, Math.min(index, stacks.length));
	return [
		...stacks.slice(0, clamped),
		createEmptyStack(),
		...stacks.slice(clamped),
	];
};

const removeStackAt = (
	stacks: HistoryStack[],
	index: number,
	activeSheetIndex: number,
): { stacks: HistoryStack[]; activeSheetIndex: number } => {
	if (stacks.length <= 1) {
		return {
			stacks: [createEmptyStack()],
			activeSheetIndex: 0,
		};
	}
	if (index < 0 || index >= stacks.length) {
		return { stacks, activeSheetIndex };
	}

	const nextStacks = [...stacks.slice(0, index), ...stacks.slice(index + 1)];
	let nextActive = activeSheetIndex;
	if (index < activeSheetIndex) nextActive -= 1;
	else if (index === activeSheetIndex) {
		nextActive = Math.min(activeSheetIndex, nextStacks.length - 1);
	}

	return { stacks: nextStacks, activeSheetIndex: nextActive };
};

export {
	addStack,
	canRedo,
	canUndo,
	clearStack,
	cloneStack,
	createEmptyStack,
	getActiveStack,
	insertStackAt,
	nextEntry,
	prevEntry,
	pushEntry,
	removeStackAt,
	resetForSheets,
	setActiveSheetIndex,
};
