export type RovingListOptions<T> = {
	getItems: () => readonly T[];
	onOpen: (item: T) => void;
};

export class RovingList<T> {
	private _index = $state(0);

	constructor(private readonly _options: RovingListOptions<T>) {}

	getItems(): readonly T[] {
		return this._options.getItems();
	}

	getIndex(): number {
		const count = this.getItems().length;
		if (count === 0) return 0;

		return Math.min(this._index, count - 1);
	}

	getSelected(): T | undefined {
		return this.getItems()[this.getIndex()];
	}

	select(index: number): void {
		this._index = index;
	}

	move(step: number): void {
		const count = this.getItems().length;
		if (count === 0) return;

		this._index = Math.min(Math.max(this.getIndex() + step, 0), count - 1);
	}

	open(): void {
		const selected = this.getSelected();
		if (selected !== undefined) this._options.onOpen(selected);
	}

	onKeydown(event: KeyboardEvent): void {
		if (event.ctrlKey || event.metaKey || event.altKey) return;

		switch (event.key) {
			case 'ArrowDown':
			case 'ArrowUp':
				event.preventDefault();
				this.move(event.key === 'ArrowDown' ? 1 : -1);
				return;

			case 'Enter':
				event.preventDefault();
				this.open();
				return;
		}
	}
}
