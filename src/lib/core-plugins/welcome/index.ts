import { Plugin } from '$lib/core/plugin/plugin';
import type { PluginManifest } from '$lib/core/plugin/types';
import type { Space } from '$lib/core/spaces/space';
import { svelteSlot } from '$lib/plugin-kit/svelte-slot';
import Welcome from './Welcome.svelte';

export const manifest: PluginManifest = { name: 'welcome', author: 'vylite' };

export default class WelcomePlugin extends Plugin<Space | null> {
	onload(): void {
		if (this.space) return;

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

				const welcome = { content: svelteSlot(Welcome, { app: this.app }) };
				remove = twig.set(welcome);
			}
		);
	}
}
