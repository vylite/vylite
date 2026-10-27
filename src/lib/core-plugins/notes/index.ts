import type { CommandTree } from '$lib/core/commands/types';
import { Plugin } from '$lib/core/plugin/plugin';
import type { PluginManifest } from '$lib/core/plugin/types';
import type { Page } from '$lib/core/ui/shared/types';
import { svelteSlot } from '$lib/plugin-kit/svelte-slot';
import Notes from './Notes.svelte';
import { NotesTree } from './tree.svelte';

export const manifest: PluginManifest = { name: 'notes', author: 'vylite' };

export default class NotesPlugin extends Plugin {
	getCommands(): CommandTree {
		return {
			list: {
				description: 'browse notes',
				priority: 15,
				run: () => this._getPage()
			}
		};
	}

	private _getPage(): Page {
		const tree = new NotesTree(this.app, this.space);

		return {
			label: 'notes',
			layout: { width: 1120, height: { padding: 64 } },
			nest: {
				content: svelteSlot(Notes, { tree }),
				onKeydown: (event) => tree.onKeydown(event)
			},
			state: { tree },
			getSelection: () => tree.list.getSelected()?.path ?? null
		};
	}
}
