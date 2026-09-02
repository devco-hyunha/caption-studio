import { parseTimecode } from '../../utils/time.js';
import { valid } from '../valid.js';

const splitSubtitleLines = (text) => {
	if (text.indexOf('\r\n\r\n') >= 0) return text.split('\r\n');
	if (text.indexOf('\n\r\n\r') >= 0) return text.split('\n\r');
	if (text.indexOf('\n\n') >= 0) return text.split('\n');
	return text.split('\r');
};

const parseSrtTimeRange = (line) => {
	const [start, end] = line.trim().split(/\s*-->\s*/);
	return { start, end };
};

const srtFromSrtString = (data) => {
	const result = [];
	const lines = splitSubtitleLines(data);

	let timeline = { text: '' };

	lines.forEach((line) => {
		if (!timeline.id) {
			timeline.id = line;
		} else if (!timeline.start) {
			const { start, end } = parseSrtTimeRange(line);
			timeline.start = start;
			timeline.end = end;
		} else if (line !== '') {
			if (timeline.text != '') {
				timeline.text += '<br>';
			}
			timeline.text += line;
		} else {
			result.push({
				start: parseTimecode(timeline.start),
				starttime: timeline.start,
				end: parseTimecode(timeline.end),
				endtime: timeline.end,
				text: timeline.text,
				memo: ''
			});
			timeline = { text: '' };
		}
	});

	return result;
};


const srtFromSmiArray = (data) => {
	const result = [];
	const setLastEnd = (value) => {
		if (result.length === 0) return;
		const lastItem = result.at(-1);
		if (lastItem.end == 0) lastItem.end = value;
	};
	
	data.forEach(({ start: rawStart, text, memo = '' }) => {
		const start = Number(rawStart);
		if (start < 0 || Number.isNaN(start)) return;

		setLastEnd(start);

		if (text === '&nbsp;' || text === '') {
			return;
		}

		result.push({
			start,
			end: 0,
			text,
			memo,
		});
	});

	const lastItem = result.at(-1);
	if (lastItem && lastItem.end == 0) lastItem.end = lastItem.start + 99999;

	return result;
};

const srtFromString = (data) =>
	data.split('\n').map((line) => ({
		start: 0,
		end: 0,
		text: valid(line),
		memo: '',
	}));

export { srtFromSrtString, srtFromSmiArray, srtFromString };
