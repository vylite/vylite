import type { App } from '$lib/core/app';
import type { Space } from '$lib/core/spaces/space';
import { Lifecycle } from './lifecycle.svelte';
import type { PluginManifest } from './types';

export abstract class Plugin<S extends Space | null = Space> extends Lifecycle {
	readonly id: string;

	constructor(
		public readonly manifest: PluginManifest,
		public readonly app: App,
		public readonly space: S
	) {
		super();
		this.id = `${manifest.author}.${manifest.name}`;
	}

	abstract onload(): void | Promise<void>;
}
