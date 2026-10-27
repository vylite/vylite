import type { UiManager } from '.';
import { reactiveList } from './shared/reactive-list.svelte';
import type { View } from './shared/types';

export class UiTwig {
	private readonly _views = reactiveList<View>();

	constructor(private readonly _ui: UiManager) {}

	set(view: View): () => void {
		return this._views.add(view);
	}

	getTop(): View | null {
		if (!this._ui.pages.isHome()) return null;

		return this._views.getAll().findLast((view) => !view.isHidden?.()) ?? null;
	}

	getAll(): readonly View[] {
		return this._views.getAll();
	}
}
