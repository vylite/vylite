import { reactiveList } from './shared/reactive-list.svelte';
import type { View } from './shared/types';

export class UiOverlay {
	private readonly _views = reactiveList<View>();

	set(view: View): () => void {
		return this._views.add(view);
	}

	getAll(): readonly View[] {
		return this._views.getAll();
	}

	getVisible(): readonly View[] {
		return this._views.getAll().filter((view) => !view.isHidden?.());
	}
}
