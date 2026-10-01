import { untrack } from 'svelte';
import { catchError } from '$lib/core/errors/catch-error';
import { VyliteError } from '$lib/core/errors/vylite-error';

export type CleanupFn = () => void | Promise<void>;

export abstract class Lifecycle {
	private _loaded = false;

	private readonly _cleanups: CleanupFn[] = [];
	private readonly _children: Lifecycle[] = [];

	onload(): void | Promise<void> {}
	onunload(): void | Promise<void> {}

	async load(): Promise<void> {
		if (this._loaded) return;
		this._loaded = true;

		await this.onload();

		for (const child of this._children) await child.load();
	}

	async unload(): Promise<void> {
		if (!this._loaded) return;
		this._loaded = false;

		const errors: unknown[] = [];

		for (const child of this._children.splice(0).reverse()) {
			const [error] = await catchError(() => child.unload());
			if (error) errors.push(error);
		}

		const [onunloadError] = await catchError(() => this.onunload());
		if (onunloadError) errors.push(onunloadError);

		for (const cleanup of this._cleanups.splice(0).reverse()) {
			const [error] = await catchError(cleanup);
			if (error) errors.push(error);
		}

		if (errors.length > 0)
			throw new VyliteError('unload failed.', 'LIFECYCLE_UNLOAD_FAILED', { cause: errors });
	}

	addCleanup(fn: CleanupFn): void {
		this._cleanups.push(fn);
	}

	watch<T>(read: () => T, onChange: (value: T) => void): void {
		this.addCleanup(
			$effect.root(() => {
				$effect(() => {
					const value = read();
					untrack(() => onChange(value));
				});
			})
		);
	}

	async addChild(child: Lifecycle): Promise<void> {
		this._children.push(child);
		if (this._loaded) await child.load();
	}
}
