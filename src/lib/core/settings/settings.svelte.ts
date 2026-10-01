import type { App } from '$lib/core/app';
import { VyliteError } from '$lib/core/errors/vylite-error';
import { JsonFile } from '$lib/core/storage/json-file.svelte';
import { getSettingsFile } from '$lib/core/storage/paths';
import { SettingsSchema, type Settings } from './schema';

export class AppSettings {
	private _file = $state.raw<JsonFile<Settings> | null>(null);

	constructor(private readonly _app: App) {}

	async load(): Promise<void> {
		this._file = await JsonFile.open(await getSettingsFile(), SettingsSchema, this._app.errors);
	}

	get(): Settings {
		return this._getFile().get();
	}

	async update(change: (settings: Settings) => Settings): Promise<void> {
		await this._getFile().update(change);
	}

	private _getFile(): JsonFile<Settings> {
		if (!this._file) throw new VyliteError('settings are not loaded.', 'SETTINGS_NOT_LOADED');
		return this._file;
	}
}
