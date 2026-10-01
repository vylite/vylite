import { dirname } from '@tauri-apps/api/path';
import {
	exists,
	mkdir,
	readTextFile,
	watch,
	writeTextFile,
	type UnwatchFn
} from '@tauri-apps/plugin-fs';
import type { ZodType } from 'zod';
import type { ErrorReporter } from '$lib/core/errors/reporter';
import { VyliteError } from '$lib/core/errors/vylite-error';

export class JsonFile<T> {
	private _data: T;
	private _broken = false;
	private _lastWritten: string | null = null;
	private _writing: Promise<void> = Promise.resolve();
	private _unwatch: UnwatchFn | null = null;

	private constructor(
		private readonly _path: string,
		private readonly _schema: ZodType<T>,
		private readonly _errors: ErrorReporter
	) {
		this._data = $state.raw(_schema.parse({}));
	}

	static async open<T>(
		path: string,
		schema: ZodType<T>,
		errors: ErrorReporter
	): Promise<JsonFile<T>> {
		const file = new JsonFile(path, schema, errors);
		await file._load();
		return file;
	}

	close(): void {
		this._unwatch?.();
		this._unwatch = null;
	}

	get(): T {
		return this._data;
	}

	async update(change: (data: T) => T): Promise<void> {
		if (this._broken)
			throw new VyliteError('file is not valid JSON, fix it first.', 'JSON_FILE_BROKEN', {
				context: { path: this._path }
			});

		this._data = this._schema.parse(change(this._data));

		const text = JSON.stringify(this._data, null, '\t');
		const write = this._writing.then(() => this._write(text));

		this._writing = write.catch(() => undefined);
		await write;
	}

	private async _load(): Promise<void> {
		this._data = await this._read();

		const folder = await dirname(this._path);
		await mkdir(folder, { recursive: true });

		this._unwatch = await watch(
			folder,
			(event) => {
				if (event.paths.includes(this._path)) void this._reload();
			},
			{ delayMs: 100 }
		);
	}

	private async _reload(): Promise<void> {
		await this._writing;

		try {
			this._data = await this._read();
		} catch (error) {
			this._errors.report(error);
		}
	}

	private async _read(): Promise<T> {
		if (!(await exists(this._path))) {
			this._broken = false;
			return this._schema.parse({});
		}

		const text = await readTextFile(this._path);
		if (text === this._lastWritten) return this._data;

		const [error, json] = getJson(text);

		if (error) {
			if (!this._broken) this._reportBroken();
			this._broken = true;
			return this._data;
		}

		this._broken = false;
		return this._schema.parse(json);
	}

	private async _write(text: string): Promise<void> {
		this._lastWritten = text;

		await mkdir(await dirname(this._path), { recursive: true });
		await writeTextFile(this._path, text);
	}

	private _reportBroken(): void {
		this._errors.report(
			new VyliteError('file is not valid JSON.', 'JSON_FILE_BROKEN', {
				context: { path: this._path }
			})
		);
	}
}

function getJson(text: string): [unknown, undefined] | [undefined, unknown] {
	try {
		return [undefined, JSON.parse(text)];
	} catch (error) {
		return [error, undefined];
	}
}
