import { Plugin } from '$lib/core/plugin/plugin';
import type { PluginManifest } from '$lib/core/plugin/types';
import type { Space } from '$lib/core/spaces/space';
import { svelteSlot } from '$lib/plugin-kit/svelte-slot';
import Appearance from './Appearance.svelte';
import { AppearancePanel } from './panel.svelte';
import { applySizes, removeSizes } from './rows';

export const manifest: PluginManifest = { name: 'appearance', author: 'vylite' };

export default class AppearancePlugin extends Plugin<Space | null> {
	onload(): void {
		this.watch(
			() => this.app.appearance.get(),
			(appearance) => applySizes(appearance)
		);
		this.addCleanup(removeSizes);

		this.addCleanup(
			this.app.commands.register({
				trigger: 'appearance',
				description: 'sizes and spacing',
				run: () => {
					this._openPanel();
				}
			})
		);
	}

	private _openPanel(): void {
		const panel = new AppearancePanel(this.app);

		this.app.ui.rail.add({
			title: 'appearance',
			content: svelteSlot(Appearance, { app: this.app, panel }),
			focused: true,
			onKeydown: (event) => panel.onKeydown(event)
		});
	}
}
