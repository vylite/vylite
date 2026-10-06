import type { Command } from '$lib/core/commands/types';
import { getSuggestions } from './shared/matches';
import type { InputController } from '.';

export class InputSuggestions {
	private _selectedIndex = $state(0);
	private readonly _all: Command[];

	constructor(private readonly _input: InputController) {
		this._all = $derived(getSuggestions(_input.element.getValue(), _input.dispatcher.getAll()));
	}

	getAll(): Command[] {
		return this._all;
	}

	getSelectedIndex(): number {
		const count = this.getAll().length;
		if (count === 0) return 0;

		return Math.min(this._selectedIndex, count - 1);
	}

	getSelected(): Command | undefined {
		return this.getAll()[this.getSelectedIndex()];
	}

	move(step: number): void {
		const last = this.getAll().length - 1;
		if (last < 0) return;

		const next = this.getSelectedIndex() + step;
		this._selectedIndex = Math.min(Math.max(next, 0), last);
	}

	reset(): void {
		this._selectedIndex = 0;
	}
}
