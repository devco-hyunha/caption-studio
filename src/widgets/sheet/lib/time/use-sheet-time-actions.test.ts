import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSheetStore } from '@/entities/subtitle-sheet';
import { useSheetTimeActions } from './use-sheet-time-actions';

const resetStore = () => {
	useSheetStore.setState({
		active: 0,
		sheets: [
			{
				name: 'sheet1',
				timelines: [
					{ start: 1000, end: 2000, text: 'A', memo: '' },
					{ start: 3000, end: 4000, text: 'B', memo: '' },
				],
				smiName: '',
				smiLang: '',
				scroll: 0,
				current: {},
				selectedRows: [],
				multipleActive: false,
				multipleStart: null,
			},
		],
	});
};

const renderTime = (overrides: Partial<Parameters<typeof useSheetTimeActions>[0]> = {}) => {
	resetStore();
	const closeSearchPanel = vi.fn();
	const isTimeTarget = vi.fn(() => true);
	const hook = renderHook(
		(props: Parameters<typeof useSheetTimeActions>[0]) => useSheetTimeActions(props),
		{
			initialProps: {
				currentRowIndex: 1,
				currentColumn: 'starttime' as const,
				isTimeTarget,
				closeSearchPanel,
				...overrides,
			},
		},
	);
	return { hook, closeSearchPanel };
};

describe('useSheetTimeActions closeSearchPanel', () => {
	beforeEach(() => {
		resetStore();
	});

	it('timePlus — mutate 직전 closeSearchPanel 호출', () => {
		const { hook, closeSearchPanel } = renderTime();

		act(() => hook.result.current.timePlus());
		expect(closeSearchPanel).toHaveBeenCalledTimes(1);
	});

	it('timeMinus — mutate 직전 closeSearchPanel 호출', () => {
		const { hook, closeSearchPanel } = renderTime();

		act(() => hook.result.current.timeMinus());
		expect(closeSearchPanel).toHaveBeenCalledTimes(1);
	});

	it('time 타깃 아니어도 closeSearchPanel은 호출 (mutate 직전 게이트)', () => {
		const { hook, closeSearchPanel } = renderTime({ isTimeTarget: () => false });

		act(() => hook.result.current.timePlus());
		expect(closeSearchPanel).toHaveBeenCalledTimes(1);
	});
});
