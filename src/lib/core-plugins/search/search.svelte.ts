import type { App } from '$lib/core/app';
import { catchError } from '$lib/core/errors/catch-error';
import type { Space } from '$lib/core/spaces/space';
import { RovingList } from '$lib/plugin-kit/roving-list.svelte';
import { getRows, type SearchRow } from './results';
import { createNote } from './shared/create-note';

export class HomeSearch {
	readonly list: RovingList<SearchRow>;
	private readonly _rows: SearchRow[];

	constructor(
		private readonly _app: App,
		private readonly _space: Space
	) {
		this._rows = $derived(getRows(_app.input.element.getValue(), _space.cachedNotes.getAll()));

		this.list = new RovingList({
			getItems: () => this._rows,
			onOpen: async (row) => {
				if (row.kind !== 'create') return;

				const [error] = await catchError(() => createNote(this._space.fs, row.title));

				if (error) this._app.input.messages.setError(this._app.errors.report(error));
			}
		});
	}
}
