/**
 * `rowInfo` 높이를 위에서부터 누적해, 누적값이 `currentOffset`을 넘는 첫 행을 찾는다.
 * 반환 시점의 `offset`에는 해당 행 높이가 아직 더해지지 않았다 (행 시작 Y).
 *
 * @param {{ height: number }[]} rowInfo
 * @param {number} currentOffset
 * @returns {{ offset: number, height: number, index: number } | undefined}
 */
const findRowAfterOffset = (rowInfo, currentOffset) => {
	if (!rowInfo?.length) return;

	let offset = 0;

	for (let index = 0; index < rowInfo.length; index++) {
		const height = rowInfo[index].height;
		if (!height) break;

		if (offset > currentOffset) {
			return { offset, height, index };
		}

		offset += height;
	}
};

export { findRowAfterOffset };
