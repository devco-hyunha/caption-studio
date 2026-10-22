import { TAB_COPY_SUFFIX, TAB_NAME_PREFIX } from '../constants';

/** 탭명 = SMI Class. 영문·숫자·_ 만 허용 */
const isValidTabName = (name: unknown): name is string => {
  const tabNameRegex = /^[A-Za-z0-9_]+$/;
  return typeof name === 'string' && tabNameRegex.test(name);
};

/** 규칙 위반 이름은 첫 기본 탭명으로 승격 */
const normalizeTabName = (name: unknown) => (isValidTabName(name) ? name : createTabName([]));

const createTabName = (existingNames: string[]) => {
  const used = new Set(existingNames);
  let index = 1;
  let name = `${TAB_NAME_PREFIX}${index}`;
  while (used.has(name)) {
    index += 1;
    name = `${TAB_NAME_PREFIX}${index}`;
  }
  return name;
};

const createCopyName = (sourceName: string, existingNames: string[]) => {
  const used = new Set(existingNames);
  const base = isValidTabName(sourceName) ? sourceName : TAB_NAME_PREFIX;
  let name = `${base}${TAB_COPY_SUFFIX}`;
  let index = 2;
  while (used.has(name)) {
    name = `${base}${TAB_COPY_SUFFIX}${index}`;
    index += 1;
  }
  return name;
};

export { isValidTabName, normalizeTabName, createTabName, createCopyName };
