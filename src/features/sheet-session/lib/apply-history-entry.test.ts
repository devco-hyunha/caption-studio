import { describe, expect, it } from 'vitest';
import { timelineSnapshotEquals } from './apply-history-entry';

describe('timelineSnapshotEquals', () => {
	it('동일 스냅샷이면 true', () => {
		expect(
			timelineSnapshotEquals(
				{ start: 1, end: 2, text: 'a', memo: '' },
				{ start: 1, end: 2, text: 'a', memo: '' },
			),
		).toBe(true);
	});

	it('다르면 false — undo update 가드용', () => {
		expect(
			timelineSnapshotEquals(
				{ start: 1, end: 2, text: 'a', memo: '' },
				{ start: 1, end: 2, text: 'b', memo: '' },
			),
		).toBe(false);
	});
});
