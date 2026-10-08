import type { SerializeVttOptions, SubtitleTimeline } from '../types';
import { buildTimedCues } from './timed-cues';

/** VTT 직렬화 */
const serializeVtt = (
	data: readonly SubtitleTimeline[],
	options: SerializeVttOptions = {},
): string =>
	`WEBVTT\r\n\r\n${buildTimedCues(data, {
		useDotDecimal: true,
		shouldRemoveStyle: options.removeStyle === true,
	})}`;

export { serializeVtt };
