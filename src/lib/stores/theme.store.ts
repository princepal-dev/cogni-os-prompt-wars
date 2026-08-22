import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'system';

function createThemeStore() {
	let initialTheme: Theme = 'dark';

	if (browser) {
		const stored = localStorage.getItem('cognitiveos-theme') as Theme | null;
		if (stored === 'light' || stored === 'dark' || stored === 'system') {
			initialTheme = stored;
		} else {
			initialTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		}
	}

	const { subscribe, set } = writable<Theme>(initialTheme);

	function applyTheme(t: Theme) {
		if (!browser) return;

		let effectiveDark = false;
		if (t === 'dark') {
			effectiveDark = true;
		} else if (t === 'light') {
			effectiveDark = false;
		} else {
			effectiveDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		}

		if (effectiveDark) {
			document.documentElement.classList.add('dark');
			document.documentElement.setAttribute('data-theme', 'dark');
			document.documentElement.style.colorScheme = 'dark';
		} else {
			document.documentElement.classList.remove('dark');
			document.documentElement.setAttribute('data-theme', 'light');
			document.documentElement.style.colorScheme = 'light';
		}

		localStorage.setItem('cognitiveos-theme', t);
	}

	return {
		subscribe,
		setTheme: (t: Theme) => {
			set(t);
			applyTheme(t);
		},
		toggleTheme: () => {
			if (!browser) return;
			const isCurrentlyDark = document.documentElement.classList.contains('dark');
			const newTheme: Theme = isCurrentlyDark ? 'light' : 'dark';
			set(newTheme);
			applyTheme(newTheme);
		},
		init: () => {
			if (!browser) return;
			const stored = (localStorage.getItem('cognitiveos-theme') as Theme) || 'dark';
			applyTheme(stored);

			// Listen for system theme changes if in system mode
			window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
				const current = localStorage.getItem('cognitiveos-theme') as Theme;
				if (current === 'system') {
					applyTheme('system');
				}
			});
		}
	};
}

export const themeStore = createThemeStore();
