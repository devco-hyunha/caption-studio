import { useMemo } from 'react';
import { EMPTY_TIMELINES, useSheetStore } from '@/entities/subtitle-sheet';
import { useT } from '@/shared/lib/i18n';
import { cn } from '@/shared/lib/utils';
import type { SheetBodyToolbarProps } from '../../../types';
import { ToolbarButtons } from './toolbar-buttons';
import { ToolbarFormat } from './toolbar-format';
import { ToolbarIo } from './toolbar-io';
import { ToolbarSearch } from './toolbar-search';

/**
 * 시트 상단 툴바 — 다중 선택·행 CRUD·undo/redo·검색 패널·I/O 패널.
 * timelines·workbookTabs는 툴바가 스토어에서 생성, 점프·import 콜백은 body 소유.
 */
const SheetBodyToolbar = ({
  format,
  rows,
  actions,
  onImported,
  className,
}: SheetBodyToolbarProps) => {
  const toolbarAria = useT('toolbar.aria');
  const timelines = useSheetStore(
    (state) => state.sheets[state.active]?.timelines ?? EMPTY_TIMELINES,
  );
  const storeSheets = useSheetStore((state) => state.sheets);
  const activeIndex = useSheetStore((state) => state.active);
  const workbookTabs = useMemo(
    () =>
      storeSheets.map((sheet) => ({
        name: sheet.name,
        timelines: sheet.timelines,
        smiName: sheet.smiName,
        smiLang: sheet.smiLang,
      })),
    [storeSheets],
  );
  const setSheetSmiMeta = useSheetStore((state) => state.setSheetSmiMeta);

  return (
    <div
      data-slot="sheet-body-toolbar"
      role="toolbar"
      aria-label={toolbarAria}
      className={cn(
        'flex shrink-0 flex-wrap items-center gap-2 border-b border-neutral-200 bg-neutral-50 px-2 py-1.5',
        className,
      )}
    >
      <ToolbarButtons actions={actions} />
      <ToolbarFormat actions={actions} />
      <ToolbarSearch
        format={format}
        timelines={timelines}
        rows={rows}
        onJump={actions.handleSearchJump}
      />
      <ToolbarIo
        sheetFormat={format}
        timelines={timelines}
        workbookTabs={workbookTabs}
        activeIndex={activeIndex}
        onImported={onImported}
        onSmiMetaChange={setSheetSmiMeta}
      />
    </div>
  );
};

export { SheetBodyToolbar };
