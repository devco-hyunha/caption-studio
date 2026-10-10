import type { Sheet, SheetTimelineItem, SheetsState } from '../types';
import { createTabName, normalizeTabName } from './tab-names';

const EMPTY_TIMELINE: SheetTimelineItem = Object.freeze({
	start: 0,
	end: 0,
	text: '',
	memo: '',
});

/** 타임라인 복사 — 빈 값은 `EMPTY_TIMELINE` 기준 */
const cloneTimeline = (timeline: SheetTimelineItem = EMPTY_TIMELINE): SheetTimelineItem => ({
	start: timeline.start,
	end: timeline.end,
	sync: timeline.sync,
	text: timeline.text,
	memo: timeline.memo,
});

/** 빈 시트 생성 — 행 1개, 다중 선택 off */
const createSheet = (name = 'sheet1'): Sheet => ({
	name: normalizeTabName(name),
	timelines: [cloneTimeline()],
	smiName: '',
	smiLang: '',
	scroll: 0,
	current: {},
	selectedRows: [],
	multipleActive: false,
	multipleStart: null,
});

/** 부분 시트 → 완전 시트. 빠진 필드·타입 오류는 기본값으로 채움 */
const normalizeSheet = (sheet: Partial<Sheet> | null | undefined): Sheet => {
	const timelines =
		Array.isArray(sheet?.timelines) && sheet.timelines.length > 0
			? sheet.timelines.map((timeline) => cloneTimeline(timeline))
			: [cloneTimeline()];

	return {
		name: normalizeTabName(sheet?.name),
		timelines,
		smiName: typeof sheet?.smiName === 'string' ? sheet.smiName : '',
		smiLang: typeof sheet?.smiLang === 'string' ? sheet.smiLang : '',
		scroll: typeof sheet?.scroll === 'number' ? sheet.scroll : 0,
		current: sheet?.current && typeof sheet.current === 'object' ? { ...sheet.current } : {},
		selectedRows: Array.isArray(sheet?.selectedRows) ? [...sheet.selectedRows] : [],
		multipleActive: sheet?.multipleActive === true,
		multipleStart: typeof sheet?.multipleStart === 'number' ? sheet.multipleStart : null,
	};
};

/** 구 Timeline[] 및 신 스키마를 `{ active, sheets }`로 통일. 옛 JSON의 `version`은 무시 */
const normalizeState = (raw: unknown): SheetsState => {
	if (Array.isArray(raw)) {
		const timelines =
			raw.length > 0
				? raw.map((item) => cloneTimeline(item as SheetTimelineItem))
				: [cloneTimeline()];
		return {
			active: 0,
			sheets: [normalizeSheet({ name: 'sheet1', timelines })],
		};
	}

	if (raw && typeof raw === 'object' && Array.isArray((raw as SheetsState).sheets)) {
		const source = raw as Partial<SheetsState>;
		if (!source.sheets || source.sheets.length === 0) {
			return { active: 0, sheets: [createSheet('sheet1')] };
		}

		const sheets = source.sheets.map((sheet) => normalizeSheet(sheet));
		const names: string[] = [];
		sheets.forEach((sheet) => {
			if (names.includes(sheet.name)) {
				sheet.name = createTabName(names);
			}
			names.push(sheet.name);
		});

		let active = typeof source.active === 'number' ? source.active : 0;
		if (active < 0 || active >= sheets.length) active = 0;

		return { active, sheets };
	}

	return {
		active: 0,
		sheets: [createSheet('sheet1')],
	};
};

const createState = (): SheetsState => normalizeState(null);

export {
	cloneTimeline,
	createSheet,
	createState,
	normalizeSheet,
	normalizeState,
};
