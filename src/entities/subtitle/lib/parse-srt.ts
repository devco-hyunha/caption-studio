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

/** 마지막 cue 확정용 빈 줄 — split 규칙(`\r\n\r\n` 등)과 맞춤 */
const ensureTrailingBlankLine = (data: string): string => {
	if (/\r\n\r\n\s*$/.test(data) || /\n\r\n\r\s*$/.test(data) || /\n\n\s*$/.test(data)) {
		return data;
	}
	if (data.includes('\r\n')) return `${data.replace(/\s*$/, '')}\r\n\r\n`;
	if (data.includes('\n')) return `${data.replace(/\s*$/, '')}\n\n`;
	return `${data}\n\n`;
};

const emptySrtDraft = (): SrtParseDraft => ({ text: '' });

/** draft가 완전하면 result에 push 후 빈 draft 반환 */
const flushSrtDraft = (
	result: SubtitleTimeline[],
	timeline: SrtParseDraft,
): SrtParseDraft => {
	if (timeline.start == null || timeline.start === '') return emptySrtDraft();

	const startMs = parseTimecode(timeline.start);
	const endMs = parseTimecode(timeline.end ?? '');
	result.push({
		start: startMs ?? 0,
		starttime: timeline.start,
		end: endMs ?? 0,
		endtime: timeline.end,
		text: timeline.text,
		memo: '',
	});
	return emptySrtDraft();
};

/** 직전 SRT 행 end가 비어 있으면 다음 sync start로 채움 */
const setSmiConvertedLastEnd = (result: SubtitleTimeline[], value: number) => {
	if (result.length === 0) return;
	const lastItem = result.at(-1);
	if (lastItem && lastItem.end === 0) lastItem.end = value;
};

/** SRT 문자열 파싱 — 끝 빈 줄 보정 + draft flush로 마지막 자막 유실 방지 */
const parseSrtString = (data: string): SubtitleTimeline[] => {
	const result: SubtitleTimeline[] = [];
	const lines = splitSubtitleLines(ensureTrailingBlankLine(data));
	let timeline = emptySrtDraft();

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
		timeline = flushSrtDraft(result, timeline);
	});

	flushSrtDraft(result, timeline);
	return result;
};

/** SMI 타임라인 → SRT 타임라인 */
const srtFromSmiArray = (data: readonly SubtitleTimeline[]): SubtitleTimeline[] => {
	const result: SubtitleTimeline[] = [];

	data.forEach(({ start: rawStart, text, memo = '' }) => {
		const start = Number(rawStart);
		if (start < 0 || Number.isNaN(start)) return;

		setSmiConvertedLastEnd(result, start);

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
