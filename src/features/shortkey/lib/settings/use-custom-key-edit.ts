import { useEffect, useRef, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { ShortkeyCustomRowProps } from '../../types';
import { useShortkeyStore } from '../../model/store/use-shortkey-store';
import { validateCustomMask } from './custom-mask-validation';
import { convertEventToMask, isImeKeyEvent, normalizeMask } from '@/shared/lib/shortcuts';
import { alert, success } from '@/shared/lib/feedback/feedback';
import { useLocaleStore } from '@/shared/lib/i18n';
import { CODE_MAP, STATUS_MESSAGES, STATUS_SAVED_KEY, STATUS_UNSUPPORTED_KEY } from './constants';

/**
 * 커스텀 키 변경 폼 제어 — focus·keydown 변환·submit 검증.
 * 변경 상태(editing·raw)는 부모 패널 소유(Esc 게이트가 패널 수준), 이 hook는 refs와 핸들러만 노출.
 */
const useCustomKeyEdit = ({
  id,
  editing,
  raw,
  onStartEdit,
  onRawChange,
  onCancelEdit,
}: ShortkeyCustomRowProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const setMask = useShortkeyStore((state) => state.setMask);

  // 변경 UI 노출(editing) 시 input 렌더된 뒤 포커스
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const handleChange = () => {
    if (!editing) {
      onStartEdit();
      return;
    }
    formRef.current?.requestSubmit();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    // Esc는 부모 패널 게이트가 Radix capture에서 처리 — input은 Esc를 raw에 기록하지 않는다
    event.preventDefault();
    const key = (event.key || '').toLowerCase();
    if (key === 'escape') return;

    // IME 조합(공통 가드)·code 없는 키는 unsupported로 일괄 처리 — Esc는 부모 패널 게이트가 처리
    if (isImeKeyEvent(event.nativeEvent) || !event.code) {
      alert(useLocaleStore.getState().t(STATUS_UNSUPPORTED_KEY));
      onRawChange('');
      return;
    }
    onRawChange(
      convertEventToMask(
        {
          code: event.code,
          key: event.key,
          ctrlKey: event.ctrlKey,
          altKey: event.altKey,
          shiftKey: event.shiftKey,
          metaKey: event.metaKey,
        },
        CODE_MAP,
      ),
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateCustomMask({
      rawMask: raw,
      masks: useShortkeyStore.getState().masks,
      selfId: id,
    });

    if (validation !== 'ok') {
      alert(useLocaleStore.getState().t(STATUS_MESSAGES[validation]));
      inputRef.current?.focus();
      return;
    }

    setMask(id, normalizeMask(raw));
    onCancelEdit();
    success(useLocaleStore.getState().t(STATUS_SAVED_KEY));
  };

  return { inputRef, formRef, handleChange, handleKeyDown, handleSubmit };
};

export { useCustomKeyEdit };
