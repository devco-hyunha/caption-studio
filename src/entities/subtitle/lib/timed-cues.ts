import type { SubtitleTimeline } from '../types';

const stripTagsKeepBr = (html: string) =>
	String(html ?? '').replace(/<(?!\/?br\b)[^>]*>/gi, '');

const cueText = (timeline: SubtitleTimeline, shouldRemoveStyle: boolean) => {
	const raw = shouldRemoveStyle
		? stripTagsKeepBr(timeline.text)
		: (timeline.text ?? '');
	return String(raw).split('<br>').join('\r\n');
};

interface BuildTimedCuesOptions {
	useDotDecimal: boolean;
	shouldRemoveStyle: boolean;
}

/** SRT/VTT 공통 timed cue 본문 */
const buildTimedCues = (
	data: readonly SubtitleTimeline[],
	{ useDotDecimal, shouldRemoveStyle }: BuildTimedCuesOptions,
): string =>
	data
		.map((timeline, index) => {
			const starttime = String(timeline.starttime ?? '');
			const endtime = String(timeline.endtime ?? '');
			const start = useDotDecimal
				? starttime.split(',').join('.')
				: starttime;
			const end = useDotDecimal ? endtime.split(',').join('.') : endtime;
			return `${index + 1}\r\n${start} --> ${end}\r\n${cueText(timeline, shouldRemoveStyle)}\r\n\r\n`;
		})
		.join('');

export { buildTimedCues };
