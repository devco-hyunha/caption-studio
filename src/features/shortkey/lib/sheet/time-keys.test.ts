import { describe, expect, it, vi } from 'vitest';
import { createShortcuts } from '@/shared/lib/shortcuts';
import type { SheetShortkeyActions } from '../../types';
import { registerSheetTimeKeys } from './time-keys';

const baseActions = (overrides: Partial<SheetShortkeyActions> = {}): SheetShortkeyActions => ({
	moveTabNext: vi.fn(),
	moveTabPrev: vi.fn(),
	moveRowPrev: vi.fn(),
	moveRowNext: vi.fn(),
	moveColPrev: vi.fn(),
	moveColNext: vi.fn(),
	movePagePrev: vi.fn(),
	movePageNext: vi.fn(),
	isEditing: () => false,
	isTextTarget: () => false,
	hasFocus: () => true,
	isMultiple: () => false,
	beginEdit: vi.fn(),
	cancelEdit: vi.fn(),
	beginEditFromTyping: vi.fn(),
	insertEditorLineBreak: vi.fn(),
	toggleMultiple: vi.fn(),
	toggleRowSelect: vi.fn(),
	insertRow: vi.fn(),
	removeRow: vi.fn(),
	applyTextFormat: vi.fn(),
	clearCell: vi.fn(),
	clipCut: vi.fn(),
	clipCopy: vi.fn(),
	clipPaste: vi.fn(),
	isTimeTarget: () => true,
	timePlus: vi.fn(),
	timeMinus: vi.fn(),
	toggleSearch: vi.fn(),
	undo: vi.fn(),
	redo: vi.fn(),
	...overrides,
});

const dispatch = (init: KeyboardEventInit & { code: string }) => {
	const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
	document.dispatchEvent(event);
	return event;
};

const runTime = (
	actions: SheetShortkeyActions,
	run: (shortcuts: ReturnType<typeof createShortcuts>) => void,
) => {
	const shortcuts = createShortcuts();
	registerSheetTimeKeys(shortcuts, () => actions);
	shortcuts.start();
	run(shortcuts);
	shortcuts.stop();
	shortcuts.removeAll();
};

describe('registerSheetTimeKeys', () => {
	it('Ctrl+Plus(Equal)·Ctrl+Plus(NumpadAdd)는 timePlus, preventDefault', () => {
		const timePlus = vi.fn();
		const actions = baseActions({ timePlus });

		runTime(actions, () => {
			const equal = dispatch({ code: 'Equal', key: '+', ctrlKey: true });
			expect(timePlus).toHaveBeenCalledTimes(1);
			expect(equal.defaultPrevented).toBe(true);

			dispatch({ code: 'NumpadAdd', key: '+', ctrlKey: true });
			expect(timePlus).toHaveBeenCalledTimes(2);
		});
	});

	it('Ctrl+Minus(Minus)·Ctrl+Minus(NumpadSubtract)는 timeMinus', () => {
		const timeMinus = vi.fn();
		const actions = baseActions({ timeMinus });

		runTime(actions, () => {
			dispatch({ code: 'Minus', key: '-', ctrlKey: true });
			expect(timeMinus).toHaveBeenCalledTimes(1);

			dispatch({ code: 'NumpadSubtract', key: '-', ctrlKey: true });
			expect(timeMinus).toHaveBeenCalledTimes(2);
		});
	});

	it('time 타깃·다중 분기는 actions 훅에 위임 — registrar는 timePlus/timeMinus만 호출', () => {
		const timePlus = vi.fn();
		const actions = baseActions({ timePlus, isTimeTarget: () => false, isMultiple: () => true });

		runTime(actions, () => {
			dispatch({ code: 'Equal', key: '+', ctrlKey: true });
			// 분기(다중 일괄 vs time 셀)는 훅에서 — registrar는 actions만 부른다
			expect(timePlus).toHaveBeenCalledTimes(1);
		});
	});

	it('Ctrl 없이 Equal/Minus는 무반응', () => {
		const timePlus = vi.fn();
		const actions = baseActions({ timePlus });

		runTime(actions, () => {
			dispatch({ code: 'Equal', key: '=' });
			dispatch({ code: 'Minus', key: '-' });
			expect(timePlus).not.toHaveBeenCalled();
		});
	});
});
