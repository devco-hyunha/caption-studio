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
 * @property {'smi'|'srt'} Format
 * @property {Timeline[]} ArrayData
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
		return toSrt('smi', toSmi('smistring', data).ArrayData);
	}
	if (format === 'srtstring') {
		return { Format: 'srt', ArrayData: srtFromSrtString(data) };
	}
	if (format === 'smi') {
		return { Format: 'srt', ArrayData: srtFromSmiArray(data) };
	}
	if (format === 'string') {
		return { Format: 'srt', ArrayData: srtFromString(data) };
	}
	return { Format: 'srt', ArrayData: [] };
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
		return toSmi('srt', toSrt('srtstring', data).ArrayData);
	}
	if (format === 'smistring') {
		return { Format: 'smi', ArrayData: smiFromSmiString(data) };
	}
	if (format === 'srt') {
		return { Format: 'smi', ArrayData: smiFromSrtArray(data) };
	}
	if (format === 'string') {
		return { Format: 'smi', ArrayData: smiFromString(data) };
	}
	return { Format: 'smi', ArrayData: [] };
};

export default { srt: toSrt, smi: toSmi };
