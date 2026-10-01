import type { App } from '$lib/core/app';
import { SpaceRegistry } from './registry.svelte';
import { SpaceSwitcher } from './switcher.svelte';

export class SpaceManager {
	readonly registry: SpaceRegistry;
	readonly switcher: SpaceSwitcher;

	constructor(app: App) {
		this.registry = new SpaceRegistry(app, this);
		this.switcher = new SpaceSwitcher(app, this);
	}
}
