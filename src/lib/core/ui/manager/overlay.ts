import { reactiveList } from '../reactive-list.svelte';
import type { SlotContent } from '../types';

export class UiOverlay {
	private readonly _contents = reactiveList<SlotContent>();

	set(content: SlotContent): () => void {
		return this._contents.add(content);
	}

	get(): SlotContent | null {
		return this._contents.getAll().at(-1) ?? null;
	}

	close(): void {
		this._contents.removeLast();
	}
}
