import { untrack } from 'svelte';
import type { UiManager } from '.';
import { reactiveList } from './shared/reactive-list.svelte';
import type { FocusedRailWindow, RailEntry, RailWindow } from './shared/types';

export class UiRail {
	private readonly _entries = reactiveList<RailEntry>();

	constructor(private readonly _ui: UiManager) {}

	add(window: RailWindow | FocusedRailWindow): () => void {
		if (window.focused) this.closeFocused();

		return this._entries.add({ ...window, openPage: untrack(() => this._ui.pages.getActive()) });
	}

	getVisible(): readonly RailEntry[] {
		const active = this._ui.pages.getActive();
		return this._entries.getAll().filter((entry) => entry.openPage === active);
	}

	getFocused(): FocusedRailWindow | null {
		return this.getVisible().find((entry) => entry.focused === true) ?? null;
	}

	closeFocused(): void {
		this._entries.removeWhere((entry) => entry.focused === true);
	}

	removeClosed(): void {
		const open = this._ui.pages.getAll();
		this._entries.removeWhere((entry) => entry.openPage !== null && !open.includes(entry.openPage));
	}
}
