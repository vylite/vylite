import themes from './themes.json';

export type Theme = {
	name: string;
	colors: Record<string, string>;
};

export const THEMES: readonly Theme[] = themes;

export function getTheme(name: string): Theme | undefined {
	return THEMES.find((theme) => theme.name === name);
}

export function applyTheme(theme: Theme): void {
	for (const [token, value] of Object.entries(theme.colors)) {
		document.documentElement.style.setProperty(`--color-${token}`, value);
	}
}
