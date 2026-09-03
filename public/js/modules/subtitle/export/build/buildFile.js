import { SMI_CLASS } from './constants.js';

const SMI_ENTITY_REPLACEMENTS = [
	['&amp;', '&'],
	['&lt;', '<'],
	['&lt', '<'],
	['&gt;', '>'],
	['&gt', '>'],
];

const restoreSmiEntities = (text) =>
	SMI_ENTITY_REPLACEMENTS.reduce(
		(acc, [from, to]) => acc.split(from).join(to),
		text,
	);

const stripTagsKeepBr = (html) =>
	String(html ?? '').replace(/<(?!\/?br\b)[^>]*>/gi, '');

const cueText = (timeline, shouldRemoveStyle) => {
	const raw = shouldRemoveStyle
		? stripTagsKeepBr(timeline.text)
		: (timeline.text ?? '');
	return String(raw).split('<br>').join('\r\n');
};

const buildTimedCues = (data, { useDotDecimal, shouldRemoveStyle }) =>
	data.map((timeline, index) => {
		const starttime = String(timeline.starttime ?? '');
		const endtime = String(timeline.endtime ?? '');
		const start = useDotDecimal ? starttime.split(',').join('.') : starttime;
		const end = useDotDecimal ? endtime.split(',').join('.') : endtime;
		return `${index + 1}\r\n${start} --> ${end}\r\n${cueText(timeline, shouldRemoveStyle)}\r\n\r\n`;
	}).join('');

const fieldValue = (form, name) => form.querySelector(`[name="${name}"]`)?.value ?? '';

const isStyleChecked = (form) =>
	Boolean(form.querySelector('[name="is-style"]')?.checked);

/**
 * @param {{ form: HTMLFormElement, data: object[], Sheet: object }} options
 * @returns {string}
 */
const buildSmi = ({ form, data, Sheet }) => {
	const langKey = Sheet.Language ?? '';
	const langValue = SMI_CLASS[langKey] ?? '';
	const signatureRaw = fieldValue(form, 'signature');
	const signature = signatureRaw
		? `<!--\r\n${signatureRaw}\r\n-->\r\n`
		: '';

	const captionBody = data.map((timeline) => {
		let text = timeline.text;
		if (text == null || text === '') {
			text = '&nbsp;';
		} else {
			text = restoreSmiEntities(String(text));
		}
		return `<SYNC Start=${timeline.start}><P Class=${langKey}>${text}</P></SYNC>\r\n`;
	}).join('');

	const title = `Caption Studio - (c)2017 DEVCO Studio ${location.href}`;
	return `<SAMI>\r\n<HEAD>\r\n<Title>${title}</Title>\r\n<SAMIParam>\r\n\tMetrics {time:ms;}\r\n\tSpec {MSFT:1.0;}\r\n</SAMIParam>\r\n<STYLE TYPE="text/css">\r\n\tp {margin-left:8pt; margin-right:8pt; margin-bottom:2pt; margin-top:2pt;text-align:center;font-size:20pt; font-family:arial, sans-serif;font-weight:normal; color:White;}\r\n\t.${langKey} {${langValue}}\r\n</STYLE>\r\n</HEAD>\r\n${signature}\r\n<BODY>\r\n${captionBody}\r\n</BODY>\r\n</SAMI>`;
};

/**
 * @param {{ form: HTMLFormElement, data: object[] }} options
 * @returns {string}
 */
const buildSrt = ({ form, data }) =>
	buildTimedCues(data, {
		useDotDecimal: false,
		shouldRemoveStyle: isStyleChecked(form),
	});

/**
 * @param {{ form: HTMLFormElement, data: object[] }} options
 * @returns {string}
 */
const buildVtt = ({ form, data }) =>
	`WEBVTT\r\n\r\n${buildTimedCues(data, {
		useDotDecimal: true,
		shouldRemoveStyle: isStyleChecked(form),
	})}`;

/**
 * @param {{ data: object[] }} options
 * @returns {string}
 */
const buildJson = ({ data }) => JSON.stringify(data, null, '\t');

export { buildSmi, buildSrt, buildVtt, buildJson };
