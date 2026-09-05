import { srtFromSrtString, srtFromSmiArray, srtFromString } from './srtHelpers.js';
import { smiFromSmiString, smiFromSrtArray, smiFromString } from './smiHelpers.js';

/**
 * @typedef {Object} Timeline
 * @property {number} start - 시작 시각(ms)
 * @property {number} [end] - 종료 시각(ms). SMI 타임라인에는 없을 수 있음
 * @property {string} [starttime] - 표시용 시작 타임코드
 * @property {string} [endtime] - 표시용 종료 타임코드
 * @property {string} text - 자막 HTML
 * @property {string} [memo] - 메모
 */

/**
 * @typedef {Object} SheetData
 * @property {'smi'|'srt'} format
 * @property {Timeline[]} timelines
 */

/**
 * 입력 포맷에 따라 SRT 시트 데이터로 변환한다.
 *
 * @param {'smistring'|'srtstring'|'smi'|'srt'|'string'} format
 * @param {string|Timeline[]} data - format에 따라 원본 문자열 또는 타임라인 배열
 * @returns {SheetData}
 */
const toSrt = (format, data) => {
	if (format === 'smistring') {
		return toSrt('smi', toSmi('smistring', data).timelines);
	}
	if (format === 'srtstring') {
		return { format: 'srt', timelines: srtFromSrtString(data) };
	}
	if (format === 'smi') {
		return { format: 'srt', timelines: srtFromSmiArray(data) };
	}
	if (format === 'string') {
		return { format: 'srt', timelines: srtFromString(data) };
	}
	return { format: 'srt', timelines: [] };
};

/**
 * 입력 포맷에 따라 SMI 시트 데이터로 변환한다.
 *
 * @param {'smistring'|'srtstring'|'smi'|'srt'|'string'} format
 * @param {string|Timeline[]} data - format에 따라 원본 문자열 또는 타임라인 배열
 * @returns {SheetData}
 */
const toSmi = (format, data) => {
	if (format === 'srtstring') {
		return toSmi('srt', toSrt('srtstring', data).timelines);
	}
	if (format === 'smistring') {
		return { format: 'smi', timelines: smiFromSmiString(data) };
	}
	if (format === 'srt') {
		return { format: 'smi', timelines: smiFromSrtArray(data) };
	}
	if (format === 'string') {
		return { format: 'smi', timelines: smiFromString(data) };
	}
	return { format: 'smi', timelines: [] };
};

export default { srt: toSrt, smi: toSmi };
