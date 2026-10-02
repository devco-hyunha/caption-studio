import { useEffect, useRef } from 'react';
import type { UseSheetShortkeyParams } from '../types';
import { useShortkeyStore } from '../model/use-shortkey-store';
import { bindPrintableEditCallback, registerSheetNavigationKeys } from './bind-sheet-keys';
import { createShortcuts } from './shortcuts';

/**
 * `/edit` 시트용 shortkey 수명주기.
 * 위젯이 getActions로 시트 동작 API만 주입한다 (feature → widget import 없음).
 * masks 변경 시 removeAll + 재등록.
 */
const useSheetShortkey = ({ getActions }: UseSheetShortkeyParams) => {
	const getActionsRef = useRef(getActions);

	useEffect(() => {
		getActionsRef.current = getActions;
	}, [getActions]);

	useEffect(() => {
		const shortcuts = createShortcuts();
		const resolveActions = () => getActionsRef.current();

		const rebind = () => {
			shortcuts.removeAll();
			registerSheetNavigationKeys(shortcuts, resolveActions);
			bindPrintableEditCallback(shortcuts, resolveActions);
		};

		rebind();
		shortcuts.start();

		const unsubscribe = useShortkeyStore.subscribe((state, prev) => {
			if (state.masks === prev.masks) return;
			rebind();
		});

		return () => {
			unsubscribe();
			shortcuts.stop();
			shortcuts.removeAll();
			shortcuts.callback(null);
		};
	}, []);
};

export { useSheetShortkey };
