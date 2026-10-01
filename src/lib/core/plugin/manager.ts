import { SvelteMap } from 'svelte/reactivity';
import type { App } from '$lib/core/app';
import { catchError } from '$lib/core/errors/catch-error';
import { VyliteError } from '$lib/core/errors/vylite-error';
import type { Space } from '$lib/core/space/space';
import { APP_PLUGINS, SPACE_PLUGINS } from '$lib/core-plugins/registry';
import { loadPlugin, unloadPlugin } from './load-plugin';
import type { Plugin } from './plugin';
import type { PluginModule } from './types';

export class PluginManager {
	private readonly _plugins = new SvelteMap<string, Plugin<Space | null>>();

	constructor(private readonly _app: App) {}

	async loadAppPlugins(space: Space | null): Promise<void> {
		for (const module of APP_PLUGINS)
			await this._add(() => new module.default(module.manifest, this._app, space));
	}

	async loadSpacePlugins(space: Space): Promise<void> {
		for (const module of SPACE_PLUGINS)
			await this._add(() => new module.default(module.manifest, this._app, space));
	}

	async unload(modules: PluginModule<Space | null>[]): Promise<void> {
		for (const module of [...modules].reverse()) {
			const plugin = this.getAll().find((loaded) => loaded instanceof module.default);
			if (plugin) await this._remove(plugin);
		}
	}

	async unloadAll(): Promise<void> {
		for (const plugin of this.getAll().reverse()) await this._remove(plugin);
	}

	get(id: string): Plugin<Space | null> | undefined {
		return this._plugins.get(id);
	}

	getAll(): Plugin<Space | null>[] {
		return [...this._plugins.values()];
	}

	private async _add(create: () => Plugin<Space | null>): Promise<void> {
		const [error] = await catchError(async () => {
			const plugin = create();

			if (this._plugins.has(plugin.id))
				throw new VyliteError('plugin id already loaded.', 'PLUGIN_ID_CONFLICT', {
					context: { id: plugin.id }
				});

			await loadPlugin(plugin, this._app.errors);
			this._plugins.set(plugin.id, plugin);
		});

		if (error) this._app.errors.report(error);
	}

	private async _remove(plugin: Plugin<Space | null>): Promise<void> {
		this._plugins.delete(plugin.id);

		const [error] = await catchError(() => unloadPlugin(plugin));
		if (error) this._app.errors.report(error);
	}
}
