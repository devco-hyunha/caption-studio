import {
	isTextTarget as checkIsTextTarget,
	isTimeTarget as checkIsTimeTarget,
} from '../helpers/targets.js';

/**
 * 시트 가변 상태를 생성한다.
 * DOM 핸들(root, panel, body 등)과 edit/move 등 행위 객체는 포함하지 않는다.
 *
 * @returns {object}
 */
const createSheetState = () => {
	const sheet = {
		// document
		language: 'KRCC',
		format: null,
		timelines: [],

		// selection
		current: {},
		active: null,
		selectedRows: [],
		searchHits: [],
		focus: null,
		shift: false,

		// layout (derived — convert / stateUpdate / Draw)
		height: 0,
		rowInfo: [],
		errorRows: [],
		canvas: {
			width: 0,
			height: 0,
			/** 그리기 버퍼 높이. `height * 3` */
			get bufferHeight() {
				return this.height * 3;
			},
		},
		scroll: 0,
		offset: 0,
		/** render 강제 여부. true면 스크롤 위치가 같아도 다시 그린다. */
		needsRedraw: false,

		/** 셀 타이포 — fontSize 변경 시 lineHeight · padding도 함께 갱신 */
		cellStyle: {
			fontSize: 14,
			lineHeight: 23,
			padding: 3,
		},
		columnMetrics: null,

		/** 마지막 행 인덱스. `timelines.length - 1` (빈 배열이면 -1) */
		get lastIndex() {
			return this.timelines.length - 1;
		},

		/** 현재 셀이 text / memo 인지 */
		get isTextTarget() {
			return checkIsTextTarget(this.current.target);
		},

		/** 현재 셀이 starttime / endtime 인지 */
		get isTimeTarget() {
			return checkIsTimeTarget(this.current.target);
		},
	};

	/**
	 * 뷰포트 크기로부터 canvas 메트릭을 설정한다.
	 *
	 * @param {{ width: number, height: number }} size
	 */
	sheet.setCanvas = ({ width, height }) => {
		sheet.canvas.width = width;
		sheet.canvas.height = height;
	};

	return sheet;
};

export { createSheetState };
