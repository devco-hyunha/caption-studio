const pad = (value: number | string, size: number) => String(value).padStart(size, '0');

/** ms → `HH:MM:SS,mmm` */
const formatTimecode = (ms: number) => {
	const safeMs = Number.isFinite(ms) ? Math.max(0, ms) : 0;
	const [totalSecondsPart, milliPart = '0'] = (safeMs / 1000).toFixed(3).split('.');
	const totalSeconds = Number.parseInt(totalSecondsPart, 10);
	const hour = pad(Math.floor(totalSeconds / 3600), 2);
	const minute = pad(Math.floor((totalSeconds % 3600) / 60), 2);
	const second = pad(Math.floor(totalSeconds % 60), 2);
	const milli = pad(milliPart, 3);
	return `${hour}:${minute}:${second},${milli}`;
};

/** `HH:MM:SS,mmm` / `HH:MM:SS.mmm` → ms. 실패 시 null */
const parseTimecode = (value: string): number | null => {
	const trimmed = value.trim().replace(/\./g, ',');
	const match = /^(\d{1,2}):(\d{2}):(\d{2}),(\d{1,3})$/.exec(trimmed);
	if (!match) return null;

	const hours = Number(match[1]);
	const minutes = Number(match[2]);
	const seconds = Number(match[3]);
	const millis = Number(match[4].padEnd(3, '0'));
	if (minutes >= 60 || seconds >= 60) return null;

	return ((hours * 60 + minutes) * 60 + seconds) * 1000 + millis;
};

export { formatTimecode, parseTimecode };
