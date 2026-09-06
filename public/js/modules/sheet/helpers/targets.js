/** 텍스트·메모 셀 타깃 */
const TEXT_TARGETS = Object.freeze(['text', 'memo']);

/** 시간 셀 타깃 */
const TIME_TARGETS = Object.freeze(['starttime', 'endtime']);

/**
 * @param {string} [target]
 * @returns {boolean}
 */
const isTextTarget = (target) => TEXT_TARGETS.includes(target);

/**
 * @param {string} [target]
 * @returns {boolean}
 */
const isTimeTarget = (target) => TIME_TARGETS.includes(target);

export {
	TEXT_TARGETS,
	TIME_TARGETS,
	isTextTarget,
	isTimeTarget,
};
