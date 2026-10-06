import { catchError } from '$lib/core/errors/catch-error';
import { Plugin } from '$lib/core/plugin/plugin';
import type { PluginManifest } from '$lib/core/plugin/types';
import type { SpaceEntry } from '$lib/core/spaces/shared/saved-list';
import type { Space } from '$lib/core/spaces/space';
import type { Page } from '$lib/core/ui/shared/types';
import { RovingList } from '$lib/plugin-kit/roving-list.svelte';
import { svelteSlot } from '$lib/plugin-kit/svelte-slot';
import { getForgetCommand, getPickCommand, getRevealCommand, getStartCommand } from './commands';
import Spaces from './Spaces.svelte';

export const manifest: PluginManifest = { name: 'spaces', author: 'vylite' };

export default class SpacesPlugin extends Plugin<Space | null> {
	onload(): void {
		const { commands } = this.app;

		this.addCleanup(
			commands.register({
				trigger: 'spaces',
				description: 'switch space',
				run: () => this._getPage()
			})
		);

		if (this.space) return;

		this.addCleanup(commands.register(getStartCommand(this.app)));
		this.addCleanup(commands.register(getPickCommand(this.app)));
	}

	private _getPage(): Page {
		const list = new RovingList<SpaceEntry>({
			getItems: () => this.app.spaces.registry.getAll(),
			onOpen: (entry) => void this._open(entry)
		});

		return {
			label: 'spaces',
			nest: {
				content: svelteSlot(Spaces, { app: this.app, list }),
				onKeydown: (event) => list.onKeydown(event)
			},
			commands: [getPickCommand(this.app), getForgetCommand(this.app, list), getRevealCommand(list)]
		};
	}

	private async _open(entry: SpaceEntry): Promise<void> {
		if (entry.path === this.space?.root) return;

		const [error] = await catchError(() => this.app.spaces.switcher.open(entry.path));
		if (error) this.app.errors.report(error);
	}
}
