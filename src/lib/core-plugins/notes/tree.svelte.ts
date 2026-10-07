import { sep } from '@tauri-apps/api/path';
import { SvelteSet } from 'svelte/reactivity';
import type { App } from '$lib/core/app';
import type { Space } from '$lib/core/spaces/space';
import type { CachedNote } from '$lib/core/spaces/space/cached-notes.svelte';
import { RovingList } from '$lib/plugin-kit/roving-list.svelte';
import { getRows, type TreeRow } from './rows';

export class NotesTree {
	readonly list: RovingList<TreeRow>;
	private readonly _openFolders = new SvelteSet<string>();
	private readonly _rows: TreeRow[];

	constructor(
		app: App,
		private readonly _space: Space
	) {
		this._rows = $derived(getRows(_space.cachedNotes.getAll(), this._openFolders));
		this.list = new RovingList({
			getItems: () => this._rows,
			onOpen: (row) => {
				if (row.kind === 'note') void app.input.dispatcher.run('editor', [row.path]);
				else if (row.isOpen) this._collapseFolder(row);
				else this._expandFolder(row);
			}
		});
	}

	getSelectedNote(): CachedNote | undefined {
		const row = this.list.getSelected();
		if (row?.kind !== 'note') return undefined;

		return this._space.cachedNotes.getAll().find((note) => note.path === row.path);
	}

	onKeydown(event: KeyboardEvent): void {
		const row = this.list.getSelected();
		const isSideArrow = event.key === 'ArrowLeft' || event.key === 'ArrowRight';

		if (!row || !isSideArrow || event.ctrlKey || event.metaKey || event.altKey) {
			this.list.onKeydown(event);
			return;
		}

		event.preventDefault();
		if (event.key === 'ArrowRight') this._expandFolder(row);
		else this._collapseFolder(row);
	}

	private _expandFolder(row: TreeRow): void {
		if (row.kind === 'folder') this._openFolders.add(row.path);
	}

	private _collapseFolder(row: TreeRow): void {
		if (row.kind === 'folder' && row.isOpen) {
			this._openFolders.delete(row.path);
			return;
		}

		const parent = row.path.slice(0, Math.max(0, row.path.lastIndexOf(sep())));
		const parentIndex = this._rows.findIndex(
			(other) => other.kind === 'folder' && other.path === parent
		);
		if (parentIndex !== -1) this.list.select(parentIndex);
	}
}
