import { sep } from '@tauri-apps/api/path';
import { SvelteMap } from 'svelte/reactivity';
import { catchError } from '$lib/core/errors/catch-error';
import type { SpaceChange } from './shared/change';
import { getMarkdown, type Frontmatter } from './shared/markdown';
import type { SpaceFs } from './fs';
import type { SpaceWatcher } from './watcher';

export type CachedNote = {
	path: string;
	name: string;
	frontmatter: Frontmatter | null;
	body: string;
	fileModified: number;
};

export class CachedNotes {
	private readonly _notes = new SvelteMap<string, CachedNote>();

	private constructor(private readonly _fs: SpaceFs) {}

	static async load(fs: SpaceFs, watcher: SpaceWatcher): Promise<CachedNotes> {
		const cachedNotes = new CachedNotes(fs);

		watcher.onChange((change) => void cachedNotes._onChange(change));
		await cachedNotes._sync('');

		return cachedNotes;
	}

	getAll(): CachedNote[] {
		return [...this._notes.values()];
	}

	private async _onChange(change: SpaceChange): Promise<void> {
		if (change.type === 'unknown') {
			this._notes.clear();
			await this._sync('');
			return;
		}

		if (change.type === 'rename') this._drop(change.from);
		await this._sync(change.path);
	}

	private async _sync(path: string): Promise<void> {
		if (path.split(sep()).some((part) => part.startsWith('.'))) return;

		const [, info] = await catchError(() => this._fs.getStat(path));
		if (!info) {
			this._drop(path);
			return;
		}

		if (info.isDirectory) {
			const entries = await this._fs.list(path);

			await Promise.all(
				entries.map((entry) => this._sync(path ? path + sep() + entry.name : entry.name))
			);
			return;
		}

		if (!path.toLowerCase().endsWith('.md')) return;

		const [, text] = await catchError(() => this._fs.read(path));
		if (text === undefined) {
			this._drop(path);
			return;
		}

		this._notes.set(path, {
			path,
			name: path.slice(path.lastIndexOf(sep()) + 1, -'.md'.length),
			...getMarkdown(text),
			fileModified: info.mtime?.getTime() ?? 0
		});
	}

	private _drop(path: string): void {
		for (const cached of this._notes.keys()) {
			if (cached === path || cached.startsWith(path + sep())) this._notes.delete(cached);
		}
	}
}
