import { catchError } from '$lib/core/errors/catch-error';
import { Plugin } from '$lib/core/plugin/plugin';
import type { PluginManifest } from '$lib/core/plugin/types';
import type { Space } from '$lib/core/spaces/space';
import type { Page } from '$lib/core/ui/shared/types';
import { RovingList } from '$lib/plugin-kit/roving-list.svelte';
import { svelteSlot } from '$lib/plugin-kit/svelte-slot';
import Settings from './Settings.svelte';
import { TOGGLES, type Toggle } from './toggles';

export const manifest: PluginManifest = { name: 'settings', author: 'vylite' };

export default class SettingsPlugin extends Plugin<Space | null> {
	onload(): void {
		this.addCleanup(
			this.app.commands.register({
				trigger: 'settings',
				description: 'app options',
				run: () => this._getPage()
			})
		);
	}

	private _getPage(): Page {
		const list = new RovingList<Toggle>({
			getItems: () => TOGGLES,
			onOpen: (toggle) => void this._flip(toggle)
		});

		return {
			label: 'settings',
			nest: {
				content: svelteSlot(Settings, { app: this.app, list }),
				onKeydown: (event) => list.onKeydown(event)
			}
		};
	}

	private async _flip(toggle: Toggle): Promise<void> {
		const [error] = await catchError(() =>
			this.app.settings.update((settings) => ({
				...settings,
				[toggle.key]: !settings[toggle.key]
			}))
		);
		if (error) this.app.errors.report(error);
	}
}
