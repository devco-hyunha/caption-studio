import type { ChangeEvent, FocusEvent, KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { isValidTabName } from '@/entities/subtitle-sheet';
import { RENAME_INPUT_MIN_CHARS } from '../constants';
import type { SheetTabView } from '../../types';
import type { UseSheetTabRenameParams, UseSheetTabRenameResult } from '../../types';

/** 다른 탭에 동명이 있는지 — index 제외, tabs 인자 순수 함수 */
const isDuplicateName = (tabs: readonly SheetTabView[], index: number, name: string): boolean =>
  tabs.some((tab, tabIndex) => tabIndex !== index && tab.name === name);

/** trim 후 유효·비중복 검증 — tabs 인자 순수 함수 */
const validateDraft = (tabs: readonly SheetTabView[], index: number, name: string): boolean => {
  const trimmed = name.trim();
  return trimmed !== '' && isValidTabName(trimmed) && !isDuplicateName(tabs, index, trimmed);
};

/** 시트 탭 이름 변경 — Enter 확정 / Esc·blur 취소 */
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

  /** 이름 확정 — trim 후 validate. 실패하면 입력에 포커스 유지 */
  const handleCommitRename = (index: number) => {
    const trimmed = draftName.trim();
    if (!validateDraft(tabs, index, trimmed)) {
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
    setIsDraftInvalid(!validateDraft(tabs, index, nextName));
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
    if (validateDraft(tabs, index, trimmed)) {
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

export { useSheetTabRename };
