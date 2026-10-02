import { reactiveList } from '../reactive-list.svelte';
import type { SlotContent } from '../types';

export class UiRoot {
	private readonly _contents = reactiveList<SlotContent>();

	set(content: SlotContent): () => void {
		return this._contents.add(content);
	}

	getTop(): SlotContent | null {
		return this._contents.getAll().at(-1) ?? null;
	}

	getAll(): readonly SlotContent[] {
		return this._contents.getAll();
	}
}
