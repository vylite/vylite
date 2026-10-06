import { reactiveList } from './shared/reactive-list.svelte';
import type { View } from './shared/types';

export class UiOverlay {
	private readonly _views = reactiveList<View>();

	set(view: View): () => void {
		return this._views.add(view);
	}

	get(): View | null {
		return this._views.getAll().at(-1) ?? null;
	}

	close(): void {
		this._views.removeLast();
	}
}
