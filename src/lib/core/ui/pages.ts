import type { UiManager } from '.';
import { reactiveList } from './shared/reactive-list.svelte';
import type { OpenPage } from './shared/types';

export class UiPages {
	private readonly _pages = reactiveList<OpenPage>();

	constructor(private readonly _ui: UiManager) {}

	open(openPage: OpenPage): void {
		this._pages.add(openPage);
	}

	close(): void {
		this._pages.removeLast();
		this._ui.rail.removeClosed();
	}

	closeAll(): void {
		this._pages.clear();
		this._ui.rail.removeClosed();
	}

	getActive(): OpenPage | null {
		return this._pages.getAll().at(-1) ?? null;
	}

	getAll(): readonly OpenPage[] {
		return this._pages.getAll();
	}

	isHome(): boolean {
		return this._pages.getAll().length === 0;
	}
}
