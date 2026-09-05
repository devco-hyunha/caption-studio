import { clone } from '../../utils/index.js';
import { EMPTY_TIMELINE } from '../constants.js';
import { trackEvent } from '../../analytics/track.js';
import { closeSearchPanel } from '../helpers/closeSearchPanel.js';

/**
 * 시트 편집 명령(insert / remove / update / multi) API.
 *
 * @param {{ sheet: object }} deps
 * @returns {{ insert: Function, remove: Function, update: Function, multi: Function }}
 */
const createCommand = ({ sheet }) => {
	const command = {
		insert: (current) => {
			closeSearchPanel(sheet);
			const position = current || { row: sheet.current.row, col: sheet.current.col };
			if (position.col) sheet.current.col = position.col;

			const insert = [];
			insert.index = position.row + 1;
			insert.data = clone(EMPTY_TIMELINE);

			sheet.edit.log({
				command: 'insert',
				id: insert.index,
				after: insert.data,
				before: null,
				current: position,
			});
			trackEvent({ category: 'Sheet', action: 'insert', label: 'Sheet Edit' });
			sheet.insert(insert);
		},

		remove: (current) => {
			closeSearchPanel(sheet);
			if (sheet.lastIndex === 0) {
				command.update(current, clone(EMPTY_TIMELINE));
				trackEvent({ category: 'Sheet', action: 'empty', label: 'Sheet Edit' });
				return;
			}
			const backup = sheet.remove(current);
			sheet.edit.log({
				command: 'remove',
				id: current.row,
				after: null,
				before: backup,
				current,
			});
			trackEvent({ category: 'Sheet', action: 'remove', label: 'Sheet Edit' });
		},

		update: (position, data) => {
			closeSearchPanel(sheet);
			sheet.current.data = data;
			const backup = sheet.update(position, data);
			sheet.edit.log({
				command: 'update',
				id: position.row,
				after: data,
				before: backup,
				current: { row: position.row, col: position.col },
			});
			trackEvent({ category: 'Sheet', action: 'update', label: 'Sheet Edit' });
		},

		multi: (cmd, currents, backups) => {
			closeSearchPanel(sheet);
			sheet.edit.log({
				command: 'multi.' + cmd,
				id: null,
				after: currents,
				before: backups,
				current: { row: sheet.current.row, col: sheet.current.col },
			});
			trackEvent({ category: 'Sheet', action: 'update', label: 'Sheet Edit' });
		},
	};

	return command;
};

export { createCommand };
