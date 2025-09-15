type Theme = 'light' | 'dark' | 'system';

interface ThemeStoreState {
	getTheme: () => Theme;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
	subscribe: (listener: () => void) => () => void;
}

let currentTheme: Theme = 'system';
const listeners = new Set<() => void>();

function notifyListeners() {
	for (const listener of listeners) listener();
}

const store: ThemeStoreState = {
	getTheme: () => currentTheme,
	setTheme: (theme: Theme) => {
		currentTheme = theme;
		notifyListeners();
	},
	toggleTheme: () => {
		currentTheme = currentTheme === 'light' ? 'dark' : currentTheme === 'dark' ? 'system' : 'light';
		notifyListeners();
	},
	subscribe: (listener: () => void) => {
		listeners.add(listener);
		return () => listeners.delete(listener);
	}
};

export function useThemeStore() {
	// Defer importing React to avoid SSR issues if any
	const { useSyncExternalStore } = require('react') as typeof import('react');
	const theme = useSyncExternalStore(store.subscribe, store.getTheme, store.getTheme);
	return {
		theme,
		setTheme: store.setTheme,
		toggleTheme: store.toggleTheme
	};
}