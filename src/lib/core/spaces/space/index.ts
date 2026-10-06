import { catchError } from '$lib/core/errors/catch-error';
import type { SpaceChange } from './shared/change';
import { SpaceFs } from './fs';
import { CachedNotes } from './cached-notes.svelte';
import { SpaceWatcher } from './watcher';

export class Space {
	private constructor(
		readonly root: string,
		readonly fs: SpaceFs,
		readonly cachedNotes: CachedNotes,
		private readonly _watcher: SpaceWatcher
	) {}

	static async open(root: string): Promise<Space> {
		const fs = new SpaceFs(root);
		const watcher = await SpaceWatcher.start(root);

		const [error, cachedNotes] = await catchError(() => CachedNotes.load(fs, watcher));
		if (!cachedNotes) {
			watcher.stop();
			throw error;
		}

		return new Space(root, fs, cachedNotes, watcher);
	}

	close(): void {
		this._watcher.stop();
	}

	onChange(listener: (change: SpaceChange) => void): () => void {
		return this._watcher.onChange(listener);
	}
}
