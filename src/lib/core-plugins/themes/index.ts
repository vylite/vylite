import { Plugin } from '$lib/core/plugin/plugin';
import type { PluginManifest } from '$lib/core/plugin/types';
import type { Space } from '$lib/core/spaces/space';
import { applyTheme, getTheme } from './shared/theme';

export const manifest: PluginManifest = { name: 'themes', author: 'vylite' };

export default class ThemesPlugin extends Plugin<Space | null> {
	onload(): void {
		const saved = getTheme(this.app.appearance.get().theme);
		if (saved) applyTheme(saved);
	}
}
