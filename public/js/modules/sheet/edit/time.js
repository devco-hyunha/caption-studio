import { clone } from '../../utils/index.js';

/**
 * 타임라인 시간·다중 클립 조작.
 *
 * @param {{ edit: object, sheet: object, subtitle: { encode: (el: Element) => string } }} deps
 * @returns {{ multiClip: Function, timePlus: Function, timeMinus: Function }}
 */
const createTime = ({ edit, sheet, subtitle }) => {
	const resolveJump = (jump) => {
		const fromArg = jump != null && jump !== '' ? Number.parseInt(jump, 10) : NaN;
		if (Number.isFinite(fromArg)) return fromArg;
		const fromConfig = Number.parseInt(sheet.config.jump, 10);
		return Number.isFinite(fromConfig) ? fromConfig : 0;
	};

	const multiClip = (cmd, jump) => {
		const step = resolveJump(jump);
		const backups = [];
		const currents = [];
		sheet.trigger.input.classList.add('multi-clip');

		sheet.selectedRows.forEach((rowIndex) => {
			if (rowIndex < 0) return;

			const timeline = sheet.timelines[rowIndex];
			backups.push({ index: rowIndex, data: clone(timeline) });

			if (cmd === 'plus') {
				timeline.start += step;
				if (timeline.end) timeline.end += step;
			} else if (cmd === 'minus') {
				timeline.start -= step;
				if (timeline.start < 0) timeline.start = 0;
				if (timeline.end) {
					timeline.end -= step;
					if (timeline.end < 0) timeline.end = 0;
				}
			} else {
				sheet.trigger.input.innerHTML = timeline.text;
				sheet.trigger.input.focus();
				edit.cmd('selectAll');
				edit.cmd(cmd);
				timeline.text = subtitle.encode(sheet.trigger.input);
			}

			currents.push({ index: rowIndex, data: clone(timeline) });
		});

		sheet.trigger.input.classList.remove('multi-clip');
		sheet.convert();
		sheet.needsRedraw = true;
		sheet.render();
		sheet.command.multi(cmd, currents, backups);
	};

	const timePlus = (jump) => {
		const step = resolveJump(jump);
		const { current } = sheet;
		const clip = clone(sheet.timelines[current.row]);
		if (current.target === 'starttime') clip.start += step;
		else if (current.target === 'endtime') clip.end += step;
		sheet.command.update(current, clip);
	};

	const timeMinus = (jump) => {
		const step = resolveJump(jump);
		const { current } = sheet;
		const clip = clone(sheet.timelines[current.row]);
		if (current.target === 'starttime' && clip.start > 0) {
			clip.start -= step;
			if (clip.start < 0) clip.start = 0;
			sheet.command.update(current, clip);
		} else if (current.target === 'endtime' && clip.end > 0) {
			clip.end -= step;
			if (clip.end < 0) clip.end = 0;
			sheet.command.update(current, clip);
		}
	};

	return { multiClip, timePlus, timeMinus };
};

export { createTime };
