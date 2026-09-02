import storageModule from './storage.js';
import editHistoryModule from './editHistory.js';
import { clone, extend } from './object.js';
import { capitalize, padZero } from './string.js';
import { splitTimecode, formatTimecode, parseTimecode, timePartsToMs } from './time.js';
import { cssColorToHex, rgbToHex, normalizeElementColor } from './color.js';
import { bindEvent, isJQuery, toElement } from './dom.js';
import { runAction } from './action.js';

const utils = () => ({
	storage: storageModule(),
	editHistory: editHistoryModule(),
	clone,
	extend,
	capitalize,
	padZero,
	splitTimecode,
	formatTimecode,
	parseTimecode,
	timePartsToMs,
	cssColorToHex,
	rgbToHex,
	normalizeElementColor,
	bindEvent,
	isJQuery,
	toElement,
	runAction,
});

export default utils;
