import { Plugin } from '$lib/core/plugin/plugin';
import type { PluginManifest } from '$lib/core/plugin/types';
import { svelteSlot } from '$lib/plugin-kit/svelte-slot';
import Hive from './Hive.svelte';

export const manifest: PluginManifest = { name: 'twig-hive', author: 'vylite' };

export default class TwigHivePlugin extends Plugin {
	onload(): void {
		const { pages, twig } = this.app.ui;
		const { element } = this.app.input;
		let remove: (() => void) | undefined;

		this.addCleanup(() => remove?.());
		this.watch(
			() => pages.isHome() && element.getValue().trim() === '',
			(isIdle) => {
				if (isIdle === (remove !== undefined)) return;

				remove?.();
				remove = undefined;
				if (!isIdle) return;

				const hive = { content: svelteSlot(Hive) };
				remove = twig.set(hive);
			}
		);
	}
}
