import { Plugin } from '$lib/core/plugin/plugin';
import type { PluginManifest } from '$lib/core/plugin/types';
import type { Space } from '$lib/core/spaces/space';
import { svelteSlot } from '$lib/plugin-kit/svelte-slot';
import Welcome from './Welcome.svelte';

export const manifest: PluginManifest = { name: 'welcome', author: 'vylite' };

export default class WelcomePlugin extends Plugin<Space | null> {
	onload(): void {
		if (this.space) return;

		const { element } = this.app.input;

		const welcome = {
			content: svelteSlot(Welcome, { app: this.app }),
			isHidden: () => element.getValue().trim() !== ''
		};
		this.addCleanup(this.app.ui.twig.set(welcome));
	}
}
