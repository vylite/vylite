import { normalize } from '@tauri-apps/api/path';
import type { App } from '$lib/core/app';
import { catchError } from '$lib/core/errors/catch-error';
import type { ActiveSpace } from './active.svelte';
import { Space } from './space';
import type { Spaces } from '.';

export class SpaceSwitcher {
	constructor(
		private readonly _app: App,
		private readonly _spaces: Spaces,
		private readonly _active: ActiveSpace
	) {}

	async open(path: string): Promise<void> {
		await this._teardown();

		const space = await Space.open(await normalize(path));
		this._active.set(space);

		const [error] = await catchError(() => this._spaces.registry.recordSpaceOpen(space));
		if (error) this._app.errors.report(error);

		await this._app.plugins.loadAppPlugins(space);
		await this._app.plugins.loadSpacePlugins(space);
	}

	async close(): Promise<void> {
		await this._teardown();
		await this._app.plugins.loadAppPlugins(null);
	}

	private async _teardown(): Promise<void> {
		this._app.ui.pages.closeAll();
		await this._app.plugins.unloadAll();
		this._active.get()?.close();
		this._active.set(null);
	}
}
