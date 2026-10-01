import type { App } from '$lib/core/app';
import type { Command } from '$lib/core/commands/types';
import { getGhost } from '../ghost';
import type { InputController } from '.';
import type { InputMessage } from './messages.svelte';

export type InputView = {
	value: string;
	message: InputMessage | null;
	focused: boolean;

	ghost: string;
	label: string;

	suggestions: Command[];
	selectedSuggestionIndex: number;
};

export class InputViewBuilder {
	constructor(
		private readonly _app: App,
		private readonly _input: InputController
	) {}

	get(): InputView {
		const { element, messages, suggestions, dispatcher } = this._input;
		const value = element.getValue();

		return {
			value,
			message: messages.get(),
			focused: element.isFocused(),

			ghost: getGhost(value, suggestions.getSelected(), dispatcher.getLineCommand()),
			label: this._app.ui.pages.getActive()?.page.label ?? '',

			suggestions: suggestions.getAll(),
			selectedSuggestionIndex: suggestions.getSelectedIndex()
		};
	}
}
