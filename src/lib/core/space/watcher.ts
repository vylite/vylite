import { watch, type UnwatchFn, type WatchEvent } from '@tauri-apps/plugin-fs';
import { getSpaceChanges, type SpaceChange } from './change';

export class SpaceWatcher {
	private readonly _listeners = new Set<(change: SpaceChange) => void>();
	private _unwatch: UnwatchFn | null = null;
	private _stopped = false;

	private constructor(private readonly _root: string) {}

	static async start(root: string): Promise<SpaceWatcher> {
		const watcher = new SpaceWatcher(root);
		watcher._unwatch = await watch(root, (event) => watcher._onWatchEvent(event), {
			recursive: true,
			delayMs: 100
		});
		return watcher;
	}

	onChange(listener: (change: SpaceChange) => void): () => void {
		this._listeners.add(listener);
		return () => this._listeners.delete(listener);
	}

	stop(): void {
		this._unwatch?.();
		this._unwatch = null;
		this._stopped = true;
	}

	private _onWatchEvent(event: WatchEvent): void {
		if (this._stopped) return;

		for (const change of getSpaceChanges(this._root, event))
			for (const listener of [...this._listeners]) listener(change);
	}
}
