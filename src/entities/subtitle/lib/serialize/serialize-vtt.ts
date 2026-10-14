import type { SubtitleTimeline } from '@/shared/types/subtitle-timeline';
import type { SerializeVttOptions } from '../../types';
import { buildTimedCues } from './timed-cues';

/** VTT 직렬화 — dot decimal */
const serializeVtt = (
  data: readonly SubtitleTimeline[],
  options: SerializeVttOptions = {},
): string =>
  `WEBVTT\r\n\r\n${buildTimedCues(data, {
    useDotDecimal: true,
    shouldRemoveStyle: options.removeStyle === true,
  })}`;

export { serializeVtt };
