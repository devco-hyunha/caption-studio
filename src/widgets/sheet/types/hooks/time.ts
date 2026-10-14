import type { Fn } from '@/shared/types/fn';
import type { SheetColumnId } from '@/shared/types/sheet-column';
import type { SubtitleFormat } from '@/shared/types/subtitle-format';

/** time 훅 params — 포커스 time 셀·다중 선택·time 타깃 판별 */
export interface UseSheetTimeActionsParams {
  format: SubtitleFormat;
  currentRowIndex: number | null;
  currentColumn: SheetColumnId | null;
  isTimeTarget: Fn<boolean>;
  isEditing: Fn<boolean>;
  /** ±jump 직전 검색 패널 닫기 */
  closeSearchPanel: Fn<void>;
  /** timeCarve — 플레이어 시각을 time 셀에 커밋 */
  onUpdateCell: (rowIndex: number, column: SheetColumnId, value: string) => boolean;
}

/** time 훅 결과 — shortkey actions에 주입할 time ±jump API */
export interface UseSheetTimeActionsResult {
  timePlus: Fn<void>;
  timeMinus: Fn<void>;
  /** Ctrl+` · 「시간 입력」 — 포커스 start/end 셀에 플레이어 시각 반영 */
  timeCarve: Fn<void>;
}
