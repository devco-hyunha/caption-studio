import { IoTriggers } from '@/features/subtitle-io';
import type { SheetToolbarIoProps } from '../../../types';

/** toolbar I/O 섹션 — Panel 폐지, 모달 트리거 버튼 + 모달 */
const ToolbarIo = ({
  sheetFormat,
  timelines,
  workbookTabs,
  activeIndex,
  onImported,
  onSmiMetaChange,
}: SheetToolbarIoProps) => (
  <IoTriggers
    sheetFormat={sheetFormat}
    timelines={timelines}
    workbookTabs={workbookTabs}
    activeIndex={activeIndex}
    onImported={onImported}
    onSmiMetaChange={onSmiMetaChange}
  />
);

export { ToolbarIo };
