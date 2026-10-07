import type { App } from '$lib/core/app';
import type { Space } from '$lib/core/spaces/space';
import { RovingList } from '$lib/plugin-kit/roving-list.svelte';
import { getRows, type SearchRow } from './results';

export class HomeSearch {
	readonly list: RovingList<SearchRow>;
	private readonly _rows: SearchRow[];

	constructor(app: App, space: Space) {
		this._rows = $derived(getRows(app.input.element.getValue(), space.cachedNotes.getAll()));

		this.list = new RovingList({
			getItems: () => this._rows,
			onOpen: (row) => {
				if (row.kind === 'create') void app.input.dispatcher.run('new', [row.title]);
				else void app.input.dispatcher.run('editor', [row.note.path]);
			}
		});
	}
}
