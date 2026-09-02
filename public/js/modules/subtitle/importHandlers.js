import storageModule from '../utils/storage.js';
import { bindEvent } from '../utils/dom.js';
import converters from './convert/index.js';

const storage = storageModule();

const getLoadBtn = () => document.querySelector('#subtitle-import .subtitle-load');

const resetFileInput = (input) => {
	if (!input) return;
	input.value = '';
	input.dispatchEvent(new Event('change', { bubbles: true }));
};

const sendImportGa = (eventAction) => {
	ga('send', {
		hitType: 'event',
		eventCategory: 'Subtitle',
		eventAction,
		eventLabel: 'Subtitle Import',
	});
};

const setStorageEncoding = (storageKey) => (value) => {
	storage.set(storageKey, value);
};

/**
 * @typedef {Object} ImportHandlerDeps
 * @property {object} Interface - caption.js UI 셸
 * @property {object} Sheet - 시트 API
 * @property {object} i18n - i18n 모듈
 */

/**
 * @typedef {Object} FileImportConfig
 * @property {string} encodeKey
 * @property {string} inputSelector
 * @property {RegExp} formatPattern
 * @property {'smistring'|'srtstring'} convertFormat
 * @property {string} emptyAlertKey
 * @property {string} gaAction
 */

/**
 * @param {ImportHandlerDeps & { applyToSheet: (result: object) => void }} deps
 * @param {FileImportConfig} config
 */
const createFileImportHandler = ({ Interface, Sheet, i18n, applyToSheet }, config) => () => {
	const { encodeKey, inputSelector, formatPattern, convertFormat, emptyAlertKey, gaAction } = config;

	let encode = storage.get(encodeKey);
	if (encode == '') encode = null;
	Interface.Select.Trigger(encodeKey, encode);

	bindEvent({
		target: getLoadBtn(),
		event: 'click',
		handler: (event) => {
			event.preventDefault();
			const fileInput = document.querySelector(inputSelector);
			const fileData = fileInput?.files[0];

			if (!fileData) {
				Interface.Alert(i18n.t(emptyAlertKey));
				return;
			}

			const fileFormat = fileData.name.split('.').pop();
			if (!formatPattern.test(fileFormat)) {
				Interface.Alert(i18n.t('not-support-file-format'));
				resetFileInput(fileInput);
				return;
			}

			const fileReader = new FileReader();
			fileReader.readAsText(fileData, storage.get(encodeKey));
			fileReader.onload = () => {
				applyToSheet(converters[Sheet.Format](convertFormat, fileReader.result));
				sendImportGa(gaAction);
			};
		},
	});
};

/**
 * 자막 가져오기 탭(`data-action`)용 핸들러를 생성한다.
 * 각 핸들러는 탭 진입 시 호출되며, 로드 버튼 클릭 시 파일/텍스트를 시트에 반영한다.
 *
 * @param {ImportHandlerDeps} deps
 * @returns {Record<'text'|'smi'|'srt', () => void> & { encoding: Record<'smi'|'srt', (value: string) => void> }}
 */
const importHandlers = ({ Interface, Sheet, i18n }) => {
	const applyToSheet = (result) => {
		Sheet.Current.row = 0;
		Sheet.Current.col = 0;
		Sheet.Move.Event();
		Sheet.Set(result);
		Interface.Dialog();
	};

	const deps = { Interface, Sheet, i18n, applyToSheet };

	return {
		text: () => {
			bindEvent({
				target: getLoadBtn(),
				event: 'click',
				handler: (event) => {
					event.preventDefault();
					const data = document.querySelector('#subtitle-text')?.value ?? '';
					if (data == '') {
						Interface.Alert(i18n.t('please-input-contents'));
						return;
					}
					applyToSheet(converters[Sheet.Format]('string', data));
					sendImportGa('Text Import');
				},
			});
		},
		smi: createFileImportHandler(deps, {
			encodeKey: 'smiEncode',
			inputSelector: '#smi-file',
			formatPattern: /smi/i,
			convertFormat: 'smistring',
			emptyAlertKey: 'please-select-smi-file',
			gaAction: 'SMI Import',
		}),
		srt: createFileImportHandler(deps, {
			encodeKey: 'srtEncode',
			inputSelector: '#srt-file',
			formatPattern: /srt/i,
			convertFormat: 'srtstring',
			emptyAlertKey: 'please-select-srt-file',
			gaAction: 'SRT Import',
		}),
		encoding: {
			smi: setStorageEncoding('smiEncode'),
			srt: setStorageEncoding('srtEncode'),
		},
	};
};

export default importHandlers;
