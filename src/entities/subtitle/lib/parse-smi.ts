import { encodeHtml } from './encode-html';
import { valid } from './valid';
import type { SubtitleTimeline } from '../types';

/** SMI 문자열 파싱 */
const parseSmiString = (data: string): SubtitleTimeline[] => {
	const result: SubtitleTimeline[] = [];
	const syncChunks = data.split(/<sync/i);

	syncChunks.forEach((chunk) => {
		const sync = new DOMParser()
			.parseFromString(`<sync${chunk}</p></sync>`, 'text/html')
			.querySelector('sync');
		if (!sync) return;

		const paragraphs = Array.from(sync.children).filter(
			(child) => child.tagName === 'P',
		);
		const start = sync.getAttribute('start');
		if (start != null && start !== '' && Number(start) >= 0) {
			result.push({
				start: Number(start),
				text: encodeHtml(paragraphs[0] ?? null),
				memo: '',
			});
		}
	});

	return result;
};

/** SRT 타임라인 → SMI 타임라인 */
const smiFromSrtArray = (data: readonly SubtitleTimeline[]): SubtitleTimeline[] => {
	const result: SubtitleTimeline[] = [];
	let prevEnd: number | undefined;

	data.forEach(({ start, end, text, memo = '' }) => {
		if (prevEnd === start) {
			const lastItem = result.at(-1);
			if (lastItem) {
				lastItem.text = text;
				lastItem.memo = memo;
			}
		} else {
			result.push({ start, text, memo });
		}

		result.push({
			start: Number(end),
			text: '',
			memo: '',
		});

		prevEnd = end;
	});

	return result;
};

const smiFromPlainString = (data: string): SubtitleTimeline[] =>
	data.split('\n').map((line) => ({
		start: 0,
		text: valid(line),
		memo: '',
	}));

export { parseSmiString, smiFromPlainString, smiFromSrtArray };
