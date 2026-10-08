import {
	parseSmiString,
	smiFromPlainString,
	smiFromSrtArray,
} from './parse-smi';
import {
	parseSrtString,
	srtFromPlainString,
	srtFromSmiArray,
} from './parse-srt';
import type { SubtitleFormat, SubtitleSheetData, SubtitleTimeline } from '../types';

type ConvertInputFormat =
	| 'smistring'
	| 'srtstring'
	| 'smi'
	| 'srt'
	| 'string';

/** 입력을 SRT 시트 데이터로 변환 */
const toSrt = (
	format: ConvertInputFormat,
	data: string | readonly SubtitleTimeline[],
): SubtitleSheetData => {
	if (format === 'smistring') {
		return toSrt('smi', toSmi('smistring', data as string).timelines);
	}
	if (format === 'srtstring') {
		return { format: 'srt', timelines: parseSrtString(data as string) };
	}
	if (format === 'smi') {
		return {
			format: 'srt',
			timelines: srtFromSmiArray(data as readonly SubtitleTimeline[]),
		};
	}
	if (format === 'string') {
		return { format: 'srt', timelines: srtFromPlainString(data as string) };
	}
	return { format: 'srt', timelines: [] };
};

/** 입력을 SMI 시트 데이터로 변환 */
const toSmi = (
	format: ConvertInputFormat,
	data: string | readonly SubtitleTimeline[],
): SubtitleSheetData => {
	if (format === 'srtstring') {
		return toSmi('srt', toSrt('srtstring', data as string).timelines);
	}
	if (format === 'smistring') {
		return { format: 'smi', timelines: parseSmiString(data as string) };
	}
	if (format === 'srt') {
		return {
			format: 'smi',
			timelines: smiFromSrtArray(data as readonly SubtitleTimeline[]),
		};
	}
	if (format === 'string') {
		return { format: 'smi', timelines: smiFromPlainString(data as string) };
	}
	return { format: 'smi', timelines: [] };
};

const converters: Record<
	SubtitleFormat,
	(
		format: ConvertInputFormat,
		data: string | readonly SubtitleTimeline[],
	) => SubtitleSheetData
> = {
	srt: toSrt,
	smi: toSmi,
};

/** 파일 문자열을 목표 시트 포맷 타임라인으로 변환 */
const parseSubtitleFile = (
	fileFormat: 'smi' | 'srt',
	text: string,
	sheetFormat: SubtitleFormat,
): SubtitleSheetData => {
	const convertFormat = fileFormat === 'smi' ? 'smistring' : 'srtstring';
	return converters[sheetFormat](convertFormat, text);
};

export { converters, parseSubtitleFile, toSmi, toSrt };
export type { ConvertInputFormat };
