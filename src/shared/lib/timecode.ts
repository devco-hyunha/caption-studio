const pad = (value: number | string, size: number) => String(value).padStart(size, '0');

/** 초 → ms. 유한하지 않으면 0 */
const secondsToMs = (seconds: number): number =>
  Number.isFinite(seconds) ? Math.max(0, Math.trunc(seconds * 1000)) : 0;

/** ms → 시·분·초·밀리 초 분해. 음수·비유한은 0 기준 */
const splitTimeParts = (ms: number) => {
  const safeMs = Number.isFinite(ms) ? Math.max(0, ms) : 0;
  const [totalSecondsPart, milliPart = '0'] = (safeMs / 1000).toFixed(3).split('.');
  const totalSeconds = Number.parseInt(totalSecondsPart, 10);
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: Math.floor(totalSeconds % 60),
    milli: pad(milliPart, 3),
  };
};

/**
 * ms → 시간 문자열.
 * `slim` true — `M:SS` / `H:MM:SS` (플레이어 표시. 0시면 시간 생략), false(기본) — `HH:MM:SS,mmm`
 */
const formatTime = (ms: number, slim = false): string => {
  const { hours, minutes, seconds, milli } = splitTimeParts(ms);
  if (slim) {
    if (hours > 0) return `${hours}:${pad(minutes, 2)}:${pad(seconds, 2)}`;
    return `${minutes}:${pad(seconds, 2)}`;
  }
  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)},${milli}`;
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

export { formatTime, parseTimecode, secondsToMs };
