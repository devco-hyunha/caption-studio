import { SheetSearchPanel } from '@/features/sheet-search';
import type { SheetToolbarSearchProps } from '../../../types';

/** toolbar 검색 섹션 — SheetSearchPanel 조립 */
const ToolbarSearch = ({ format, timelines, rows, onJump }: SheetToolbarSearchProps) => (
  <SheetSearchPanel format={format} timelines={timelines} rows={rows} onJump={onJump} />
);

export { ToolbarSearch };
