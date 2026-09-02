import { formatTimecode } from '../../utils/time.js';
import converters from '../convert/index.js';

/**
 * @typedef {Object} FormatExportDataOptions
 * @property {'smi'|'srt'|'vtt'|'json'|'excel'} exportFormat - 다운로드 대상 포맷
 * @property {'smi'|'srt'} sheetFormat - 현재 시트 포맷
 * @property {import('../convert/index.js').Timeline[]} sheetData - 시트 타임라인 배열
 */

/**
 * 시트 타임라인 배열을 export용 데이터로 가공한다.
 * 시트 포맷과 export 포맷이 다르면 변환 후, SRT/SMI 규칙에 맞게 필드를 정리한다.
 *
 * @param {FormatExportDataOptions} options
 * @returns {import('../convert/index.js').Timeline[]} json/excel은 smi/srt 중 하나의 배열, vtt는 srt 형식
 */
const formatExportData = ({ exportFormat, sheetFormat, sheetData }) => {
	const arrayData = sheetFormat !== exportFormat
		? converters[exportFormat](sheetFormat, sheetData).ArrayData
		: sheetData;

	if (exportFormat === 'srt' || sheetFormat === 'srt') {
		return arrayData.map(({ start, end, text, memo = '' }) => ({
			start,
			starttime: formatTimecode(start),
			end,
			endtime: formatTimecode(end),
			text,
			memo,
		}));
	}

	if (sheetFormat === 'smi') {
		return arrayData.map(({ start, text, memo = '' }) => ({
			start,
			starttime: formatTimecode(start),
			text,
			memo,
		}));
	}

	return [];
};

export { formatExportData };
