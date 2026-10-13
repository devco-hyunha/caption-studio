import { useSheetSearchStore, type SearchHit } from '@/features/sheet-search';
import { getEditableColumn } from '../move/sheet-move';
import type { UseSheetSearchActionsParams, UseSheetSearchActionsResult } from '../../types';

/**
 * 시트 검색 동작 API — 히트 셀 키·점프·패널 close.
 * 검색 매치·경계 로직은 feature(`sheet-search`), 이 훅은 시트 포커스 API와 조립만 한다.
 */
const useSheetSearchActions = ({
  format,
  rows,
  isEditing,
  endEdit,
  applyFocus,
}: UseSheetSearchActionsParams): UseSheetSearchActionsResult => {
  const searchHits = useSheetSearchStore((state) => state.searchHits);

  /** 히트 col(editable 인덱스) → 시트 열 id. 렌더에 없는 행/열은 제외 */
  const searchHitKeys = (() => {
    const keys = new Set<string>();
    for (const hit of searchHits) {
      const column = getEditableColumn(format, hit.col);
      if (!column || !rows[hit.row]) continue;
      keys.add(`${hit.row}:${column}`);
    }
    return keys;
  })();

  /** 히트 셀로 점프 — 에딧 중이면 커밋 후 포커스 */
  const handleSearchJump = (hit: SearchHit) => {
    if (isEditing()) endEdit(true);
    const column = getEditableColumn(format, hit.col);
    if (!column) return;
    applyFocus(hit.row, column);
  };

  /** `/` — 검색 패널 토글 */
  const toggleSearch = () => {
    useSheetSearchStore.getState().toggleSearchPanel();
  };

  return { searchHitKeys, handleSearchJump, toggleSearch };
};

export { useSheetSearchActions };
