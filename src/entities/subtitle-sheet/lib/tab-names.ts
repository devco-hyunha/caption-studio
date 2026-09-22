/** 탭명 = SMI Class. 영문·숫자·_ 만 허용 */
const TAB_NAME_RE = /^[A-Za-z0-9_]+$/;

const isValidTabName = (name: unknown): name is string =>
	typeof name === 'string' && TAB_NAME_RE.test(name);

/** 규칙 위반 이름은 sheet1로 승격 */
const normalizeTabName = (name: unknown) => (isValidTabName(name) ? name : 'sheet1');

const createTabName = (existingNames: string[]) => {
	const used = new Set(existingNames);
	let index = 1;
	let name = `sheet${index}`;
	while (used.has(name)) {
		index += 1;
		name = `sheet${index}`;
	}
	return name;
};

const createCopyName = (sourceName: string, existingNames: string[]) => {
	const used = new Set(existingNames);
	const base = isValidTabName(sourceName) ? sourceName : 'sheet';
	let name = `${base}_copy`;
	let index = 2;
	while (used.has(name)) {
		name = `${base}_copy${index}`;
		index += 1;
	}
	return name;
};

export {
	TAB_NAME_RE,
	isValidTabName,
	normalizeTabName,
	createTabName,
	createCopyName,
};
