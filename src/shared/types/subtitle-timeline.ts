/** 시트·변환용 타임라인 행 — canonical (필수형) */
export interface SubtitleTimeline {
  start: number;
  end?: number;
  starttime?: string;
  endtime?: string;
  text: string;
  memo: string;
}
