import { untrack } from 'svelte';

export function reactiveList<T>() {
	let items = $state.raw<readonly T[]>([]);

	function removeWhere(predicate: (item: T) => boolean): void {
		items = untrack(() => items.filter((item) => !predicate(item)));
	}

	return {
		add(item: T): () => void {
			items = untrack(() => [...items, item]);
			return () => removeWhere((existing) => existing === item);
		},

		removeLast(): void {
			items = untrack(() => items.slice(0, -1));
		},

		removeWhere,

		clear(): void {
			items = [];
		},

		getAll: (): readonly T[] => items
	};
}
