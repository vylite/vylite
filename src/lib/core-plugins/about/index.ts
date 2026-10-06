import { getCurrentWindow } from '@tauri-apps/api/window';
import { Plugin } from '$lib/core/plugin/plugin';
import type { PluginManifest } from '$lib/core/plugin/types';
import type { Space } from '$lib/core/spaces/space';
import { svelteSlot } from '$lib/plugin-kit/svelte-slot';
import About from './About.svelte';

export const manifest: PluginManifest = { name: 'about', author: 'vylite' };

export default class AboutPlugin extends Plugin<Space | null> {
	onload(): void {
		const { commands } = this.app;

		this.addCleanup(
			commands.register({
				trigger: 'about',
				description: 'app info',
				run: () => ({ label: 'about', nest: { content: svelteSlot(About, { app: this.app }) } })
			})
		);

		this.addCleanup(
			commands.register({
				trigger: 'quit',
				description: 'close vylite',
				run: async () => {
					await getCurrentWindow().close();
				}
			})
		);
	}
}
