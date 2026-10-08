/** 시트/변환용 타임라인 행 */
export interface SubtitleTimeline {
	start: number;
	end?: number;
	starttime?: string;
	endtime?: string;
	text: string;
	memo: string;
}

/** 시트 저장 포맷 */
export type SubtitleFormat = 'smi' | 'srt';

/** 내보내기 파일 포맷 */
export type SubtitleExportFormat = 'smi' | 'srt' | 'vtt' | 'json' | 'excel';

/** parse / convert 결과 */
export interface SubtitleSheetData {
	format: SubtitleFormat;
	timelines: SubtitleTimeline[];
}

/** SMI 직렬화 옵션 (폼 없이 Verify용) */
export interface SerializeSmiOptions {
	classKey?: string;
	classStyle?: string;
	signature?: string;
	title?: string;
}

/** SRT 직렬화 옵션 */
export interface SerializeSrtOptions {
	/** 스타일 태그 제거 */
	removeStyle?: boolean;
}

/** VTT 직렬화 옵션 */
export interface SerializeVttOptions {
	removeStyle?: boolean;
}
