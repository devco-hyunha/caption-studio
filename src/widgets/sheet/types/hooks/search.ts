import type { Fn } from '@/shared/types/fn';
import type { SearchHit } from '@/features/sheet-search';
import type { ApplyFocusOptions, SheetColumnId, SheetFormat, SheetRowView } from '../primitives';

/** 검색 훅 params — 포커스·에딧·점프 API */
export interface UseSheetSearchActionsParams {
  format: SheetFormat;
  rows: SheetRowView[];
  /** shortkey용 — `mode === 'edit'` 동기 판별 */
  isEditing: Fn<boolean>;
  endEdit: (commit?: boolean) => void;
  applyFocus: (rowIndex: number, column: SheetColumnId, options?: ApplyFocusOptions) => void;
}

/** 검색 훅 결과 — 패널 점프·패널 토글·히트 셀 키 */
export interface UseSheetSearchActionsResult {
  /** 검색 히트 셀 키 `"row:columnId"` (editable col 변환 후) */
  searchHitKeys: ReadonlySet<string>;
  /** 히트 셀로 점프 — 에딧 커밋 후 포커스 */
  handleSearchJump: (hit: SearchHit) => void;
  /** `/` — 검색 패널 토글 */
  toggleSearch: Fn<void>;
}
