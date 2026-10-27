import { Plugin } from '$lib/core/plugin/plugin';
import type { PluginManifest } from '$lib/core/plugin/types';
import { svelteSlot } from '$lib/plugin-kit/svelte-slot';
import Hive from './Hive.svelte';

export const manifest: PluginManifest = { name: 'twig-hive', author: 'vylite' };

export default class TwigHivePlugin extends Plugin {
	onload(): void {
		const { element } = this.app.input;

		const hive = {
			content: svelteSlot(Hive),
			isHidden: () => element.getValue().trim() !== ''
		};
		this.addCleanup(this.app.ui.twig.set(hive));
	}
}
