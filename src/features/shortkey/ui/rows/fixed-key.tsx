import { maskToPrimaryLabel } from '@/shared/lib/shortcuts';
import { useT } from '@/shared/lib/i18n';
import type { ShortkeyFixedRowProps } from '../../types';
import { SHORTKEY_LABEL_KEYS } from '../../model/keys/labels';
import { useShortkeyStore } from '../../model/store/use-shortkey-store';

/** 고정키 항목 — kbd 라벨만, 변경 불가 */
const FixedKeyRow = ({ id }: ShortkeyFixedRowProps) => (
  <li className="flex items-center justify-between gap-4 py-1">
    <LabelKbd id={id} />
  </li>
);

/** label + kbd 라벨 행 — 고정·커스텀 행 공유 서브컴포넌트 */
const LabelKbd = ({ id }: ShortkeyFixedRowProps) => {
  const label = useT(SHORTKEY_LABEL_KEYS[id]);
  const mask = useShortkeyStore((state) => state.masks[id]);

  return (
    <>
      <span className="text-sm">{label}</span>
      <kbd className="bg-muted rounded px-2 py-1 text-sm">{maskToPrimaryLabel(mask)}</kbd>
    </>
  );
};

export { FixedKeyRow, LabelKbd };
