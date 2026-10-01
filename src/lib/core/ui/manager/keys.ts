import { on } from 'svelte/events';
import type { UiManager } from '.';
import { isTextField } from '../text-field';

export class UiKeys {
	constructor(private readonly _ui: UiManager) {}

	listen(): () => void {
		return on(window, 'keydown', (event) => this._onKeydown(event));
	}

	private _onKeydown(event: KeyboardEvent): void {
		if (event.key !== 'Escape' || event.ctrlKey || event.metaKey || event.altKey) return;
		if (isTextField(event.target)) return;

		if (this._ui.overlay.get()) {
			event.preventDefault();
			this._ui.overlay.close();
			return;
		}

		if (this._ui.pages.isHome()) return;

		event.preventDefault();
		this._ui.pages.close();
	}
}
