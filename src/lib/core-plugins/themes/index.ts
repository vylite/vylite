import { catchError } from '$lib/core/errors/catch-error';
import { Plugin } from '$lib/core/plugin/plugin';
import type { PluginManifest } from '$lib/core/plugin/types';
import type { Space } from '$lib/core/spaces/space';
import { RovingList } from '$lib/plugin-kit/roving-list.svelte';
import { svelteSlot } from '$lib/plugin-kit/svelte-slot';
import { applyTheme, getTheme, THEMES, type Theme } from './shared/theme';
import Themes from './Themes.svelte';

export const manifest: PluginManifest = { name: 'themes', author: 'vylite' };

export default class ThemesPlugin extends Plugin<Space | null> {
	private _closePicker: (() => void) | undefined;

	onload(): void {
		const saved = getTheme(this.app.appearance.get().theme);
		if (saved) applyTheme(saved);

		this.addCleanup(
			this.app.commands.register({
				trigger: 'themes',
				description: 'change theme',
				run: () => {
					this._openPicker();
				}
			})
		);
	}

	private _openPicker(): void {
		const list = new RovingList<Theme>({
			getItems: () => THEMES,
			onOpen: (theme) => void this._keep(theme)
		});

		const savedName = this.app.appearance.get().theme;
		const savedIndex = THEMES.findIndex((theme) => theme.name === savedName);
		list.select(Math.max(0, savedIndex));

		this._closePicker = this.app.ui.rail.add({
			title: 'themes',
			content: svelteSlot(Themes, { app: this.app, list }),
			focused: true,
			onKeydown: (event) => list.onKeydown(event)
		});
	}

	private async _keep(theme: Theme): Promise<void> {
		const [error] = await catchError(() =>
			this.app.appearance.update((appearance) => ({ ...appearance, theme: theme.name }))
		);
		if (error) this.app.errors.report(error);

		this._closePicker?.();
	}
}
