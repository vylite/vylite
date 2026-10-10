import type { App } from '$lib/core/app';
import { AppearanceSchema, type Appearance } from '$lib/core/appearance/schema';
import { catchError } from '$lib/core/errors/catch-error';
import { RovingList } from '$lib/plugin-kit/roving-list.svelte';
import { ROWS, type Row } from './rows';

const DEFAULTS = AppearanceSchema.parse({});
const BIG_STEP = 4;

export class AppearancePanel {
	readonly list = new RovingList<Row>({
		getItems: () => ROWS,
		onOpen: (row) => this._open(row)
	});

	private _editing = $state(false);
	private _textBefore = '';

	constructor(private readonly _app: App) {}

	isEditing(): boolean {
		return this._editing;
	}

	onKeydown(event: KeyboardEvent): void {
		this.list.onKeydown(event);
		if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;

		const row = this.list.getSelected();
		if (!row) return;

		switch (event.key) {
			case 'ArrowLeft':
			case 'ArrowRight': {
				if (row.kind !== 'size') return;
				event.preventDefault();

				const direction = event.key === 'ArrowRight' ? 1 : -1;
				const step = direction * (event.shiftKey ? BIG_STEP : 1);
				const value = this._app.appearance.get()[row.key] + step;

				void this._set(row.key, Math.min(row.max, Math.max(0, value)));
				return;
			}

			case 'r':
				event.preventDefault();
				void this._set(row.key, DEFAULTS[row.key]);
				return;
		}
	}

	finishEditing(): void {
		this._editing = false;
	}

	cancelEditing(): void {
		this.setPlaceholder(this._textBefore);
		this._editing = false;
	}

	setPlaceholder(text: string): void {
		void this._set('placeholder', text);
	}

	private _open(row: Row): void {
		if (row.kind !== 'text') return;

		this._textBefore = this._app.appearance.get().placeholder;
		this._editing = true;
	}

	private async _set<Key extends Row['key']>(key: Key, value: Appearance[Key]): Promise<void> {
		const [error] = await catchError(() =>
			this._app.appearance.update((appearance) => ({ ...appearance, [key]: value }))
		);
		if (error) this._app.errors.report(error);
	}
}
