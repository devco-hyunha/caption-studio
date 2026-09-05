/** 빈 타임라인 행 템플릿. timelines에 넣을 때는 반드시 clone 한다. */
const EMPTY_TIMELINE = Object.freeze({
	start: 0,
	end: 0,
	text: '',
	memo: '',
});

/** memo 셀 max-height에서 빼는 보정(px) */
const MEMO_CLAMP_OFFSET = 3;

export { EMPTY_TIMELINE, MEMO_CLAMP_OFFSET };
