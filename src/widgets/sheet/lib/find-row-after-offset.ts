import type { RowHeightInfo, SheetStartRow } from '../types';

/**
 * 누적 높이가 `currentOffset`을 넘는 첫 행.
 * 반환 시점의 `offset`에는 해당 행 높이가 아직 더해지지 않았다.
 */
const findRowAfterOffset = (
	rowInfo: readonly RowHeightInfo[],
	currentOffset: number,
): SheetStartRow | undefined => {
	if (!rowInfo.length) return;

	let offset = 0;

	for (let index = 0; index < rowInfo.length; index++) {
		const height = rowInfo[index]?.height ?? 0;
		if (!height) break;

		if (offset > currentOffset) {
			return { offset, height, index };
		}

		offset += height;
	}
};

export { findRowAfterOffset };
