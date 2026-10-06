import type { App } from '$lib/core/app';
import { ActiveSpace } from './active.svelte';
import { SpaceRegistry } from './registry.svelte';
import type { Space } from './space';
import { SpaceSwitcher } from './switcher';

export class Spaces {
	readonly registry: SpaceRegistry;
	readonly switcher: SpaceSwitcher;
	private readonly _active: ActiveSpace;

	constructor(app: App) {
		this._active = new ActiveSpace();
		this.registry = new SpaceRegistry(app, this);
		this.switcher = new SpaceSwitcher(app, this, this._active);
	}

	getActive(): Space | null {
		return this._active.get();
	}
}
