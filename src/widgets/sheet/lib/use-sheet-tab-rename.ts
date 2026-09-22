import type { ChangeEvent, FocusEvent, KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { isValidTabName } from '@/entities/subtitle-sheet';
import type { UseSheetTabRenameParams, UseSheetTabRenameResult } from '../types';

/** 탭 rename 입력 최소 너비(문자 수 기준) */
const RENAME_INPUT_MIN_CHARS = 6;

const useSheetTabRename = ({
	tabs,
	onRenameTab,
}: UseSheetTabRenameParams): UseSheetTabRenameResult => {
	const [renamingIndex, setRenamingIndex] = useState<number | null>(null);
	const [draftName, setDraftName] = useState('');
	const [isDraftInvalid, setIsDraftInvalid] = useState(false);
	const renameInputRef = useRef<HTMLInputElement>(null);
	const skipRenameBlurRef = useRef(false);

	useEffect(() => {
		if (renamingIndex == null) return;

		// 메뉴 closeAutoFocus 이후 프레임에서 포커스·전체선택
		const frameId = window.requestAnimationFrame(() => {
			renameInputRef.current?.focus();
			renameInputRef.current?.select();
			skipRenameBlurRef.current = false;
		});

		return () => window.cancelAnimationFrame(frameId);
	}, [renamingIndex]);

	const isDuplicateName = (index: number, name: string) =>
		tabs.some((tab, tabIndex) => tabIndex !== index && tab.name === name);

	const validateDraft = (index: number, name: string) => {
		const trimmed = name.trim();
		return trimmed !== '' && isValidTabName(trimmed) && !isDuplicateName(index, trimmed);
	};

	const handleCancelRename = () => {
		skipRenameBlurRef.current = false;
		setRenamingIndex(null);
		setDraftName('');
		setIsDraftInvalid(false);
	};

	const handleBeginRename = (index: number) => {
		skipRenameBlurRef.current = true;
		setRenamingIndex(index);
		setDraftName(tabs[index]?.name ?? '');
		setIsDraftInvalid(false);
	};

	const handleCommitRename = (index: number) => {
		const trimmed = draftName.trim();
		if (!validateDraft(index, trimmed)) {
			setIsDraftInvalid(true);
			renameInputRef.current?.focus();
			renameInputRef.current?.select();
			return;
		}

		const didRename = onRenameTab?.(index, trimmed) ?? false;
		if (!didRename) {
			setIsDraftInvalid(true);
			renameInputRef.current?.focus();
			renameInputRef.current?.select();
			return;
		}

		handleCancelRename();
	};

	const handleDraftChange = (event: ChangeEvent<HTMLInputElement>, index: number) => {
		const nextName = event.target.value;
		setDraftName(nextName);
		setIsDraftInvalid(!validateDraft(index, nextName));
	};

	const handleDraftKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			handleCommitRename(index);
			return;
		}
		if (event.key === 'Escape') {
			event.preventDefault();
			handleCancelRename();
		}
	};

	const handleDraftBlur = (_event: FocusEvent<HTMLInputElement>, index: number) => {
		if (skipRenameBlurRef.current) return;

		const trimmed = draftName.trim();
		if (validateDraft(index, trimmed)) {
			onRenameTab?.(index, trimmed);
		}
		handleCancelRename();
	};

	const renameInputSize = Math.max(
		RENAME_INPUT_MIN_CHARS,
		draftName.length || RENAME_INPUT_MIN_CHARS,
	);

	return {
		renamingIndex,
		draftName,
		isDraftInvalid,
		renameInputRef,
		renameInputSize,
		handleBeginRename,
		handleDraftChange,
		handleDraftKeyDown,
		handleDraftBlur,
		isRenaming: renamingIndex != null,
	};
};

export { useSheetTabRename, RENAME_INPUT_MIN_CHARS };
