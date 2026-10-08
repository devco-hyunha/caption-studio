/** 초 → `M:SS` / `H:MM:SS` (컨트롤 표시용) */
const formatPlayerTime = (seconds: number): string => {
	if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
	const total = Math.floor(seconds);
	const hours = Math.floor(total / 3600);
	const minutes = Math.floor((total % 3600) / 60);
	const secs = total % 60;
	const pad = (value: number) => String(value).padStart(2, '0');
	if (hours > 0) return `${hours}:${pad(minutes)}:${pad(secs)}`;
	return `${minutes}:${pad(secs)}`;
};

export { formatPlayerTime };
