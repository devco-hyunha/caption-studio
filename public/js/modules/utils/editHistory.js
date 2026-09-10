/**
 * 탭(시트)별 undo 스택. `activeSheetIndex`로 활성 스택을 고른다.
 * 문서(`sheets[i].history`)에 복사하지 않는다.
 */
const createEmptyStack = () => ({
	entries: [],
	index: -1,
});

const createEditHistory = () => {
	let activeSheetIndex = 0;
	/** @type {{ entries: object[], index: number }[]} */
	let stacks = [createEmptyStack()];

	const active = () => {
		if (!stacks[activeSheetIndex]) {
			stacks[activeSheetIndex] = createEmptyStack();
		}
		return stacks[activeSheetIndex];
	};

	const history = {
		get entries() {
			return active().entries;
		},
		get index() {
			return active().index;
		},

		/**
		 * 활성 탭 인덱스를 맞춘다. 스택이 없으면 빈 스택을 만든다.
		 *
		 * @param {number} index
		 */
		setActiveSheetIndex(index) {
			activeSheetIndex = Math.max(0, index);
			active();
		},

		/**
		 * 시트 개수에 맞게 스택을 맞추고 활성 인덱스를 설정한다.
		 *
		 * @param {number} sheetCount
		 * @param {number} activeIndex
		 */
		resetForSheets(sheetCount, activeIndex = 0) {
			const count = Math.max(1, sheetCount);
			stacks = Array.from({ length: count }, () => createEmptyStack());
			activeSheetIndex = Math.min(Math.max(0, activeIndex), count - 1);
		},

		/** 탭 추가 시 빈 스택을 끝에 붙인다. */
		addStack() {
			stacks.push(createEmptyStack());
		},

		/**
		 * 탭 삭제 시 해당 스택을 제거하고 인덱스를 보정한다.
		 *
		 * @param {number} index
		 */
		removeStack(index) {
			if (stacks.length <= 1) {
				stacks[0] = createEmptyStack();
				activeSheetIndex = 0;
				return;
			}
			if (index < 0 || index >= stacks.length) return;
			stacks.splice(index, 1);
			if (index < activeSheetIndex) activeSheetIndex -= 1;
			else if (index === activeSheetIndex) {
				activeSheetIndex = Math.min(activeSheetIndex, stacks.length - 1);
			}
		},

		prev() {
			const stack = active();
			if (stack.index >= -1) {
				stack.index -= 1;
			}
			return stack.entries[stack.index + 1];
		},
		next() {
			const stack = active();
			if (stack.index < stack.entries.length - 1) {
				stack.index += 1;
			}
			return stack.entries[stack.index];
		},
		current() {
			const stack = active();
			return stack.entries[stack.index] === undefined ? [] : stack.entries[stack.index];
		},
		latest() {
			const stack = active();
			stack.index = stack.entries.length - 1;
			return stack.entries[stack.index] === undefined ? [] : stack.entries[stack.index];
		},
		push(entry) {
			const stack = active();
			if (stack.index !== stack.entries.length - 1) {
				stack.entries = stack.entries.slice(0, stack.index + 1);
			}
			stack.entries.push(entry);
			stack.index = stack.entries.length - 1;
			return false;
		},
		clear() {
			const stack = active();
			stack.index = -1;
			stack.entries = [];
		},
	};

	return history;
};

const editHistory = createEditHistory();

export { editHistory };
