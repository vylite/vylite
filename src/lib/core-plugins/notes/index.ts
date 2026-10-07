import { Plugin } from '$lib/core/plugin/plugin';
import type { PluginManifest } from '$lib/core/plugin/types';
import type { Page } from '$lib/core/ui/shared/types';
import { svelteSlot } from '$lib/plugin-kit/svelte-slot';
import Notes from './Notes.svelte';
import { NotesTree } from './tree.svelte';

export const manifest: PluginManifest = { name: 'notes', author: 'vylite' };

export default class NotesPlugin extends Plugin {
	onload(): void {
		this.addCleanup(
			this.app.commands.register({
				trigger: 'list',
				description: 'browse notes',
				run: () => this._getPage()
			})
		);
	}

	private _getPage(): Page {
		const tree = new NotesTree(this.app, this.space);

		return {
			label: 'notes',
			nest: {
				content: svelteSlot(Notes, { tree }),
				onKeydown: (event) => tree.onKeydown(event)
			}
		};
	}
}
