// 1. 기본 상태 및 즉시 초기화 모듈
import { createSheetState } from './state/state.js';
import { createGetColWidth } from './layout/getColWidth.js';
import { setCellStyle } from './layout/columns.js';
import { createTrigger } from './trigger/trigger.js';
import { createMove } from './move.js';
import { createAutoSave } from './autoSave.js';

// 2. 코어 라이프사이클 & 렌더링
import { createStateUpdate } from './state/stateUpdate.js';
import { createConvert } from './convert/convert.js';
import { createRender } from './render/render.js';
import { createSet } from './set.js';

// 3. 데이터 변경(Mutate) & 히스토리
import {
	createCommand,
	createUpdateTarget,
	createUpdate,
	createInsert,
	createRemove,
} from './mutate/index.js';
import { createHistory } from './history.js';

// 4. 편집, 다중 선택, 검색, 탐색, 설정
import { createEdit } from './edit/index.js';
import { createMultiple } from './multiple.js';
import { createSearch } from './search.js';
import { createSeek } from './seek.js';
import { createConfig } from './config.js';

// 5. DOM & 이벤트 바인딩
import { createInit } from './init/index.js';

/**
 * @typedef {Object} SheetInitDeps
 * @property {{ t: (key: string) => string }} i18n
 * @property {{ smi: string[], srt: string[] }} header
 * @property {object} ui - Interface
 * @property {{ encode: Function }} subtitle
 */

/**
 * sheet 도메인 객체를 생성한다. `initialize()` 호출 전까지 `stateUpdate` / `convert` / `render` / `set` / `init` / `edit` / `command` / `update` / `insert` / `remove` / `undo` / `redo` / `search` / `rowOffset` / `timeSearch` / `multiple` / `config`는 없다.
 *
 * @returns {object & { initialize: (deps: SheetInitDeps) => void }}
 */
const sheetModule = () => {
	const sheet = createSheetState();
	sheet.getColWidth = createGetColWidth(sheet);
	sheet.trigger = createTrigger(sheet);
	sheet.move = createMove(sheet);
	sheet.autoSave = createAutoSave(sheet);

	/**
	 * 레이아웃·변환·렌더·set·init·edit·mutate·history·search·seek·multiple·config API를 sheet에 주입한다.
	 * DOM 핸들이 caption.js에 붙은 뒤, `Do.on('ready')`에서 호출한다.
	 *
	 * @param {SheetInitDeps} deps
	 */
	sheet.initialize = ({ i18n, header, ui, subtitle }) => {
		// 코어 라이프사이클 & 렌더링
		sheet.stateUpdate = createStateUpdate({ sheet });
		sheet.convert = createConvert({ sheet });
		sheet.render = createRender({ sheet });
		sheet.set = createSet({ sheet, i18n, header });

		// 데이터 변경(Mutate) & 히스토리
		sheet.updateTarget = createUpdateTarget({ sheet });
		sheet.update = createUpdate({ sheet });
		sheet.insert = createInsert({ sheet });
		sheet.remove = createRemove({ sheet });
		sheet.command = createCommand({ sheet });

		const { undo, redo } = createHistory({ sheet });
		sheet.undo = undo;
		sheet.redo = redo;

		// 편집 & 다중 선택
		sheet.edit = createEdit({ sheet, subtitle, ui });
		sheet.multiple = createMultiple({ sheet });

		// 검색 & 탐색
		sheet.search = createSearch({ sheet });

		const { rowOffset, timeSearch } = createSeek({ sheet });
		sheet.rowOffset = rowOffset;
		sheet.timeSearch = timeSearch;

		// 환경 설정 & 스타일
		sheet.config = createConfig({ sheet, i18n, ui });
		sheet.setCellStyle = (style) => setCellStyle(sheet, style);

		// DOM & 이벤트 바인딩 (모든 하위 API 주입 후 마지막에 바인딩)
		sheet.init = createInit({ sheet, ui, i18n });
	};

	return sheet;
};

export default sheetModule;
