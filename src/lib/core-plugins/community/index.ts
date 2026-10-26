import type { CommandTree } from '$lib/core/commands/types';
import { Plugin } from '$lib/core/plugin/plugin';
import type { PluginManifest } from '$lib/core/plugin/types';
import type { Space } from '$lib/core/spaces/space';
import { svelteSlot } from '$lib/plugin-kit/svelte-slot';
import Community from './Community.svelte';

export const manifest: PluginManifest = { name: 'community', author: 'vylite' };

export default class CommunityPlugin extends Plugin<Space | null> {
	getCommands(): CommandTree {
		return {
			community: {
				description: 'community links',
				run: () => ({
					label: 'community',
					nest: { content: svelteSlot(Community, { app: this.app }) }
				})
			}
		};
	}
}
