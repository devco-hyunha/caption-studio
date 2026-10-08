import { parseTimecode } from '@/shared/lib/timecode';
import { valid } from './valid';
import type { SubtitleTimeline } from '../types';

const splitSubtitleLines = (text: string) => {
	if (text.indexOf('\r\n\r\n') >= 0) return text.split('\r\n');
	if (text.indexOf('\n\r\n\r') >= 0) return text.split('\n\r');
	if (text.indexOf('\n\n') >= 0) return text.split('\n');
	return text.split('\r');
};

const parseSrtTimeRange = (line: string) => {
	const [start, end] = line.trim().split(/\s*-->\s*/);
	return { start: start ?? '', end: end ?? '' };
};

interface SrtParseDraft {
	id?: string;
	start?: string;
	end?: string;
	text: string;
}

/** SRT 문자열 파싱 */
const parseSrtString = (data: string): SubtitleTimeline[] => {
	const result: SubtitleTimeline[] = [];
	const lines = splitSubtitleLines(data);
	let timeline: SrtParseDraft = { text: '' };

	lines.forEach((line) => {
		if (!timeline.id) {
			timeline.id = line;
			return;
		}
		if (!timeline.start) {
			const { start, end } = parseSrtTimeRange(line);
			timeline.start = start;
			timeline.end = end;
			return;
		}
		if (line !== '') {
			if (timeline.text !== '') timeline.text += '<br>';
			timeline.text += line;
			return;
		}

		const startMs = parseTimecode(timeline.start ?? '');
		const endMs = parseTimecode(timeline.end ?? '');
		result.push({
			start: startMs ?? 0,
			starttime: timeline.start,
			end: endMs ?? 0,
			endtime: timeline.end,
			text: timeline.text,
			memo: '',
		});
		timeline = { text: '' };
	});

	return result;
};

/** SMI 타임라인 → SRT 타임라인 */
const srtFromSmiArray = (data: readonly SubtitleTimeline[]): SubtitleTimeline[] => {
	const result: SubtitleTimeline[] = [];
	const setLastEnd = (value: number) => {
		if (result.length === 0) return;
		const lastItem = result.at(-1);
		if (lastItem && lastItem.end === 0) lastItem.end = value;
	};

	data.forEach(({ start: rawStart, text, memo = '' }) => {
		const start = Number(rawStart);
		if (start < 0 || Number.isNaN(start)) return;

		setLastEnd(start);

		if (text === '&nbsp;' || text === '') return;

		result.push({
			start,
			end: 0,
			text,
			memo,
		});
	});

	const lastItem = result.at(-1);
	if (lastItem && lastItem.end === 0) lastItem.end = lastItem.start + 99999;

	return result;
};

const srtFromPlainString = (data: string): SubtitleTimeline[] =>
	data.split('\n').map((line) => ({
		start: 0,
		end: 0,
		text: valid(line),
		memo: '',
	}));

export { parseSrtString, srtFromPlainString, srtFromSmiArray };
