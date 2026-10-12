import type { SheetTextFormatCommand } from '@/features/shortkey';
import { useSheetStore } from '@/entities/subtitle-sheet';
import type { SheetTimelineItem } from '@/entities/subtitle-sheet';
import type {
	SheetColumnId,
	UseSheetClipActionsParams,
	UseSheetClipActionsResult,
} from '../../types';
import { applyTextFormatCommand } from '../apply-text-format';
import { isMultipleActive } from '../is-multiple-active';

/** clip 대상 열 — text/memo만 (time 열은 클립·서식 대상 아님) */
const isTextMemoColumn = (column: SheetColumnId | null | undefined): column is 'text' | 'memo' =>
	column === 'text' || column === 'memo';

const readTimelineText = (
	timeline: SheetTimelineItem | undefined,
	column: SheetColumnId,
): string | null => {
	if (!timeline || !isTextMemoColumn(column)) return null;
	if (column === 'text') return typeof timeline.text === 'string' ? timeline.text : '';
	return typeof timeline.memo === 'string' ? timeline.memo : '';
};

/**
 * 시트 clip 동작 API — 서식(BIU)·clear·클립보드.
 * 에딧 중 서식은 에디터 execCommand, 다중 선택은 선택 행 text 일괄, 단건은 스토어 갱신.
 */
const useSheetClipActions = ({
	currentRowIndex,
	currentColumn,
	isEditing,
	isTextTarget,
	inputRef,
	onUpdateCell,
	closeSearchPanel,
}: UseSheetClipActionsParams): UseSheetClipActionsResult => {
	/** 포커스 셀 text/memo 커밋 — 대상 없으면 false */
	const commitFocusedText = (value: string): boolean => {
		if (currentRowIndex == null || !isTextMemoColumn(currentColumn)) return false;
		return onUpdateCell(currentRowIndex, currentColumn, value);
	};

	/** 포커스 셀 text/memo 값 — 대상 없으면 null */
	const readFocusedText = (): string | null => {
		if (currentRowIndex == null || !isTextMemoColumn(currentColumn)) return null;
		const sheet = useSheetStore.getState().sheets[useSheetStore.getState().active];
		return readTimelineText(sheet?.timelines[currentRowIndex], currentColumn);
	};

	const applyTextFormat = (command: SheetTextFormatCommand) => {
		// 서식·클립 직전 검색 패널 닫기
		closeSearchPanel();

		// 에딧 중 — 현재 에디터에 execCommand (selection 유지)
		if (isEditing()) {
			inputRef.current?.focus();
			document.execCommand(command, false);
			return;
		}

		const store = useSheetStore.getState();
		const sheet = store.sheets[store.active];
		if (!sheet) return;

		// 다중 선택 — 선택 행 text 일괄 (multiClip parity)
		if (sheet.multipleActive) {
			useSheetStore.getState().updateSelectedTexts((text) => applyTextFormatCommand(text, command));
			return;
		}

		// 단건 clip — text/memo 타깃만
		if (!isTextTarget() || currentRowIndex == null || !isTextMemoColumn(currentColumn)) return;
		const prev = readTimelineText(sheet.timelines[currentRowIndex], currentColumn);
		if (prev == null) return;
		const next = applyTextFormatCommand(prev, command);
		if (next === prev) return;
		onUpdateCell(currentRowIndex, currentColumn, next);
	};

	/** Backspace/Delete — 비에딧·비다중·text 타깃에서만 셀 비우기 */
	const clearCell = () => {
		if (isEditing() || isMultipleActive() || !isTextTarget()) return;
		closeSearchPanel();
		commitFocusedText('');
	};

	const clipCopy = () => {
		if (isEditing() || isMultipleActive() || !isTextTarget()) return;
		closeSearchPanel();
		const value = readFocusedText();
		if (value == null) return;
		void navigator.clipboard?.writeText(value).catch(() => undefined);
	};

	const clipCut = () => {
		if (isEditing() || isMultipleActive() || !isTextTarget()) return;
		closeSearchPanel();
		const value = readFocusedText();
		if (value == null) return;
		void navigator.clipboard?.writeText(value).then(
			() => {
				commitFocusedText('');
			},
			() => undefined,
		);
	};

	const clipPaste = () => {
		if (isEditing() || isMultipleActive() || !isTextTarget()) return;
		closeSearchPanel();
		void navigator.clipboard?.readText().then(
			(text) => {
				commitFocusedText(text);
			},
			() => undefined,
		);
	};

	return { applyTextFormat, clearCell, clipCut, clipCopy, clipPaste };
};

export { useSheetClipActions, isTextMemoColumn, readTimelineText };
