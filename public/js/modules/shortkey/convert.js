const MODIFIER_KEYS = new Set(['control', 'alt', 'shift', 'meta']);

/**
 * event.code에 해당하는 특수키 mask 토큰을 찾는다.
 *
 * @param {string} eventCode
 * @param {Record<string, string | string[]>} codeMap
 * @returns {string | undefined}
 */
const findSpecialName = (eventCode, codeMap) => {
	const matched = Object.entries(codeMap).find(([, code]) => {
		if (Array.isArray(code)) return code.includes(eventCode);
		return code === eventCode;
	});
	if (!matched) return;
	const [name] = matched;
	return name;
};

/**
 * event.code → mask용 키 이름 (특수키·문자·숫자).
 *
 * @param {KeyboardEvent} event
 * @param {Record<string, string | string[]>} codeMap
 * @returns {string | false}
 */
const resolveKeyName = (event, codeMap) => {
	const specialName = findSpecialName(event.code, codeMap);
	if (specialName) return specialName;

	const digitMatch = /^Digit([0-9])$/.exec(event.code);
	if (digitMatch) return digitMatch[1];

	const letterMatch = /^Key([A-Z])$/.exec(event.code);
	if (letterMatch) return letterMatch[1].toLowerCase();

	const eventKey = (event.key || '').toLowerCase();
	if (!eventKey || eventKey === 'unidentified') return false;
	if (MODIFIER_KEYS.has(eventKey)) return false;
	return eventKey;
};

/**
 * 키보드 이벤트를 Shortcuts mask 문자열로 변환한다.
 *
 * @param {KeyboardEvent} event
 * @param {Record<string, string | string[]>} [codeMap]
 * @returns {string}
 */
const convert = (event, codeMap) => {
	const keyName = resolveKeyName(event, codeMap || {});

	const mask = [
		event.ctrlKey && 'ctrl',
		event.altKey && 'alt',
		event.shiftKey && 'shift',
		keyName,
	].filter(Boolean).join('+');

	return keyName ? mask : '';
};

export { convert };
