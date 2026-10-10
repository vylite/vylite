import type { App } from '$lib/core/app';
import { VyliteError } from '$lib/core/errors/vylite-error';
import { JsonFile } from '$lib/core/storage/json-file.svelte';
import { getAppearanceFile } from '$lib/core/storage/paths';
import { AppearanceSchema, type Appearance } from './schema';

export class AppAppearance {
	private _file = $state.raw<JsonFile<Appearance> | null>(null);

	constructor(private readonly _app: App) {}

	async load(): Promise<void> {
		this._file = await JsonFile.open(await getAppearanceFile(), AppearanceSchema, this._app.errors);
	}

	get(): Appearance {
		return this._getFile().get();
	}

	async update(change: (appearance: Appearance) => Appearance): Promise<void> {
		await this._getFile().update(change);
	}

	private _getFile(): JsonFile<Appearance> {
		if (!this._file) throw new VyliteError('appearance is not loaded.', 'APPEARANCE_NOT_LOADED');
		return this._file;
	}
}
