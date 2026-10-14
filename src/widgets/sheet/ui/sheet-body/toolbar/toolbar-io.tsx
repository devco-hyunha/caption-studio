import { SubtitleIoPanel } from '@/features/subtitle-io';
import type { SheetToolbarIoProps } from '../../../types';

/** toolbar I/O 섹션 — SubtitleIoPanel 조립 */
const ToolbarIo = ({ sheetFormat, timelines, workbookTabs, onImported }: SheetToolbarIoProps) => (
  <SubtitleIoPanel
    sheetFormat={sheetFormat}
    timelines={timelines}
    workbookTabs={workbookTabs}
    onImported={onImported}
  />
);

export { ToolbarIo };
