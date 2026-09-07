/** 탭명 = SMI Class. 영문·숫자·_ 만 허용 */
const TAB_NAME_RE = /^[A-Za-z0-9_]+$/;

/**
 * @param {unknown} name
 * @returns {boolean}
 */
const isValidTabName = (name) => typeof name === 'string' && TAB_NAME_RE.test(name);

/**
 * @param {string[]} existingNames
 * @returns {string}
 */
const createUniqueSheetName = (existingNames) => {
	const used = new Set(existingNames);
	let n = 1;
	while (used.has(`sheet${n}`)) n += 1;
	return `sheet${n}`;
};

/**
 * 규칙 위반 이름은 sheet1로 승격한다 (타임라인은 유지).
 *
 * @param {unknown} name
 * @returns {string}
 */
const normalizeTabName = (name) => (isValidTabName(name) ? name : 'sheet1');

export { TAB_NAME_RE, isValidTabName, createUniqueSheetName, normalizeTabName };
