import storageModule from '../../utils/storage.js';
import { bindEvent } from '../../utils/dom.js';
import { SMI_CLASS } from './constants.js';
import { formatExportData } from './formatExportData.js';

const storage = storageModule();

const setFieldValue = (form, selector, value) => {
	const field = form.querySelector(selector);
	if (field) field.value = value;
};

const setStorageAndField = (storageKey, fieldSelector) => (value) => {
	storage.set(storageKey, value);
	const field = document.querySelector(fieldSelector);
	if (field) field.value = value;
};

/**
 * @typedef {Object} ExportHandlerDeps
 * @property {object} Interface - caption.js UI 셸 (`Select.Trigger` 등)
 * @property {object} Sheet - 시트 API (`Format`, `ArrayData`, `Language`)
 */

/**
 * @typedef {Object} ExportHandlerConfig
 * @property {string} storageKey
 * @property {string} formSelector
 * @property {string} [defaultWhenEmpty] - storage가 비었을 때 기본값 (smi: EUC-KR)
 * @property {string|((form: HTMLFormElement) => string|undefined)} getConvertFormat
 * @property {(form: HTMLFormElement, Sheet: object) => void} [fillExtraFields]
 */

/**
 * @param {ExportHandlerDeps & { convert: (format: string, sheetData?: object) => object }} deps
 * @param {ExportHandlerConfig} config
 */
const createExportHandler = ({ Interface, Sheet, convert }, config) => () => {
	const { storageKey, formSelector, defaultWhenEmpty, getConvertFormat, fillExtraFields } = config;

	let stored = storage.get(storageKey);
	if (defaultWhenEmpty !== undefined && (!stored || stored === '')) {
		stored = defaultWhenEmpty;
	} else if (stored === '') {
		stored = null;
	}
	Interface.Select.Trigger(storageKey, stored);

	const form = document.querySelector(formSelector);
	bindEvent({
		target: form,
		event: 'submit',
		handler: () => {
			const exportFormat = typeof getConvertFormat === 'function'
				? getConvertFormat(form)
				: getConvertFormat;
			const captionString = JSON.stringify(convert(exportFormat));
			fillExtraFields?.(form, Sheet);
			setFieldValue(form, '.caption', captionString);
		},
	});
};

/**
 * 자막보내기 탭(`data-action`)용 핸들러를 생성한다.
 * 각 핸들러는 탭 진입 시 호출되며, form submit 시 최신 시트 데이터를 hidden 필드에 채운다.
 *
 * @param {ExportHandlerDeps} deps
 * @returns {Record<'smi'|'srt'|'vtt'|'json'|'excel', () => void> & {
 *   encoding: Record<'smi'|'srt'|'vtt', (value: string) => void>,
 *   sheetFormat: Record<'json'|'excel', (value: string) => void>,
 * }}
 */
const exportHandlers = ({ Interface, Sheet }) => {
	const convert = (format, sheetData) =>
		formatExportData({
			exportFormat: format,
			sheetFormat: Sheet.Format,
			sheetData: sheetData ?? Sheet.ArrayData,
		});

	const deps = { Interface, Sheet, convert };

	return {
		smi: createExportHandler(deps, {
			storageKey: 'smiEncodeFile',
			formSelector: '#subtitle-export-smi',
			defaultWhenEmpty: 'EUC-KR',
			getConvertFormat: 'smi',
			fillExtraFields: (form, sheet) => {
				setFieldValue(form, '.lang_key', sheet.Language);
				setFieldValue(form, '.lang_value', SMI_CLASS[sheet.Language]);
			},
		}),
		srt: createExportHandler(deps, {
			storageKey: 'srtEncodeFile',
			formSelector: '#subtitle-export-srt',
			getConvertFormat: 'srt',
		}),
		vtt: createExportHandler(deps, {
			storageKey: 'vttEncodeFile',
			formSelector: '#subtitle-export-vtt',
			getConvertFormat: 'srt',
		}),
		json: createExportHandler(deps, {
			storageKey: 'jsonFormat',
			formSelector: '#subtitle-export-json',
			getConvertFormat: (form) => form.querySelector('.json-format')?.value,
		}),
		excel: createExportHandler(deps, {
			storageKey: 'excelFormat',
			formSelector: '#subtitle-export-excel',
			getConvertFormat: (form) => form.querySelector('.excel-format')?.value,
		}),
		encoding: {
			smi: setStorageAndField('smiEncodeFile', '.encode_smi_file'),
			srt: setStorageAndField('srtEncodeFile', '.encode_srt_file'),
			vtt: setStorageAndField('vttEncodeFile', '.encode_vtt_file'),
		},
		sheetFormat: {
			json: setStorageAndField('jsonFormat', '.json-format'),
			excel: setStorageAndField('excelFormat', '.excel-format'),
		},
	};
};

export default exportHandlers;
