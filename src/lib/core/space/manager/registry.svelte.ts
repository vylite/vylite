import type { App } from '$lib/core/app';
import { VyliteError } from '$lib/core/errors/vylite-error';
import { JsonFile } from '$lib/core/storage/json-file.svelte';
import { getSpacesFile } from '$lib/core/storage/paths';
import { SpaceListSchema, type SpaceEntry, type SpaceList } from '../list';
import type { Space } from '../space';
import type { SpaceManager } from '.';

export class SpaceRegistry {
	private _list = $state.raw<JsonFile<SpaceList> | null>(null);

	constructor(
		private readonly _app: App,
		private readonly _spaces: SpaceManager
	) {}

	async load(): Promise<void> {
		this._list = await JsonFile.open(await getSpacesFile(), SpaceListSchema, this._app.errors);
	}

	getAll(): SpaceEntry[] {
		const spaces = this._list?.get().spaces ?? [];
		return [...spaces].sort((first, second) => second.lastOpenedAt - first.lastOpenedAt);
	}

	async recordSpaceOpen(space: Space): Promise<void> {
		const now = Date.now();

		await this._getList().update((list) => {
			const existing = list.spaces.find((entry) => entry.path === space.root);
			const others = list.spaces.filter((entry) => entry.path !== space.root);

			return {
				spaces: [
					...others,
					{ path: space.root, createdAt: existing?.createdAt ?? now, lastOpenedAt: now }
				]
			};
		});
	}

	async forgetSpace(entry: SpaceEntry): Promise<void> {
		await this._getList().update((list) => ({
			spaces: list.spaces.filter((saved) => saved.path !== entry.path)
		}));

		if (this._spaces.switcher.getActive()?.root !== entry.path) return;

		const [next] = this.getAll();
		if (next) await this._spaces.switcher.open(next.path);
		else await this._spaces.switcher.close();
	}

	private _getList(): JsonFile<SpaceList> {
		if (!this._list) throw new VyliteError('spaces list is not loaded.', 'SPACE_LIST_NOT_LOADED');

		return this._list;
	}
}
