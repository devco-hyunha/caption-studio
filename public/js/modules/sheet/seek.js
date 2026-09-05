import { clone } from '../utils/index.js';

/**
 * 행 오프셋 스크롤 · 시간으로 행 검색.
 *
 * @param {{ sheet: object }} deps
 * @returns {{ rowOffset: Function, timeSearch: Function }}
 */
const createSeek = ({ sheet }) => {
	const rowOffset = (currentIndex) => {
		let offset = 0;
		for (let index = 0; index < currentIndex; index++) {
			offset += sheet.rowInfo[index].height;
		}
		sheet.offset = offset - 1;
		sheet.body.scrollTop = sheet.offset;
		sheet.current.row = currentIndex;
		sheet.move.event();
	};

	const timeSearch = (sec) => {
		const { timelines } = sheet;
		let index = timelines.findIndex((row, eq, data) => {
			if (!row.end) row.end = data[eq + 1] ? data[eq + 1].start : 999999;
			return row.start <= sec && row.end > sec;
		});
		let visible = true;
		if (index === -1) {
			index = timelines.findIndex((row) => row.start > sec);
			visible = false;
		}
		const timeline = clone(timelines[index]);
		const rowInfo = sheet.rowInfo[index];
		if (rowInfo?.starttime) timeline.starttime = rowInfo.starttime;
		return { index, visible, timeline };
	};

	return { rowOffset, timeSearch };
};

export { createSeek };
