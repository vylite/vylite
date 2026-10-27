import type { CommandTree } from '$lib/core/commands/types';
import { Plugin } from '$lib/core/plugin/plugin';
import type { PluginManifest } from '$lib/core/plugin/types';
import type { Space } from '$lib/core/spaces/space';
import type { Page } from '$lib/core/ui/shared/types';
import { svelteSlot } from '$lib/plugin-kit/svelte-slot';
import Appearance from './Appearance.svelte';
import { applyLayout, removeLayout } from './layout';
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

		this.watch(
			() => {
				const { layout, edgeGap } = this.app.appearance.get();
				const { pages } = this.app.ui;
				const screen = pages.isHome()
					? layout.home
					: { ...layout.page, ...pages.getActive()?.page.layout };
				return { screen, edgeGap };
			},
			({ screen, edgeGap }) => applyLayout(screen, edgeGap)
		);
		this.addCleanup(removeLayout);
	}

	getCommands(): CommandTree {
		return {
			appearance: {
				description: 'sizes and spacing',
				priority: 10,
				run: () => this._getPage()
			}
		};
	}

	private _getPage(): Page {
		const panel = new AppearancePanel(this.app);

		return {
			label: 'appearance',
			nest: {
				content: svelteSlot(Appearance, { app: this.app, panel }),
				onKeydown: (event) => panel.onKeydown(event)
			},
			state: { panel }
		};
	}
}
