import { debounce } from 'lodash-es';
import type { App } from '$lib/core/app';
import { catchError } from '$lib/core/errors/catch-error';
import type { SpaceFs } from '$lib/core/spaces/space/fs';
import { renameToFirstLine } from './shared/note-files';

const SAVE_DELAY = 600;

export class NoteSaver {
	readonly saveLater = debounce((body: string) => this._save(body), SAVE_DELAY);
	private _lastWrite: Promise<void> = Promise.resolve();

	constructor(
		private readonly _app: App,
		private readonly _fs: SpaceFs,
		private readonly _path: string,
		private readonly _isNamedOnClose: boolean
	) {}

	finish(body: string): void {
		this.saveLater.flush();
		if (!this._isNamedOnClose) return;

		if (body.trim() === '') this._queue(() => this._fs.remove(this._path));
		else this._queue(() => renameToFirstLine(this._fs, this._path, body));
	}

	private _save(body: string): void {
		this._queue(() => this._fs.md.writeBody(this._path, body));
	}

	private _queue(write: () => Promise<void>): void {
		this._lastWrite = this._lastWrite.then(async () => {
			const [error] = await catchError(write);

			if (error) this._app.errors.report(error);
		});
	}
}
