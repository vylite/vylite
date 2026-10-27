import { reactiveList } from './shared/reactive-list.svelte';
import type { OpenPage } from './shared/types';

export class UiPages {
	private readonly _pages = reactiveList<OpenPage>();

	open(openPage: OpenPage): void {
		this._pages.add(openPage);
	}

	close(): void {
		this._pages.removeLast();
	}

	closeAll(): void {
		this._pages.clear();
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
