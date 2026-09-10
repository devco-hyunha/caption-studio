import { create } from 'zustand';

interface AppUiState {
	isNavOpen: boolean;
	setNavOpen: (isOpen: boolean) => void;
	toggleNav: () => void;
}

/** Placeholder store for Start setup — domain stores will replace this. */
export const useAppUiStore = create<AppUiState>((set) => ({
	isNavOpen: false,
	setNavOpen: (isOpen) => set({ isNavOpen: isOpen }),
	toggleNav: () => set((state) => ({ isNavOpen: !state.isNavOpen })),
}));
