import type { SerializeSrtOptions, SubtitleTimeline } from '../types';
import { buildTimedCues } from './timed-cues';

/** SRT 직렬화 */
const serializeSrt = (
	data: readonly SubtitleTimeline[],
	options: SerializeSrtOptions = {},
): string =>
	buildTimedCues(data, {
		useDotDecimal: false,
		shouldRemoveStyle: options.removeStyle === true,
	});

export { serializeSrt };
