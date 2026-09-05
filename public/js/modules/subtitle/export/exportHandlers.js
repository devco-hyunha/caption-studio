import { storage } from '../../utils/storage.js';
import { bindEvent } from '../../utils/dom.js';
import { trackEvent } from '../../analytics/track.js';
import { encodeText } from './download/iconv.js';
import { formatExportData } from './formatExportData.js';
import { downloadBytes } from './download/downloadBytes.js';
import { buildSmi, buildSrt, buildVtt, buildJson } from './build/buildFile.js';
import { buildExcel } from './build/buildExcel.js';

const sendExportGa = (eventAction) => {
	trackEvent({
		category: 'Subtitle',
		action: eventAction,
		label: 'Subtitle Export',
	});
};

const setStorageAndField = (storageKey, fieldSelector) => (value) => {
	storage.set(storageKey, value);
	const field = document.querySelector(fieldSelector);
	if (field) field.value = value;
};

const resolveExportFormat = (getConvertFormat, form) =>
	typeof getConvertFormat === 'function'
		? getConvertFormat(form)
		: getConvertFormat;

const resolveFilename = (form, extension) => {
	const name = form.querySelector('[name="filename"]')?.value || 'caption';
	return `${name}.${extension}`;
};

/**
 * @typedef {Object} ExportHandlerDeps
 * @property {object} ui - UI 셸 (`select.trigger` 등)
 * @property {object} sheet - 시트 API (`format`, `timelines`, `language`)
 */

/**
 * @typedef {Object} ClientDownloadConfig
 * @property {string} extension
 * @property {string} [encodingSelector]
 * @property {(options: { form: HTMLFormElement, data: object[], sheet: object }) => string|Uint8Array} build
 */

/**
 * @typedef {Object} ExportHandlerConfig
 * @property {string} storageKey
 * @property {string} formSelector
 * @property {string} [defaultWhenEmpty] - storage가 비었을 때 기본값 (smi: EUC-KR)
 * @property {string|((form: HTMLFormElement) => string|undefined)} getConvertFormat
 * @property {string} gaAction
 * @property {ClientDownloadConfig} clientDownload
 */

/**
 * @param {ExportHandlerDeps & { convert: (format: string, sheetData?: object) => object }} deps
 * @param {ExportHandlerConfig} config
 */
const createExportHandler = ({ ui, sheet, convert }, config) => () => {
	const {
		storageKey,
		formSelector,
		defaultWhenEmpty,
		getConvertFormat,
		gaAction,
		clientDownload,
	} = config;

	let stored = storage.get(storageKey);
	if (defaultWhenEmpty !== undefined && (!stored || stored === '')) {
		stored = defaultWhenEmpty;
	} else if (stored === '') {
		stored = null;
	}
	ui.select({ key: storageKey, value: stored });

	const form = document.querySelector(formSelector);
	bindEvent({
		target: form,
		event: 'submit',
		handler: (event) => {
			event.preventDefault();

			const exportFormat = resolveExportFormat(getConvertFormat, form);
			const data = convert(exportFormat);
			const payload = clientDownload.build({ form, data, sheet });
			const encoding = clientDownload.encodingSelector
				? (form.querySelector(clientDownload.encodingSelector)?.value
					|| storage.get(storageKey)
					|| defaultWhenEmpty
					|| 'UTF-8')
				: 'UTF-8';
			const bytes = payload instanceof Uint8Array
				? payload
				: encodeText(payload, encoding);
			downloadBytes(
				resolveFilename(form, clientDownload.extension),
				bytes,
			);
			sendExportGa(gaAction);
		},
	});
};

/**
 * 자막보내기 탭(`data-action`)용 핸들러를 생성한다.
 * smi/srt/vtt/json/excel은 클라이언트에서 파일을 만들어 내려받는다.
 *
 * @param {ExportHandlerDeps} deps
 * @returns {Record<'smi'|'srt'|'vtt'|'json'|'excel', () => void> & {
 *   encoding: Record<'smi'|'srt'|'vtt', (value: string) => void>,
 *   sheetFormat: Record<'json'|'excel', (value: string) => void>,
 * }}
 */
const exportHandlers = ({ ui, sheet }) => {
	const convert = (format, sheetData) =>
		formatExportData({
			exportFormat: format,
			sheetFormat: sheet.format,
			sheetData: sheetData ?? sheet.timelines,
		});

	const deps = { ui, sheet, convert };

	return {
		smi: createExportHandler(deps, {
			storageKey: 'smiEncodeFile',
			formSelector: '#subtitle-export-smi',
			defaultWhenEmpty: 'EUC-KR',
			getConvertFormat: 'smi',
			gaAction: 'SMI Export',
			clientDownload: {
				extension: 'smi',
				encodingSelector: '.encode_smi_file',
				build: buildSmi,
			},
		}),
		srt: createExportHandler(deps, {
			storageKey: 'srtEncodeFile',
			formSelector: '#subtitle-export-srt',
			getConvertFormat: 'srt',
			gaAction: 'SRT Export',
			clientDownload: {
				extension: 'srt',
				encodingSelector: '.encode_srt_file',
				build: buildSrt,
			},
		}),
		vtt: createExportHandler(deps, {
			storageKey: 'vttEncodeFile',
			formSelector: '#subtitle-export-vtt',
			getConvertFormat: 'srt',
			gaAction: 'VTT Export',
			clientDownload: {
				extension: 'vtt',
				encodingSelector: '.encode_vtt_file',
				build: buildVtt,
			},
		}),
		json: createExportHandler(deps, {
			storageKey: 'jsonFormat',
			formSelector: '#subtitle-export-json',
			getConvertFormat: (form) => form.querySelector('.json-format')?.value,
			gaAction: 'JSON Export',
			clientDownload: {
				extension: 'json',
				build: buildJson,
			},
		}),
		excel: createExportHandler(deps, {
			storageKey: 'excelFormat',
			formSelector: '#subtitle-export-excel',
			getConvertFormat: (form) => form.querySelector('.excel-format')?.value,
			gaAction: 'Excel Export',
			clientDownload: {
				extension: 'xlsx',
				build: buildExcel,
			},
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
