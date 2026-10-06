import { Plugin } from '$lib/core/plugin/plugin';
import type { PluginManifest } from '$lib/core/plugin/types';
import type { Space } from '$lib/core/spaces/space';
import { svelteSlot } from '$lib/plugin-kit/svelte-slot';
import Input from './Input.svelte';

export const manifest: PluginManifest = { name: 'input', author: 'vylite' };

export default class InputPlugin extends Plugin<Space | null> {
	onload(): void {
		this.addCleanup(
			this.app.ui.root.set({
				content: svelteSlot(Input, { app: this.app }),
				onKeydown: (event) => this.app.input.element.onUnhandledKeydown(event)
			})
		);
	}
}
