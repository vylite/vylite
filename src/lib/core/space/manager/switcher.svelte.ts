import { normalize } from '@tauri-apps/api/path';
import type { App } from '$lib/core/app';
import { catchError } from '$lib/core/errors/catch-error';
import { Space } from '../space';
import { SpaceWatcher } from '../watcher';
import type { SpaceManager } from '.';

export class SpaceSwitcher {
	private _active = $state.raw<Space | null>(null);
	private _watcher: SpaceWatcher | null = null;

	constructor(
		private readonly _app: App,
		private readonly _spaces: SpaceManager
	) {}

	getActive(): Space | null {
		return this._active;
	}

	async open(path: string): Promise<void> {
		await this._teardown();

		const root = await normalize(path);
		this._watcher = await SpaceWatcher.start(root);
		const space = new Space(root, this._watcher);
		this._active = space;

		const [error] = await catchError(() => this._spaces.registry.recordSpaceOpen(space));
		if (error) this._app.errors.report(error);

		await this._app.plugins.loadAppPlugins(space);
		await this._app.plugins.loadSpacePlugins(space);
		// await this._app.plugins.loadCommunityPlugins(space);
	}

	async close(): Promise<void> {
		await this._teardown();
		await this._app.plugins.loadAppPlugins(null);
	}

	private async _teardown(): Promise<void> {
		this._app.ui.pages.closeAll();
		await this._app.plugins.unloadAll();
		this._watcher?.stop();
		this._watcher = null;
		this._active = null;
	}
}
