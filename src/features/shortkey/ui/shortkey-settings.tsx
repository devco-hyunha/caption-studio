import { useState } from 'react';
import type { ShortkeySettingsProps, ShortkeyLabelId } from '../types';
import { CUSTOM_SHORTKEY_IDS, FIXED_SHORTKEY_IDS } from '../model/keys/custom-ids';
import { useT } from '@/shared/lib/i18n';
import { DialogShell } from '@/shared/ui/dialog-shell';
import { CustomKeyRow } from './rows/custom-key';
import { FixedKeyRow } from './rows/fixed-key';

/** 단축키 설정 패널 — 커스텀 변경 폼 + 고정 목록(kbd 라벨만). `/edit/settings` 라우트 셸 */
const ShortkeySettings = ({ open, onOpenChange, prevFocusRef }: ShortkeySettingsProps) => {
  const title = useT('shortkey.button');
  const customTitle = useT('shortkey.custom');
  const fixedTitle = useT('shortkey.fixed');

  // 변경 상태는 패널 소유 — Esc 게이트가 Radix capture(Dialog.Content.onEscapeKeyDown)에서 열림
  const [editingId, setEditingId] = useState<ShortkeyLabelId | null>(null);
  const [raw, setRaw] = useState('');

  const startEdit = (id: ShortkeyLabelId) => {
    setEditingId(id);
    setRaw('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setRaw('');
  };

  // Esc: 변경 UI 노출 중 → 변경 취소·팝업 유지. 없음 → dismiss 진행(팝업 닫힘)
  const handleEscapeKeyDown = (event: KeyboardEvent) => {
    if (editingId !== null) {
      event.preventDefault();
      cancelEdit();
    }
  };

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      prevFocusRef={prevFocusRef}
      onEscapeKeyDown={handleEscapeKeyDown}
    >
      <div className="flex flex-col gap-4">
        <section aria-label={customTitle}>
          <h2 className="text-md mb-2 font-bold">{customTitle}</h2>
          <ul>
            {CUSTOM_SHORTKEY_IDS.map((id) => (
              <CustomKeyRow
                key={id}
                id={id}
                editing={editingId === id}
                raw={editingId === id ? raw : ''}
                onStartEdit={() => startEdit(id)}
                onRawChange={setRaw}
                onCancelEdit={cancelEdit}
              />
            ))}
          </ul>
        </section>
        <section aria-label={fixedTitle}>
          <h2 className="text-md mb-2 font-bold">{fixedTitle}</h2>
          <ul>
            {FIXED_SHORTKEY_IDS.map((id) => (
              <FixedKeyRow key={id} id={id} />
            ))}
          </ul>
        </section>
      </div>
    </DialogShell>
  );
};

export { ShortkeySettings };
