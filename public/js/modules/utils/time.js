import { padZero } from './string.js';

const splitTimecode = (ms) => {
	const parts = (ms / 1000).toFixed(3).toString().split('.');
	const totalSeconds = parseInt(parts[0], 10);
	const milli = parts[1] || 0;

	return {
		hour: padZero(Math.floor(totalSeconds / 3600), 2),
		minute: padZero(Math.floor((totalSeconds % 3600) / 60), 2),
		second: padZero(Math.floor(totalSeconds % 60), 2),
		milli: padZero(milli, 3),
	};
};

const formatTimecode = (ms) => {
	const { hour, minute, second, milli } = splitTimecode(ms);
	return `${hour}:${minute}:${second},${milli}`;
};

const timePartsToMs = ({ hour, minute, second, milli }) => ({
	hour: Number(hour) * 60 * 60 * 1000,
	minute: Number(minute) * 60 * 1000,
	second: Number(second) * 1000,
	milli: Number(milli),
});

const parseTimecode = (timecode) => {
	try {
		const [hour, minute, secondPart] = timecode.split(':');
		const [second, milli = '0'] = secondPart.split(',');
		const parts = timePartsToMs({ hour, minute, second, milli });
		return parts.hour + parts.minute + parts.second + parts.milli;
	} catch (e) {
	}
};

export { splitTimecode, formatTimecode, parseTimecode, timePartsToMs };
