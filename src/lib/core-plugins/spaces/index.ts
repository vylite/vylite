import { documentDir, join } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-dialog';
import { mkdir } from '@tauri-apps/plugin-fs';
import { revealItemInDir } from '@tauri-apps/plugin-opener';
import type { CommandTree } from '$lib/core/commands/types';
import { catchError } from '$lib/core/errors/catch-error';
import { VyliteError } from '$lib/core/errors/vylite-error';
import { Plugin } from '$lib/core/plugin/plugin';
import type { PluginManifest } from '$lib/core/plugin/types';
import type { SpaceEntry } from '$lib/core/spaces/shared/saved-list';
import type { Space } from '$lib/core/spaces/space';
import type { Page } from '$lib/core/ui/shared/types';
import { RovingList } from '$lib/plugin-kit/roving-list.svelte';
import { svelteSlot } from '$lib/plugin-kit/svelte-slot';
import Spaces from './Spaces.svelte';

export const manifest: PluginManifest = { name: 'spaces', author: 'vylite' };

type SpacesState = { list: RovingList<SpaceEntry> };

export default class SpacesPlugin extends Plugin<Space | null> {
	getCommands(): CommandTree {
		return {
			spaces: {
				description: 'switch space',
				run: () => this._getPage(),
				children: {
					pick: {
						description: 'add a folder',
						run: () => this._pick()
					},
					forget: {
						description: 'remove from this list',
						params: [{ placeholder: 'path' }],
						run: ([path], state: SpacesState) =>
							this._forget(path ?? state.list.getSelected()?.path)
					},
					reveal: {
						description: 'show in file manager',
						params: [{ placeholder: 'path' }],
						run: ([path], state: SpacesState) =>
							this._reveal(path ?? state.list.getSelected()?.path)
					}
				}
			},
			start: {
				description: 'make a space in Documents/vylite',
				isAvailable: () => this.space === null || 'a space is already open.',
				run: () => this._start()
			},
			pick: {
				description: 'add a folder',
				isAvailable: () => this.space === null || 'a space is already open.',
				run: () => this._pick()
			}
		};
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
			state: { list },
			getSelection: () => list.getSelected()?.path ?? null
		};
	}

	private async _start(): Promise<void> {
		const path = await join(await documentDir(), 'vylite');

		await mkdir(path, { recursive: true });
		await this.app.spaces.switcher.open(path);
	}

	private async _pick(): Promise<void> {
		const path = await open({
			directory: true,
			multiple: false,
			recursive: true,
			title: 'select space folder'
		});

		if (path) await this.app.spaces.switcher.open(path);
	}

	private async _forget(path: string | undefined): Promise<void> {
		if (!path) return;

		const entry = this.app.spaces.registry.getAll().find((saved) => saved.path === path);
		if (!entry) throw new VyliteError(`no saved space at "${path}".`, 'SPACES_NOT_SAVED');

		await this.app.spaces.registry.forgetSpace(entry);
	}

	private async _reveal(path: string | undefined): Promise<void> {
		if (path) await revealItemInDir(path);
	}

	private async _open(entry: SpaceEntry): Promise<void> {
		if (entry.path === this.space?.root) return;

		const [error] = await catchError(() => this.app.spaces.switcher.open(entry.path));
		if (error) this.app.errors.report(error);
	}
}
