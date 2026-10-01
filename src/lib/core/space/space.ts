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
import type { SpaceChange } from './change';
import { getFrontmatterText, getMarkdown, type Frontmatter, type Markdown } from './markdown';
import type { SpaceWatcher } from './watcher';

export class Space {
	constructor(
		readonly root: string,
		private readonly _watcher: SpaceWatcher
	) {}

	onChange(listener: (change: SpaceChange) => void): () => void {
		return this._watcher.onChange(listener);
	}

	async read(path: string): Promise<string> {
		return readTextFile(await this._resolve(path));
	}

	async write(path: string, text: string): Promise<void> {
		if (path.toLowerCase().endsWith('.md'))
			throw new VyliteError(
				'use writeBody or updateFrontmatter for .md files.',
				'SPACE_MARKDOWN_WRITE',
				{ context: { path } }
			);

		await this._writeText(path, text);
	}

	async readMarkdown(path: string): Promise<Markdown> {
		return getMarkdown(await this.read(path));
	}

	async writeBody(path: string, body: string): Promise<void> {
		const text = (await this.exists(path)) ? await this.read(path) : '';
		const current = getMarkdown(text);
		const keptFrontmatter = text.slice(0, text.length - current.body.length);

		await this._writeText(path, keptFrontmatter + body);
	}

	async updateFrontmatter(
		path: string,
		change: (frontmatter: Frontmatter) => Frontmatter
	): Promise<void> {
		const { frontmatter, body } = getMarkdown(await this.read(path));

		if (!frontmatter)
			throw new VyliteError('frontmatter is not valid YAML.', 'SPACE_FRONTMATTER_INVALID', {
				context: { path }
			});

		await this._writeText(path, getFrontmatterText(change(frontmatter)) + body);
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

	private async _writeText(path: string, text: string): Promise<void> {
		const full = await this._resolve(path);

		await mkdir(await dirname(full), { recursive: true });
		await writeTextFile(full, text);
	}

	private async _resolve(path: string): Promise<string> {
		const full = await join(this.root, path);

		if (full !== this.root && !full.startsWith(this.root + sep()))
			throw new VyliteError('path is outside the space.', 'SPACE_PATH_OUTSIDE', {
				context: { path }
			});

		return full;
	}
}
