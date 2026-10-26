import type { CommandTree } from '$lib/core/commands/types';
import { Plugin } from '$lib/core/plugin/plugin';
import type { PluginManifest } from '$lib/core/plugin/types';
import type { Space } from '$lib/core/spaces/space';
import { svelteSlot } from '$lib/plugin-kit/svelte-slot';
import Help from './Help.svelte';

export const manifest: PluginManifest = { name: 'help', author: 'vylite' };

export default class HelpPlugin extends Plugin<Space | null> {
	getCommands(): CommandTree {
		return {
			help: {
				description: 'all commands',
				run: () => ({ label: 'help', nest: { content: svelteSlot(Help, { app: this.app }) } })
			}
		};
	}
}
