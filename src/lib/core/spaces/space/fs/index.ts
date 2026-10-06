import { dirname, join, sep } from '@tauri-apps/api/path';
import {
	exists,
	mkdir,
	readDir,
	readTextFile,
	remove,
	rename,
	stat,
	writeTextFile,
	type DirEntry,
	type FileInfo
} from '@tauri-apps/plugin-fs';
import { VyliteError } from '$lib/core/errors/vylite-error';
import { SpaceMd } from './md';

export class SpaceFs {
	readonly md: SpaceMd;

	constructor(private readonly _root: string) {
		this.md = new SpaceMd(this);
	}

	async read(path: string): Promise<string> {
		return readTextFile(await this._resolve(path));
	}

	async write(path: string, text: string): Promise<void> {
		const full = await this._resolve(path);

		await mkdir(await dirname(full), { recursive: true });
		await writeTextFile(full, text);
	}

	async list(path = ''): Promise<DirEntry[]> {
		return readDir(await this._resolve(path));
	}

	async exists(path: string): Promise<boolean> {
		return exists(await this._resolve(path));
	}

	async getStat(path: string): Promise<FileInfo> {
		return stat(await this._resolve(path));
	}

	async mkdir(path: string): Promise<void> {
		await mkdir(await this._resolve(path), { recursive: true });
	}

	async rename(from: string, to: string): Promise<void> {
		await rename(await this._resolve(from), await this._resolve(to));
	}

	async remove(path: string, options: { recursive?: boolean } = {}): Promise<void> {
		const full = await this._resolve(path);
		if (!(await exists(full))) return;

		await remove(full, { recursive: options.recursive ?? false });
	}

	private async _resolve(path: string): Promise<string> {
		const full = await join(this._root, path);

		if (full !== this._root && !full.startsWith(this._root + sep()))
			throw new VyliteError('path is outside the space.', 'SPACE_PATH_OUTSIDE', {
				context: { path }
			});

		return full;
	}
}
