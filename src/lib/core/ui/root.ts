import { reactiveList } from './shared/reactive-list.svelte';
import type { View } from './shared/types';

export class UiRoot {
	private readonly _views = reactiveList<View>();

	set(view: View): () => void {
		return this._views.add(view);
	}

	getTop(): View | null {
		return this._views.getAll().at(-1) ?? null;
	}

	getAll(): readonly View[] {
		return this._views.getAll();
	}
}
