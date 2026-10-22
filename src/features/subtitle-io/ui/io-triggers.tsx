import { useRef, useState, type MouseEvent } from 'react';
import { useT } from '@/shared/lib/i18n';
import { Button } from '@/shared/ui/button';
import { SubtitleExportModal } from './export-modal';
import { SubtitleImportModal } from './import-modal';
import type { SubtitleIoProps } from '../types';

/**
 * I/O 모달 트리거 — 가져오기/내보내기 버튼 2개 + 모달 2개 조립.
 * 열림 상태·prevFocusRef는 트리거가 소유 (DialogShell onCloseAutoFocus 복원).
 */
const IoTriggers = ({
  sheetFormat,
  timelines,
  workbookTabs,
  activeIndex,
  onImported,
  onSmiMetaChange,
}: SubtitleIoProps) => {
  const importRef = useRef<HTMLElement | null>(null);
  const exportRef = useRef<HTMLElement | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const importLabel = useT('io.import');
  const exportLabel = useT('io.export');

  const handleImportOpen = (event: MouseEvent<HTMLButtonElement>) => {
    importRef.current = event.currentTarget;
    setImportOpen(true);
  };

  const handleExportOpen = (event: MouseEvent<HTMLButtonElement>) => {
    exportRef.current = event.currentTarget;
    setExportOpen(true);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label={importLabel}
        onClick={handleImportOpen}
      >
        {importLabel}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label={exportLabel}
        onClick={handleExportOpen}
      >
        {exportLabel}
      </Button>
      <SubtitleImportModal
        open={importOpen}
        onOpenChange={setImportOpen}
        sheetFormat={sheetFormat}
        onImported={onImported}
        prevFocusRef={importRef}
      />
      <SubtitleExportModal
        open={exportOpen}
        onOpenChange={setExportOpen}
        sheetFormat={sheetFormat}
        timelines={timelines}
        workbookTabs={workbookTabs}
        activeIndex={activeIndex}
        onSmiMetaChange={onSmiMetaChange}
        prevFocusRef={exportRef}
      />
    </>
  );
};

export { IoTriggers };
